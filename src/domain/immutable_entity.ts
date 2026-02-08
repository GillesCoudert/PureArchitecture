export interface ImmutableEntity<TId, TAccessPolicy> {
    id: TId;
    createdAt: Date;
    accessPolicy: TAccessPolicy;
}
