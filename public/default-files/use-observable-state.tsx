import { useEffect, useMemo, useState } from 'react'
import { Observable, Subject } from 'rxjs'

export function useObservableState<Event, Output>(
  createOutput: (event$: Observable<Event>) => Observable<Output>,
  initial: Output,
): [currentValue: Output, next: (event: Event) => void] {
  const [currentOutput, setCurrentOutput] = useState(initial)
  const event$ = useMemo(() => new Subject<Event>(), [])
  const output$ = useMemo(() => createOutput(event$), [])
  const subscription = useMemo(
    () =>
      output$.subscribe(output => {
        setCurrentOutput(output)
      }),
    [],
  )

  useEffect(() => {
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return [currentOutput, e => event$.next(e)]
}
