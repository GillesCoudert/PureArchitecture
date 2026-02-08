import { ImmutableEntity } from './immutable_entity';

export interface UpdatableEntity<
    TAccessPolicy,
    TId = string,
> extends ImmutableEntity<TId, TAccessPolicy> {
    updatedAt: Date;
}
