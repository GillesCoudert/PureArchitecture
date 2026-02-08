import { UpdatableEntity } from './updatable_entity';

export interface SoftRemovableEntity<
    TAccessPolicy,
    TId = string,
> extends UpdatableEntity<TAccessPolicy, TId> {
    removedAt: Date;
}
