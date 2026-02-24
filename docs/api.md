# API Reference

Complete API documentation for PureArchitecture.

## Core Types

### Requester

```typescript
interface Requester {
    id: string;
    preferredLocale: Locale;
}
```

Represents an authenticated user, service, or actor performing operations.

**Properties:**

- `id`: Unique identifier for the requester
- `preferredLocale`: Locale preference for localized messages (from PureTrace)

**Example:**

```typescript
interface User extends Requester {
    id: string;
    preferredLocale: Locale;
    email: string;
    role: 'admin' | 'user';
}

const user: User = {
    id: '123',
    preferredLocale: 'en-US',
    email: 'john@example.com',
    role: 'user',
};
```

### PureParameters<TRequester, TPayload>

```typescript
interface PureParameters<TRequester extends Requester, TPayload extends Json> {
    requester: TRequester;
    payload: TPayload;
}
```

Container for use case input parameters.

**Type Parameters:**

- `TRequester`: The requester/actor type (extends Requester)
- `TPayload`: The payload data type (must be JSON-serializable)

**Properties:**

- `requester`: The authenticated actor performing the operation
- `payload`: The input data for the use case

**Example:**

```typescript
interface CreateTaskInput extends PureParameters<
    User,
    { title: string; dueDate: Date }
> {
    requester: User;
    payload: {
        title: string;
        dueDate: Date;
    };
}
```

### Json

```typescript
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
```

Represents JSON-serializable data types.

## Application Boundary

### PureUseCase<TInput, TPayload, TResult, TRequester>

```typescript
interface PureUseCase<
    TInput extends PureParameters<TRequester, TPayload>,
    TPayload extends Json,
    TResult,
    TRequester extends Requester,
> {
    execute(input: TInput): ResultAsync<TResult>;
}
```

Interface for implementing use case business logic.

**Type Parameters:**

- `TInput`: The input parameters type (extends PureParameters)
- `TPayload`: The payload data type within the input
- `TResult`: The success result type
- `TRequester`: The requester type

**Methods:**

- `execute(input: TInput): ResultAsync<TResult>` - Execute the use case logic

**Example:**

```typescript
class CreateTaskInteractor implements PureUseCase<
    CreateTaskInput,
    { title: string },
    Task,
    User
> {
    constructor(private readonly taskRepository: TaskRepository) {}

    execute(input: CreateTaskInput): ResultAsync<Task> {
        // Validation
        if (!input.payload.title.trim()) {
            return ResultAsync.liftFailure({
                type: 'processError',
                code: 'emptyTitle',
                data: undefined,
            });
        }

        // Business logic
        const task = {
            id: crypto.randomUUID(),
            title: input.payload.title,
            ownerId: input.requester.id,
            createdAt: new Date(),
        };

        return this.taskRepository.save(task);
    }
}
```

## Presentation Layer

### PureRequest<TRequester>

```typescript
interface PureRequest<TRequester extends Requester> {
    getRequester(): TRequester;
    getBody(): unknown;
    getQuery(): Record<string, unknown>;
    getHeaders(): Record<string, string>;
    getParams(): Record<string, string>;
}
```

Protocol-agnostic interface for incoming requests.

**Type Parameters:**

- `TRequester`: The authenticated requester type

**Methods:**

- `getRequester(): TRequester` - Get the authenticated requester
- `getBody(): unknown` - Get the request body data
- `getQuery(): Record<string, unknown>` - Get query parameters
- `getHeaders(): Record<string, string>` - Get request headers
- `getParams(): Record<string, string>` - Get path/route parameters

**Example (HTTP):**

```typescript
class HttpPureRequest implements PureRequest<User> {
    constructor(
        private readonly req: ExpressRequest,
        private readonly requester: User,
    ) {}

    getRequester(): User {
        return this.requester;
    }

    getBody(): unknown {
        return this.req.body;
    }

    getQuery(): Record<string, unknown> {
        return this.req.query;
    }

    getHeaders(): Record<string, string> {
        return this.req.headers as Record<string, string>;
    }

    getParams(): Record<string, string> {
        return this.req.params;
    }
}
```

### PureController<TControllerResult, TRequestData, TUseCaseInput, TUseCaseInputData, TUseCaseResult, TRequester>

```typescript
interface PureController<
    TControllerResult,
    TRequestData,
    TUseCaseInput extends PureParameters<TRequester, TUseCaseInputData>,
    TUseCaseInputData extends Json,
    TUseCaseResult,
    TRequester extends Requester,
> {
    handle(request: PureRequest<TRequester>): Promise<TControllerResult>;
    extractRequestData(request: PureRequest<TRequester>): Result<TRequestData>;
    initContext(request: PureRequest<TRequester>): ControllerContext;
    handleError(error: PureError, context: ControllerContext): void;
    handleFailure(failure: Failure, context: ControllerContext): void;
    handleSuccess(
        success: Success<TUseCaseResult>,
        context: ControllerContext,
    ): void;
    handleContext(context: ControllerContext): TControllerResult;
}
```

Protocol-agnostic controller interface for handling requests.

**Type Parameters:**

- `TControllerResult`: The final response type (e.g., HttpResponse, GraphQLResponse)
- `TRequestData`: The validated request data type
- `TUseCaseInput`: The use case input parameters type
- `TUseCaseInputData`: The payload data within the use case input
- `TUseCaseResult`: The use case result type
- `TRequester`: The requester type

**Methods:**

- `handle(request)` - Main entry point, orchestrates the entire request handling flow
- `extractRequestData(request)` - Extract and validate request data
- `initContext(request)` - Initialize request context
- `handleError(error, context)` - Handle individual errors
- `handleFailure(failure, context)` - Handle failure state
- `handleSuccess(success, context)` - Handle success state
- `handleContext(context)` - Build final response

### createPureController

```typescript
function createPureController<
    TRequestDataContract extends z.ZodObject<any>,
    TUseCaseInput extends PureParameters<TRequester, TUseCaseInputData>,
    TUseCaseInputData extends Json,
    TUseCaseResult extends Json,
    TRequester extends Requester
>(
    requestDataSchema: TRequestDataContract,
    interactor: PureUseCase<TUseCaseInput, TUseCaseInputData, TUseCaseResult, TRequester>,
    translator: Translator,
    mapper: Mapper<z.infer<TRequestDataContract>, TUseCaseInputData>
): PureControllerClass<...>
```

Factory function to create a PureController implementation.

**Parameters:**

- `requestDataSchema`: Zod schema for validating request data
- `interactor`: The use case to execute
- `translator`: Service for translating messages to user's locale
- `mapper`: Service for mapping request data to use case input

**Returns:** An abstract class that you extend to implement protocol-specific methods

**Example:**

```typescript
const createTaskRequestSchema = z.object({
    title: z.string().min(1).max(200),
    dueDate: z.string().datetime().optional(),
});

const BaseCreateTaskController = createPureController(
    createTaskRequestSchema,
    createTaskInteractor,
    translator,
    requestToInputMapper,
);

class CreateTaskHttpController extends BaseCreateTaskController<HttpResponse> {
    extractRequestData(
        request: PureRequest<User>,
    ): Result<z.infer<typeof createTaskRequestSchema>> {
        return new Success(request.getBody());
    }

    initContext(request: PureRequest<User>): ControllerContext {
        return { statusCode: 201, body: null, headers: {} };
    }

    handleError(error: PureError, context: ControllerContext): void {
        context.statusCode = error.type === 'processError' ? 400 : 500;
    }

    handleFailure(failure: Failure, context: ControllerContext): void {
        context.body = { errors: failure.getErrors() };
    }

    handleSuccess(success: Success<Task>, context: ControllerContext): void {
        context.body = { data: success.value };
    }

    handleContext(context: ControllerContext): HttpResponse {
        return new HttpResponse(
            context.statusCode,
            context.body,
            context.headers,
        );
    }
}
```

## Infrastructure Boundary

### Translator

```typescript
interface Translator {
    translate(message: PureMessage, locale: Locale): void;
}
```

Service interface for translating messages to a specific locale.

**Methods:**

- `translate(message, locale)` - Modify message in-place by setting `localizedMessage`

**Example:**

```typescript
class I18nTranslator implements Translator {
    constructor(
        private readonly translations: Record<Locale, Record<string, string>>,
    ) {}

    translate(message: PureMessage, locale: Locale): void {
        const localeTranslations =
            this.translations[locale] || this.translations['en'];
        message.localizedMessage = {
            locale,
            message: localeTranslations[message.code] || message.code,
        };
    }
}

// Usage
const translator = new I18nTranslator({
    en: {
        emptyTitle: 'Title cannot be empty',
        taskCreated: 'Task created successfully',
    },
    fr: {
        emptyTitle: 'Le titre ne peut pas être vide',
        taskCreated: 'Tâche créée avec succès',
    },
});
```

### Mapper<TFrom, TTo>

```typescript
interface Mapper<TFrom, TTo> {
    to(source: TFrom): TTo;
    from(target: TTo): TFrom;
}
```

Service interface for bidirectional data mapping.

**Type Parameters:**

- `TFrom`: Source data type
- `TTo`: Target data type

**Methods:**

- `to(source)` - Map from source to target
- `from(target)` - Map from target to source

**Example:**

```typescript
class CreateTaskRequestMapper implements Mapper<
    CreateTaskRequest,
    CreateTaskPayload
> {
    to(request: CreateTaskRequest): CreateTaskPayload {
        return {
            title: request.title.trim(),
            dueDate: request.dueDate ? new Date(request.dueDate) : undefined,
        };
    }

    from(payload: CreateTaskPayload): CreateTaskRequest {
        return {
            title: payload.title,
            dueDate: payload.dueDate?.toISOString(),
        };
    }
}
```

## ESLint Configuration

### Clean Architecture Layer Rules

Import the ESLint configuration to enforce layer boundaries:

```typescript
// eslint.config.mts
import cleanArchConfig from '@gilles-coudert/pure-architecture/eslint-config';

export default [
    // ... other configs
    ...cleanArchConfig.overrides,
];
```

**Enforced Rules:**

- Common layer can only depend on external libraries
- Domain layer can only depend on common layer
- Application boundary can depend on common and domain
- Application layer cannot depend on infrastructure or presentation
- Infrastructure layer cannot depend on application or presentation
- Presentation layer can only depend on application_boundary and common

See [eslint-config.js](../eslint-config.js) for complete configuration details.

## Type Exports

All types are exported from the main entry point:

```typescript
import {
    // Common types
    Requester,
    Locale,
    Json,
    PureParameters,

    // Application boundary
    PureUseCase,

    // Presentation layer
    PureRequest,
    PureController,
    createPureController,

    // Infrastructure boundary
    Mapper,
    Translator,
} from '@gilles-coudert/pure-architecture';
```

## Integration with PureTrace

PureArchitecture is built on top of PureTrace. Key types used:

- `Result<T>` - Synchronous result (Success or Failure)
- `ResultAsync<T>` - Asynchronous result wrapper
- `Success<T>` - Successful result with value
- `Failure` - Failed result with errors
- `PureError` - Error object
- `PureMessage` - Message/trace object
- `Locale` - Locale/culture code

For complete PureTrace documentation, see: [PureTrace API Reference](https://www.npmjs.com/package/@gilles-coudert/pure-trace)
