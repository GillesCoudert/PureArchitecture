/**
 * @gilles-coudert/pure-architecture
 *
 * Core building blocks for Clean Architecture in TypeScript
 * Ultra-minimaliste, zero opinions, framework-agnostic
 */

// Domain layer - Core abstractions
export type { Entity } from './domain/entity';
export type { ValueObject } from './domain/value_object';

// Common layer - Shared types and interfaces
export type { Requester } from './common/requester';
export type { Culture } from './common/culture';
export type { PureParameters } from './common/parameters';
export type { PageResult } from './common/page_result';
// Application boundary layer - Use case contracts
export type { PureUseCase } from './application_boundary/pure_use_case';

// Presentation layer - Request/Response contracts
export type { PureRequest } from './presentation/pure_request';
export { PureController } from './presentation/pure_controller';

// Infrastructure boundary layer - Service contracts
export type { Mapper } from './infrastructure_boundary/mapping/mapper';
export type { Translator } from './infrastructure_boundary/i18n/translator';
export type {
    Repository,
    CreateCommand,
    FindAllQuery,
    UpdateCommand,
    EntityData,
} from './infrastructure_boundary/persistence/repository';
