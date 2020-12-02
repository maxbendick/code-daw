import * as React from 'react'
import {
  ZoneComponent,
  ZoneLoadingComponent,
} from '../components/Editor/zone-component'
import { TokenPlace } from '../editor/parsing/ts-parser'
import { addContentWidget } from './add-content-widget'
import { addDecorations } from './add-decorations'
import { addViewZone } from './add-view-zone'
import { registerFinishedLoadingListener } from './finished-loading-listeners'
import { EditorT, MonacoT } from './types'

export class CoolZone {
  private _lineNumber: number
  private numLines: number
  private viewZoneResult: ReturnType<typeof addViewZone>
  private contentWidgetResult: ReturnType<typeof addContentWidget>
  private decorationResult: ReturnType<typeof addDecorations>

  constructor(
    monaco: MonacoT,
    editor: EditorT,
    token: TokenPlace,
    initialNumLines: number,
    ZoneComponentArg: ZoneComponent,
    ZoneLoadingComponentArg: ZoneLoadingComponent,
  ) {
    this._lineNumber = token.line + 1
    this.numLines = initialNumLines

    this.viewZoneResult = addViewZone(
      monaco,
      editor,
      this._lineNumber,
      this.numLines,
    )

    // TODO inject interactable on eval?
    this.contentWidgetResult = addContentWidget(
      monaco,
      editor,
      this._lineNumber + 1,
      this.numLines,
      <ZoneLoadingComponentArg token={token} />,
    )

    registerFinishedLoadingListener(() => {
      const interactable = (window as any).codeDawVars[token.varName]
        ._interactable

      this.contentWidgetResult.updateContent(
        <ZoneComponentArg token={token} interactable={interactable} />,
      )
    })

    this.decorationResult = addDecorations(monaco, editor, this._lineNumber)
  }

  get lineNumber(): number {
    return this._lineNumber
  }

  set lineNumber(lineNumber: number) {
    this._lineNumber = lineNumber

    this.viewZoneResult.updateAfterLineNumber(this._lineNumber)
    this.contentWidgetResult.updateLineNumber(this._lineNumber + 1)
    this.decorationResult.moveDecoration(this._lineNumber)
  }

  destroy() {
    this.viewZoneResult.destroy()
    this.contentWidgetResult.destroy()
    this.decorationResult.destroy()
  }
}
