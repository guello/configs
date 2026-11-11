import { type ESTree, type Rule, defineRule } from '@oxlint/plugins'

type FunctionNode = ESTree.ArrowFunctionExpression | ESTree.Function

interface Options {
  allowExported?: boolean
}

interface Candidate {
  node: FunctionNode
  returnType: ESTree.TSTypeAnnotation
  /** The module-scope name, `true` for inline exports and `false` for local functions. */
  exported: boolean | string | undefined
}

const EXPORT_PATH = new Set<string>([
  'ArrayExpression',
  'ClassBody',
  'ClassDeclaration',
  'ClassExpression',
  'MethodDefinition',
  'ObjectExpression',
  'Property',
  'PropertyDefinition',
  'TSAsExpression',
  'TSSatisfiesExpression',
  'VariableDeclaration',
  'VariableDeclarator',
])

function includesUndefined(type: ESTree.TSType): boolean {
  if (type.type === 'TSUndefinedKeyword') return true
  if (type.type === 'TSUnionType') return type.types.some(includesUndefined)
  if (type.type !== 'TSTypeReference') return false
  const [awaited] = type.typeArguments?.params ?? []
  return type.typeName.type === 'Identifier' && type.typeName.name === 'Promise' && !!awaited
    ? includesUndefined(awaited)
    : false
}

function isRequired(type: ESTree.TSType) {
  return (
    type.type === 'TSTypePredicate' || type.type === 'TSNeverKeyword' || includesUndefined(type)
  )
}

function keyName(node: ESTree.Node) {
  return node.type === 'Identifier' || node.type === 'PrivateIdentifier' ? node.name : undefined
}

function isOverloadedMethod(node: FunctionNode) {
  const { parent } = node
  if (parent.type !== 'MethodDefinition' || parent.computed) return false
  const name = keyName(parent.key)
  return (parent.parent as ESTree.ClassBody).body.some(
    member =>
      member.type === 'MethodDefinition' &&
      member.value.type === 'TSEmptyBodyFunctionExpression' &&
      keyName(member.key) === name,
  )
}

function exportTarget(node: FunctionNode) {
  let name = node.type === 'FunctionDeclaration' ? node.id?.name : undefined
  for (let current = node.parent; current; current = current.parent) {
    if (current.type === 'ExportNamedDeclaration' || current.type === 'ExportDefaultDeclaration') {
      return true
    }
    if (current.type === 'Program') return name
    if (!EXPORT_PATH.has(current.type)) return false
    if (current.type === 'VariableDeclarator' && current.id.type === 'Identifier') {
      name = current.id.name
    }
    if (current.type === 'ClassDeclaration' && current.id) name = current.id.name
  }
  return false
}

function binding(node: FunctionNode) {
  if (node.type !== 'ArrowFunctionExpression' && node.id) {
    return { declaration: node, name: node.id.name }
  }
  const { parent } = node
  return parent.type === 'VariableDeclarator'
    ? { declaration: parent, name: keyName(parent.id) }
    : { declaration: undefined, name: undefined }
}

function contains(outer: ESTree.Node, inner: { range: [number, number] }) {
  return inner.range[0] >= outer.range[0] && inner.range[1] <= outer.range[1]
}

export const noInferrableReturnType: Rule = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Omit return types that TypeScript can infer.',
    },
    hasSuggestions: true,
    messages: {
      inferrable: 'Remove the return type, and let TypeScript infer it.',
      remove: 'Remove the return type.',
    },
    schema: [
      {
        type: 'object',
        properties: { allowExported: { type: 'boolean' } },
        additionalProperties: false,
      },
    ],
  },
  createOnce(context) {
    const candidates: Candidate[] = []
    const declaredOverloads = new Set<string>()
    const exportedNames = new Set<string>()
    const thisMembers: ESTree.MemberExpression[] = []

    // A function that calls itself can need its type, because TypeScript cannot infer a circular return type.
    const isRecursive = (node: FunctionNode) => {
      const { declaration, name } = binding(node)
      const variable =
        declaration &&
        context.sourceCode.getDeclaredVariables(declaration).find(item => item.name === name)
      if (variable?.references.some(reference => contains(node, reference.identifier))) return true
      const { parent } = node
      if (parent.type !== 'MethodDefinition' || parent.computed) return false
      const method = keyName(parent.key)
      return thisMembers.some(
        member => contains(node, member) && keyName(member.property) === method,
      )
    }

    const check = (node: FunctionNode) => {
      const { body, returnType } = node
      if (!body || !returnType || isRequired(returnType.typeAnnotation)) return
      if (node.type === 'FunctionDeclaration' && node.id && declaredOverloads.has(node.id.name)) {
        return
      }
      if (isOverloadedMethod(node)) return
      candidates.push({ node, returnType, exported: exportTarget(node) })
    }

    return {
      before() {
        candidates.length = 0
        declaredOverloads.clear()
        exportedNames.clear()
        thisMembers.length = 0
      },
      TSDeclareFunction(node) {
        if (node.id) declaredOverloads.add(node.id.name)
      },
      MemberExpression(node) {
        if (node.object.type === 'ThisExpression' && !node.computed) thisMembers.push(node)
      },
      ExportSpecifier(node) {
        if (node.parent.type === 'ExportNamedDeclaration' && !node.parent.source) {
          const name = keyName(node.local)
          if (name) exportedNames.add(name)
        }
      },
      ExportDefaultDeclaration(node) {
        if (node.declaration.type === 'Identifier') exportedNames.add(node.declaration.name)
      },
      ArrowFunctionExpression: check,
      FunctionDeclaration: check,
      FunctionExpression: check,
      'Program:exit'() {
        const { allowExported = false } = (context.options[0] ?? {}) as Options
        for (const { node, returnType, exported } of candidates) {
          if (allowExported) {
            if (exported === true) continue
            if (typeof exported === 'string' && exportedNames.has(exported)) continue
          }
          if (isRecursive(node)) continue
          context.report({
            node: returnType,
            messageId: 'inferrable',
            suggest: [{ messageId: 'remove', fix: fixer => fixer.remove(returnType) }],
          })
        }
      },
    }
  },
})
