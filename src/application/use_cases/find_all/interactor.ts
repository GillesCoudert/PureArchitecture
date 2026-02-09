import { Mapper } from '../../../infrastructure_boundary/mapping/mapper';
import { ImmutableEntity } from '../../../domain/immutable_entity';
import { ResultAsync, Success } from '@gilles-coudert/pure-trace';
import { FindAllInput } from '../../../application_boundary/use_cases/find_all/input';
import {
    Repository,
    FindAllQuery,
} from '../../../infrastructure_boundary/persistence/repository';
import { Requester } from '../../../common/requester';
import { FindAllUseCase } from '../../../application_boundary/use_cases/find_all/use_case';
import { PageResult } from '../../../common/page_result';

/**
 * Use case for finding all entities.
 * Follows Clean Architecture principles: no framework dependencies.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TEntity - The domain entity type
 * @template TDto - The data transfer object type
 * @template TAccessPolicy - The access policy type
 * @template TId - The entity ID type (defaults to string)
 */
export class FindAllInteractor<
    TRequester extends Requester,
    TEntity extends ImmutableEntity<TId, TAccessPolicy>,
    TDto,
    TAccessPolicy,
    TId = string,
> implements FindAllUseCase<TRequester, TDto> {
    constructor(
        private readonly repository: Repository<
            TRequester,
            TEntity,
            TAccessPolicy,
            TId
        >,
        private readonly mapper: Mapper<TEntity, TDto>,
    ) {}

    execute(input: FindAllInput<TRequester>): ResultAsync<PageResult<TDto>> {
        const query: FindAllQuery<TRequester> = {
            requester: input.requester,
            pageNumber: input.pageNumber,
            pageSize: input.pageSize,
            filter: input.filter,
            sort: input.sort,
            presets: input.presets,
        };
        return this.repository.findAll(query).mapSuccess(
            (pageResult) =>
                new Success({
                    items: this.mapper.toMany(pageResult.items),
                    pageNumber: pageResult.pageNumber,
                    pageSize: pageResult.pageSize,
                    totalCount: pageResult.totalCount,
                }),
        );
    }
}
