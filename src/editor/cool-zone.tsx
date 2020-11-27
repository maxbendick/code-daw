import { addContentWidget } from './add-content-widget'
import { addDecorations } from './add-decorations'
import { addViewZone } from './add-view-zone'

export class CoolZone {
  private _lineNumber: number
  private numLines: number
  private viewZoneResult: ReturnType<typeof addViewZone>
  private contentWidgetResult: ReturnType<typeof addContentWidget>
  private decorationResult: ReturnType<typeof addDecorations>

  constructor(
    initialLineNumber: number,
    initialNumLines: number,
    content: ReturnType<React.FC>,
  ) {
    this._lineNumber = initialLineNumber
    this.numLines = initialNumLines

    this.viewZoneResult = addViewZone(this._lineNumber, this.numLines)
    this.contentWidgetResult = addContentWidget(
      this._lineNumber + 1,
      this.numLines,
      content,
    )
    this.decorationResult = addDecorations(this._lineNumber)
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
