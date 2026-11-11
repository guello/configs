import { type ESTree, type Rule, type SourceCode, defineRule } from '@oxlint/plugins'

type FunctionNode = ESTree.ArrowFunctionExpression | ESTree.Function

const FUNCTION_TYPES = new Set<string>([
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
])
const THIS_SCOPES = new Set<string>(['FunctionDeclaration', 'FunctionExpression'])
const CLASS_MEMBERS = new Set<string>(['AccessorProperty', 'PropertyDefinition', 'StaticBlock'])
const KEYED = new Set<string>([
  'AccessorProperty',
  'MethodDefinition',
  'Property',
  'PropertyDefinition',
  'TSMethodSignature',
  'TSPropertySignature',
])

function isFunction(node: ESTree.Node): node is FunctionNode {
  return FUNCTION_TYPES.has(node.type)
}

function hasEnclosingFunction(node: ESTree.Node) {
  for (let current = node.parent; current; current = current.parent) {
    if (isFunction(current)) return true
  }
  return false
}

function isModuleScope(declaration: ESTree.VariableDeclaration) {
  const { parent } = declaration
  if (parent.type === 'Program') return true
  return parent.type === 'ExportNamedDeclaration' && parent.parent.type === 'Program'
}

function thisScope(node: ESTree.Node): ESTree.Function | undefined {
  for (let current = node.parent; current; current = current.parent) {
    if (CLASS_MEMBERS.has(current.type)) return undefined
    if (THIS_SCOPES.has(current.type)) return current as ESTree.Function
  }
  return undefined
}

function readsModuleThis(node: ESTree.Node) {
  for (let current = node.parent; current; current = current.parent) {
    if (CLASS_MEMBERS.has(current.type) || THIS_SCOPES.has(current.type)) return false
  }
  return true
}

function toDeclaration(
  sourceCode: SourceCode,
  name: string,
  arrow: ESTree.ArrowFunctionExpression,
) {
  const { text } = sourceCode
  const arrowToken = sourceCode.getTokenBefore(arrow.body, token => token.value === '=>')
  const first = sourceCode.getFirstToken(arrow)
  const start =
    arrow.async && first ? (sourceCode.getTokenAfter(first)?.range[0] ?? 0) : arrow.range[0]
  const head = text.slice(start, arrowToken?.range[0]).trimEnd()
  const params = head.startsWith('(') || head.startsWith('<') ? head : `(${head})`
  const body =
    arrow.body.type === 'BlockStatement'
      ? sourceCode.getText(arrow.body)
      : `{\n  return ${sourceCode.getText(arrow.body)}\n}`
  return `${arrow.async ? 'async ' : ''}function ${name}${params} ${body}`
}

function readsArguments(node: ESTree.Node & { name: string }) {
  if (node.name !== 'arguments') return false
  const parent = node.parent as ESTree.Node & {
    computed?: boolean
    key?: unknown
    property?: unknown
    shorthand?: boolean
  }
  if (parent.computed) return true
  if (parent.type === 'MemberExpression') return parent.property !== node
  if (KEYED.has(parent.type)) return parent.key !== node || parent.shorthand === true
  return true
}

function hasThisParameter(node: ESTree.Function) {
  return node.params.some(param => param.type === 'Identifier' && param.name === 'this')
}

function hasAssertionSignature(node: ESTree.Function) {
  const predicate = node.returnType?.typeAnnotation
  return predicate?.type === 'TSTypePredicate' && predicate.asserts
}

function hasOverloads(node: ESTree.Function) {
  const { parent } = node
  if (parent.type !== 'BlockStatement' || !node.id) return false
  const name = node.id.name
  return parent.body.some(
    statement => statement.type === 'TSDeclareFunction' && statement.id?.name === name,
  )
}

export const funcStyle: Rule = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Use `function` declarations at module scope and `const` arrows inside function bodies.',
    },
    messages: {
      defaultArrow: 'Write the default export as a named `export default function`.',
      moduleArrow: 'Define `{{name}}` with a `function` declaration at module scope.',
      nestedArrow: 'Define `{{name}}` as a `const` arrow inside a function body.',
    },
    fixable: 'code',
    schema: [],
  },
  createOnce(context) {
    const thisUsers = new Set<ESTree.Function>()
    const moduleThisReads: ESTree.Node[] = []

    const markThisScope = (node: ESTree.Node) => {
      const scope = thisScope(node)
      if (scope) thisUsers.add(scope)
      else if (readsModuleThis(node)) moduleThisReads.push(node)
    }

    const canDeclare = (
      declaration: ESTree.VariableDeclaration,
      arrow: ESTree.ArrowFunctionExpression,
    ) => {
      if (declaration.declarations.length !== 1) return false
      const comments = context.sourceCode.getAllComments()
      if (
        comments.some(
          item => item.range[0] >= declaration.range[0] && item.range[1] <= arrow.range[0],
        )
      ) {
        return false
      }
      return !moduleThisReads.some(
        node => node.range[0] >= arrow.range[0] && node.range[1] <= arrow.range[1],
      )
    }

    const usedBeforeDefinition = (node: ESTree.Function) => {
      const variable = context.sourceCode
        .getDeclaredVariables(node)
        .find(item => item.name === node.id?.name)
      return (
        variable?.references.some(reference => reference.identifier.range[0] < node.range[0]) ??
        false
      )
    }

    return {
      before() {
        thisUsers.clear()
        moduleThisReads.length = 0
      },
      ThisExpression: markThisScope,
      Identifier(node) {
        if (readsArguments(node)) markThisScope(node)
      },
      'VariableDeclarator:exit'(node) {
        const { id, init, parent } = node
        if (
          id.type !== 'Identifier' ||
          id.typeAnnotation ||
          parent.type !== 'VariableDeclaration'
        ) {
          return
        }
        if (parent.kind !== 'const' || !init) return
        if (init.type === 'ArrowFunctionExpression') {
          if (isModuleScope(parent)) {
            context.report({
              node,
              messageId: 'moduleArrow',
              data: { name: id.name },
              fix: canDeclare(parent, init)
                ? fixer =>
                    fixer.replaceText(parent, toDeclaration(context.sourceCode, id.name, init))
                : undefined,
            })
          }
          return
        }
        if (init.type !== 'FunctionExpression' || init.generator || thisUsers.has(init)) return
        if (isModuleScope(parent)) {
          context.report({ node, messageId: 'moduleArrow', data: { name: id.name } })
          return
        }
        if (hasThisParameter(init) || hasAssertionSignature(init) || !hasEnclosingFunction(node)) {
          return
        }
        context.report({ node, messageId: 'nestedArrow', data: { name: id.name } })
      },
      'FunctionDeclaration:exit'(node) {
        if (!node.id || node.generator || !hasEnclosingFunction(node)) return
        if (
          thisUsers.has(node) ||
          hasThisParameter(node) ||
          hasAssertionSignature(node) ||
          hasOverloads(node)
        ) {
          return
        }
        if (usedBeforeDefinition(node)) return
        context.report({ node: node.id, messageId: 'nestedArrow', data: { name: node.id.name } })
      },
      ExportDefaultDeclaration(node) {
        if (node.declaration.type === 'ArrowFunctionExpression') {
          context.report({ node, messageId: 'defaultArrow' })
        }
      },
    }
  },
})
