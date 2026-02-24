/**
 * @gilles-coudert/pure-architecture
 *
 * Core building blocks for Clean Architecture in TypeScript
 * Ultra-minimaliste, zero opinions, framework-agnostic
 */

// Common layer - Shared types and interfaces
export type { Requester } from './common/requester';
export type { Locale } from '@gilles-coudert/pure-trace';
export type { Json, PureParameters } from './common/parameters';
// Application boundary layer - Use case contracts
export type { PureUseCase } from './application_boundary/pure_use_case';

// Presentation layer - Request/Response contracts
export type { PureRequest } from './presentation/pure_request';
export type { PureController } from './presentation/pure_controller';
export { createPureController } from './presentation/pure_controller';

// Infrastructure boundary layer - Service contracts
export type { Mapper } from './infrastructure_boundary/mapping/mapper';
export type { Translator } from './infrastructure_boundary/i18n/translator';
