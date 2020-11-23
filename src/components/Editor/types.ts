import * as MonacoPackage from 'monaco-editor'
import './Editor.css'

export type EditorT = MonacoPackage.editor.IEditorOverrideServices
export type IViewZoneChangeAccessor = MonacoPackage.editor.IViewZoneChangeAccessor
export type IViewZone = MonacoPackage.editor.IViewZone
export type IContentWidget = MonacoPackage.editor.IContentWidget
export type IContentWidgetPosition = MonacoPackage.editor.IContentWidgetPosition

export type Monaco = typeof MonacoPackage
