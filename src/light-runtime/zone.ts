import { Subject } from 'rxjs'
import { addDecorations } from '../editor/add-decorations'
import { addViewZone } from '../editor/add-view-zone'
import {
  EditorT,
  IContentWidget,
  IContentWidgetPosition,
  MonacoT
} from '../editor/types'

const addContentWidget = (
  monaco: MonacoT,
  editor: EditorT,
  initialLineNumber: number,
  node: HTMLElement,
  onDestroy: () => void,
) => {
  const id = Math.random().toString(36).substring(7)

  const position: IContentWidgetPosition = {
    position: {
      lineNumber: initialLineNumber,
      column: 0,
    },
    preference: [
      monaco.editor.ContentWidgetPositionPreference.ABOVE,
      monaco.editor.ContentWidgetPositionPreference.BELOW,
    ],
  }

  var contentWidget: IContentWidget = {
    getId: function () {
      return id
    },
    getDomNode: function () {
      return node
    },
    getPosition: function () {
      return position
    },
  }
  editor.addContentWidget(contentWidget)

  return {
    updateLineNumber: (lineNumber: number) => {
      ;(position.position as any).lineNumber = lineNumber
      editor.layoutContentWidget(contentWidget)
    },
    destroy: () => {
      // ReactDOM.unmountComponentAtNode(domNode)
      editor.removeContentWidget(contentWidget)
      onDestroy()
    },
  }
}

export class Zone {
  private _lineNumber: number
  private numLines: number
  private viewZoneResult: ReturnType<typeof addViewZone>
  private contentWidgetResult: ReturnType<typeof addContentWidget>
  private decorationResult: ReturnType<typeof addDecorations>

  send$ = new Subject<any>()

  constructor(
    monaco: MonacoT,
    editor: EditorT,
    lineNumber: number,
    initialNumLines: number,
    domNode: HTMLElement,
    onDestroy: () => void,
  ) {
    this._lineNumber = lineNumber
    this.numLines = initialNumLines

    this.viewZoneResult = addViewZone(
      monaco,
      editor,
      this._lineNumber,
      this.numLines,
    )

    this.contentWidgetResult = addContentWidget(
      monaco,
      editor,
      this._lineNumber + 1,
      domNode,
      onDestroy,
    )

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

  destroy = () => {
    this.viewZoneResult.destroy()
    this.contentWidgetResult.destroy()
    this.decorationResult.destroy()
  }
}
