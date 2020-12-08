import {
  createSourceFile,
  ScriptTarget,
  SourceFile,
  Statement,
  SyntaxKind,
} from 'typescript'

const getExportNames = (sourceFile: SourceFile) => {
  return sourceFile.statements
    .filter(statement => {
      return statement.kind === SyntaxKind.VariableStatement
    })
    .filter(variableStatement => {
      const modifiers = variableStatement.modifiers ?? []
      return modifiers.some(
        modifier => modifier.kind === SyntaxKind.ExportKeyword,
      )
    })
    .map(statement => {
      const name = (statement as any).declarationList.declarations[0].name
        .escapedText

      const start = sourceFile.getLineAndCharacterOfPosition(
        statement.getStart(),
      )
      const end = sourceFile.getLineAndCharacterOfPosition(statement.getEnd())

      return {
        name,
        fnName: getFnName(statement),
        start,
        end,
        text: statement.getText(),
        // statement,
        // modifierStart,
        // modifierEnd,
      }
    })
}

const getFnName = (statement: Statement) => {
  return statement
    .getChildren()
    .flatMap(child1 => child1.getChildren())
    .flatMap(child2 => child2.getChildren())
    .flatMap(child3 => child3.getChildren())
    .flatMap(child4 => child4.getChildren())
    .find(child4 => child4.kind === SyntaxKind.Identifier)
    ?.getText()
}

export const parserExperiment = (source: string) => {
  // console.log('source', source)
  const root = createSourceFile('test.ts', source, ScriptTarget.Latest, true)
  // console.log('ts-parser root node', root)

  console.log('-/-/-/-/-/-/-/-/-/-/-/-/-/-/')
  console.log('nameesss', getExportNames(root))
  console.log('-/-/-/-/-/-/-/-/-/-/-/-/-/-/')
}

// for (const statement of root.statements) {
//   // console.log('statement', statement)

//   // if (statement.kind === SyntaxKind.ImportDeclaration) {}

//   if (statement.kind === SyntaxKind.VariableStatement) {
//     for (const modifier of statement.modifiers ?? []) {
//       const b = modifier.kind === SyntaxKind.ExportKeyword
//       if (b) {
//         console.log(
//           'export!!!',
//           statement,
//           (statement as any).declarationList.declarations[0].name.escapedText,
//         )

//         console.log(
//           '(statement as any).declarationList.declarations[0]',
//           (statement as any).declarationList.declarations[0],
//         )
//         // console.log('children', statement.getChildren())
//       }
//     }

//     // console.log('children', statement.getChildren())

//     // if (statement.getChildAt(0).kind === SyntaxKind.ImportKeyword) {
//     //   console.log('import keyword!')
//     // }
//   }
// }

// const non = root.statements[8]
// console.log('9th', non)
// // console.log('non.getFullText()', non.getFullText())

// console.warn('--------------------------------------------')

// throw new Error('done!')
