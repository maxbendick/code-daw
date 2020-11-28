/* 
DualBus can be used for communication between
one place and another
*/

export interface Bus<SendT, ReceiveT> {
  send: (message: SendT) => void
  receive: (f: (message: ReceiveT) => void) => void
  destroy: () => void
  destroyed: boolean
  // TODO add onDestroyed?
}

type Receiver<A> = (message: A) => void

interface MonoBusArgs<SendT> {
  send: (message: SendT) => void
  onDestroy: () => void
}

class MonoBus<SendT, ReceiveT> implements Bus<SendT, ReceiveT> {
  private onDestroy: () => void
  private receiver: Receiver<ReceiveT> = () => {}
  private _destroyed = false

  send: (message: SendT) => void

  get sendToSelf() {
    return this.receiver
  }

  get destroyed() {
    return this._destroyed
  }

  constructor({ send, onDestroy }: MonoBusArgs<SendT>) {
    this.send = send
    this.onDestroy = onDestroy
  }

  receive = (f: (message: ReceiveT) => void) => {
    this.receiver = f
  }

  destroy = () => {
    if (this._destroyed) {
      return
    }
    this._destroyed = true

    this.send = () => {
      throw new Error('send called after bus destroyed')
    }
    this.receive = () => {
      throw new Error('receive called after bus destroyed')
    }
    const { onDestroy } = this
    this.destroy = () => {
      throw new Error('onDestroy called after bus destroyed')
    }
    onDestroy()
  }
}

export class DualBus<ASends, BSends> {
  destroyed = false

  get busA(): Bus<ASends, BSends> {
    return this._busA
  }

  get busB(): Bus<BSends, ASends> {
    return this._busB
  }

  private _busA = new MonoBus<ASends, BSends>({
    send: (message: ASends) => {
      this._busB.sendToSelf(message)
    },
    onDestroy: () => {
      if (!this.destroyed) {
        this.destroyed = true
        this.busB.destroy()
      }
    },
  })

  private _busB = new MonoBus<BSends, ASends>({
    send: (message: BSends) => {
      this._busA.sendToSelf(message)
    },
    onDestroy: () => {
      if (!this.destroyed) {
        this.destroyed = true
        this.busA.destroy()
      }
    },
  })
}
