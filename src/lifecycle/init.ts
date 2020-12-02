export const zzkfjkdjrtkdr = 'sdklfjgklsdfjg'

// import { interpret } from 'xstate'
// import { machine } from './machine'

// export const lifecycleService = interpret(machine, { devTools: true })
//   .onTransition(state => console.log('speedy state', state.value))
//   .start()

// export const initLifecycle = () => {
//   console.log('init lifecycle', lifecycleService)
// }

// const __TRUE_editorPreSetup = async () => {
//   const monaco: MonacoT = await monacoReact.init()
//   setCompilerAndDiagnosticOptions(monaco)
//   addHighlighting(monaco)
//   await loadFiles(monaco)
//   registerAllExports()
// }

// const __TRUE_getEditorP = async () => {
//   return ('edittoaoaffrrrraarrrr' as any) as EditorT
// }

// const __TRUE_setupEditor = async (editor: EditorT) => {
//   const monaco: MonacoT = await monacoReact.init()
//   setAllInstances({ editor, monaco })
//   addHighlightingToEditor(editor)

//   chain()
//     .then(() => editor.getModel()?.getLinesContent()!)
//     .then(getAllTokens)
//     .then(tokens => {
//       return tokens
//         .map((token, index) => {
//           const prevLine = index > 0 ? tokens[index - 1].line : -1

//           if (token.line === prevLine) {
//             return undefined
//           }

//           return new CoolZone(token, 3, TextZoneZooone, TextZoneLoading)
//         })
//         .filter(a => a)
//     })
//     .tap(result => console.log('big tap', result))

//   compileAndEval(editor)
// }

// const editorPreSetup = async () => {
//   console.log('editor presetup-ing')
//   return { monaco: ('moasjdhjsdhfnaaaaccoooooo' as any) as MonacoT }
// }

// const getEditorP = async () => {
//   return ('edittoaoaffrrrraarrrr' as any) as EditorT
// }

// const doPostEditorSetup = async (monaco: MonacoT, editor: EditorT) => {
//   console.log('editor POSTsetupEditorr-ingg')
//   return { setupEditorResult: 'nothing to see here' }
// }

// const ww = () =>
//   new Promise((resolve, reject) => {
//     setTimeout(resolve, 1000)
//   })

// let _service: any

// export const initLifecycle = async () => {
//   // const service = interpret(machine, { devTools: true })

//   const service = interpret(machine, { devTools: true })
//     .onTransition(state => console.log('speedy state', state.value))
//     .start()

//   _service = service

//   return service

// await ww()
// await ww()

// const { monaco } = await preEditorSetup()
// service.send({
//   type: 'PRE_EDITOR_SETUP_DONE',
//   monaco: monaco,
// })

// await ww()
// await ww()

// const editor = await getEditorP()
// service.send({
//   type: 'EDITOR_CREATED',
//   editor: editor,
// })

// console.log('service', service.state)

// postEditorSetup(service.state.context.monaco!, service.state.context.editor!)

// return service
// } // with `interpret` from xstate
