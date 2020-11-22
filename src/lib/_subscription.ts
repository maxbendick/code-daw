export type _SubscriptionLike =
  | void
  | null
  | undefined
  | (() => void)
  | _Subscription;

export class _Subscription {
  constructor(subscriptionLike?: _SubscriptionLike) {
    // TODO make this right
  }

  unsubscribe = (): void => {};

  combine = (other: _Subscription): _Subscription => {
    return null as any;
  };
}
