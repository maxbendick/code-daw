export declare type _SubscriptionLike = void | null | undefined | (() => void) | _Subscription;
export declare class _Subscription {
    constructor(subscriptionLike?: _SubscriptionLike);
    unsubscribe: () => void;
    combine: (other: _Subscription) => _Subscription;
}
