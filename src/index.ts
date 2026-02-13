/**
 * @gilles-coudert/pure-architecture
 *
 * Core building blocks for Clean Architecture in TypeScript
 * Ultra-minimaliste, zero opinions, framework-agnostic
 */

// Domain layer - Core abstractions
export type { Entity } from './domain/entity';
export { ValueObject } from './domain/value_object';

// Common layer - Shared types and interfaces
export type { Requester } from './common/requester';
export type {
    PureParameters,
    TargetResourceParameters as TargetEntityParameters,
} from './common/parameters';
export type { PageResult } from './common/page_result';
// Application boundary layer - Use case contracts
export type { PureUseCase } from './application_boundary/use_cases/pure_use_case';

// Infrastructure boundary layer - Service contracts
export type { Mapper } from './infrastructure_boundary/mapping/mapper';
export type {
    Repository,
    CreateCommand,
    FindAllQuery,
    UpdateCommand,
    EntityData,
} from './infrastructure_boundary/persistence/repository';
