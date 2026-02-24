# Best Practices

This guide provides best practices for using PureArchitecture effectively in your projects.

## Core Principles

### 1. Functional Error Handling

Always use `Result` and `ResultAsync` from PureTrace instead of throwing exceptions:

```typescript
// ✅ Good - Functional error handling
execute(input: CreateUserInput): ResultAsync<User> {
    if (!input.payload.email) {
        return ResultAsync.liftFailure({
            type: 'processError',
            code: 'missingEmail',
            data: undefined,
        });
    }
    // ...
}

// ❌ Bad - Throwing exceptions
execute(input: CreateUserInput): ResultAsync<User> {
    if (!input.payload.email) {
        throw new Error('Email is required'); // Don't do this
    }
    // ...
}
```

### 2. Layer Boundaries

Respect Clean Architecture layer boundaries:

- **Domain**: Core business logic, entities, value objects
    - Depends on: nothing (except common utilities)
- **Application Boundary**: Use case interfaces
    - Depends on: domain, common
- **Application**: Use case implementations
    - Depends on: domain, application_boundary, common
- **Infrastructure**: External services (database, API clients)
    - Depends on: domain, application_boundary, common (NOT application)
- **Presentation**: Controllers, API adapters
    - Depends on: application_boundary, common (NOT domain or application)

Use the provided ESLint configuration to enforce these rules:

```typescript
// In your eslint.config.mts
import cleanArchConfig from '@gilles-coudert/pure-architecture/eslint-config';

export default [
    // ... other configs
    ...cleanArchConfig.overrides,
];
```

### 3. Use Case Design

Keep use cases focused and single-purpose:

```typescript
// ✅ Good - Single responsibility
class CreateUserInteractor implements PureUseCase<...> {
    execute(input: CreateUserInput): ResultAsync<User> {
        // Only handles user creation
    }
}

// ❌ Bad - Multiple responsibilities
class UserManagementInteractor implements PureUseCase<...> {
    execute(input: UserInput): ResultAsync<User> {
        if (input.action === 'create') { /* ... */ }
        else if (input.action === 'update') { /* ... */ }
        else if (input.action === 'delete') { /* ... */ }
    }
}
```

### 4. Dependency Injection

Use constructor injection for dependencies:

```typescript
// ✅ Good - Constructor injection
class CreateUserInteractor implements PureUseCase<...> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly emailService: EmailService,
    ) {}

    execute(input: CreateUserInput): ResultAsync<User> {
        // Use this.userRepository and this.emailService
    }
}

// ❌ Bad - Direct instantiation
class CreateUserInteractor implements PureUseCase<...> {
    execute(input: CreateUserInput): ResultAsync<User> {
        const userRepository = new UserRepository(); // Don't do this
        // ...
    }
}
```

### 5. Input Validation

Validate input data at the presentation layer using Zod schemas:

```typescript
const createUserRequestSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
});

class CreateUserController extends createPureController(
    createUserRequestSchema,
    interactor,
    translator,
    mapper,
)<HttpResponse> {
    // Schema validation happens automatically
}
```

### 6. Error Categorization

Use appropriate error types:

- **processError**: Errors the requester can fix (validation, business rule violations)
- **technicalIssue**: System errors the requester cannot fix (database down, network errors)

```typescript
// Process error - user can fix
generateFailure({
    type: 'processError',
    code: 'invalidEmail',
    data: undefined,
});

// Technical issue - system problem
generateFailure({
    type: 'technicalIssue',
    code: undefined,
});
```

### 7. Localization

Always provide localized messages through the Translator interface:

```typescript
class I18nTranslator implements Translator {
    translate(message: PureMessage, locale: Locale): void {
        const translations = this.getTranslationsFor(locale);
        message.localizedMessage = {
            locale,
            message: translations[message.code] || message.code,
        };
    }
}
```

### 8. Controller Implementation

Implement all abstract methods based on your protocol (HTTP, GraphQL, CLI, etc.):

```typescript
class CreateUserHttpController extends BaseCreateUserController<HttpResponse> {
    extractRequestData(request: PureRequest<Admin>): Result<CreateUserRequest> {
        return new Success(request.getBody());
    }

    initContext(request: PureRequest<Admin>): ControllerContext {
        return { statusCode: 200, body: null, headers: {} };
    }

    handleError(error: PureError, context: ControllerContext): void {
        context.statusCode = error.type === 'processError' ? 400 : 500;
    }

    handleFailure(failure: Failure, context: ControllerContext): void {
        context.body = { errors: failure.getErrors() };
    }

    handleSuccess(success: Success<User>, context: ControllerContext): void {
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

### 9. Naming Conventions

Follow consistent naming:

- Use cases: `{Action}{Entity}Interactor` (e.g., `CreateUserInteractor`)
- Use case inputs: `{Action}{Entity}Input` (e.g., `CreateUserInput`)
- Controllers: `{Action}{Entity}Controller` (e.g., `CreateUserController`)
- Request DTOs: `{Action}{Entity}Request` (e.g., `CreateUserRequest`)
- File names: snake_case with concept separation by dots (e.g., `create_user.interactor.ts`)

### 10. Testing

Test each layer independently:

```typescript
describe('CreateUserInteractor', () => {
    it('should create a user with valid input', async () => {
        const mockRepository = createMockUserRepository();
        const interactor = new CreateUserInteractor(mockRepository);

        const input: CreateUserInput = {
            requester: createMockAdmin(),
            payload: { email: 'test@example.com', name: 'Test User' },
        };

        const result = await interactor.execute(input);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            expect(result.value.email).toBe('test@example.com');
        }
    });
});
```

## Common Pitfalls

### 1. Bypassing Layer Boundaries

❌ **Don't** access domain entities directly from presentation:

```typescript
// Bad - Presentation directly accessing domain
class UserController {
    handle() {
        const user = new User(); // Domain entity in presentation
    }
}
```

✅ **Do** use application boundary interfaces:

```typescript
// Good - Presentation uses application boundary
class UserController {
    constructor(private readonly createUser: CreateUserUseCase) {}

    handle() {
        return this.createUser.execute(input);
    }
}
```

### 2. Mutating Input

❌ **Don't** mutate use case input parameters:

```typescript
execute(input: CreateUserInput): ResultAsync<User> {
    input.payload.email = input.payload.email.toLowerCase(); // Don't mutate
}
```

✅ **Do** create new objects:

```typescript
execute(input: CreateUserInput): ResultAsync<User> {
    const normalizedEmail = input.payload.email.toLowerCase();
    // Use normalizedEmail without mutating input
}
```

### 3. Leaking Implementation Details

❌ **Don't** expose database models directly:

```typescript
// Bad - Returning database model
execute(input: CreateUserInput): ResultAsync<UserEntity> {
    return this.repository.save(input); // Returns Prisma/TypeORM entity
}
```

✅ **Do** return domain models:

```typescript
// Good - Returning domain model
execute(input: CreateUserInput): ResultAsync<User> {
    const dbUser = await this.repository.save(input);
    return new Success(this.mapToDomain(dbUser));
}
```

## Performance Considerations

### 1. Async Operations

Use `ResultAsync` for asynchronous operations:

```typescript
// Parallel execution
const result = await ResultAsync.combine([
    this.userRepository.findById(id),
    this.orderRepository.findByUserId(id),
]);

// Sequential execution with chaining
const result = await this.userRepository
    .findById(id)
    .chainSuccess((user) => this.orderRepository.findByUserId(user.id));
```

### 2. Avoid Over-Abstraction

Keep interfaces focused and avoid unnecessary abstraction layers:

```typescript
// ✅ Good - Direct, clear interface
interface UserRepository {
    findById(id: string): ResultAsync<User>;
    save(user: User): ResultAsync<User>;
}

// ❌ Bad - Over-abstracted
interface Repository<T> {
    execute<R>(operation: Operation<T, R>): ResultAsync<R>;
}
```

## PureTrace Integration

For detailed guidance on using PureTrace's Result types, error handling, and fluent API, refer to:

- [PureTrace Best Practices](https://www.npmjs.com/package/@gilles-coudert/pure-trace)
- [PureTrace Documentation](https://github.com/GillesCoudert/PureTrace)
