# Examples

Practical examples demonstrating PureArchitecture patterns.

## Example 1: Simple Task Management System

This example demonstrates a basic task management system with HTTP API.

### Project Structure

```
src/
├── common/
│   └── user.ts
├── domain/
│   └── task.ts
├── application_boundary/
│   └── create_task.use_case.ts
├── application/
│   └── create_task.interactor.ts
├── infrastructure/
│   ├── persistence/
│   │   └── in_memory_task.repository.ts
│   ├── i18n/
│   │   └── simple.translator.ts
│   └── mapping/
│       └── create_task.mapper.ts
└── presentation/
    └── http/
        ├── express.request.ts
        └── create_task.controller.ts
```

### 1. Define Common Types

```typescript
// src/common/user.ts
import { Requester, Locale } from '@gilles-coudert/pure-architecture';

export interface User extends Requester {
    id: string;
    preferredLocale: Locale;
    email: string;
    name: string;
}
```

### 2. Define Domain Entities

```typescript
// src/domain/task.ts
export interface Task {
    id: string;
    title: string;
    description?: string;
    ownerId: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}
```

### 3. Define Use Case Contract

```typescript
// src/application_boundary/create_task.use_case.ts
import { PureUseCase, PureParameters } from '@gilles-coudert/pure-architecture';
import { ResultAsync } from '@gilles-coudert/pure-trace';
import { User } from '../common/user';
import { Task } from '../domain/task';

export interface CreateTaskPayload {
    title: string;
    description?: string;
}

export interface CreateTaskInput extends PureParameters<
    User,
    CreateTaskPayload
> {
    requester: User;
    payload: CreateTaskPayload;
}

export interface CreateTaskUseCase extends PureUseCase<
    CreateTaskInput,
    CreateTaskPayload,
    Task,
    User
> {}
```

### 4. Implement Use Case

```typescript
// src/application/create_task.interactor.ts
import {
    ResultAsync,
    Success,
    generateFailure,
} from '@gilles-coudert/pure-trace';
import {
    CreateTaskUseCase,
    CreateTaskInput,
} from '../application_boundary/create_task.use_case';
import { Task } from '../domain/task';

export interface TaskRepository {
    save(task: Task): ResultAsync<Task>;
}

export class CreateTaskInteractor implements CreateTaskUseCase {
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

        if (input.payload.title.length > 200) {
            return ResultAsync.liftFailure({
                type: 'processError',
                code: 'titleTooLong',
                data: { maxLength: 200 },
            });
        }

        // Business logic
        const task: Task = {
            id: crypto.randomUUID(),
            title: input.payload.title.trim(),
            description: input.payload.description?.trim(),
            ownerId: input.requester.id,
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return this.taskRepository.save(task);
    }
}
```

### 5. Implement Infrastructure

```typescript
// src/infrastructure/persistence/in_memory_task.repository.ts
import {
    ResultAsync,
    Success,
    generateFailure,
} from '@gilles-coudert/pure-trace';
import { Task } from '../../domain/task';
import { TaskRepository } from '../../application/create_task.interactor';

export class InMemoryTaskRepository implements TaskRepository {
    private tasks: Map<string, Task> = new Map();

    save(task: Task): ResultAsync<Task> {
        try {
            this.tasks.set(task.id, { ...task });
            return ResultAsync.liftSuccess(task);
        } catch (error) {
            return ResultAsync.liftFailure({
                type: 'technicalIssue',
                code: undefined,
                data: undefined,
            });
        }
    }

    findById(id: string): ResultAsync<Task> {
        const task = this.tasks.get(id);
        if (!task) {
            return ResultAsync.liftFailure({
                type: 'processError',
                code: 'taskNotFound',
                data: { taskId: id },
            });
        }
        return ResultAsync.liftSuccess({ ...task });
    }
}
```

```typescript
// src/infrastructure/i18n/simple.translator.ts
import { Translator } from '@gilles-coudert/pure-architecture';
import { PureMessage, Locale } from '@gilles-coudert/pure-trace';

export class SimpleTranslator implements Translator {
    private translations: Record<Locale, Record<string, string>> = {
        en: {
            emptyTitle: 'Task title cannot be empty',
            titleTooLong: 'Task title exceeds maximum length',
            taskCreated: 'Task created successfully',
        },
        fr: {
            emptyTitle: 'Le titre de la tâche ne peut pas être vide',
            titleTooLong: 'Le titre de la tâche dépasse la longueur maximale',
            taskCreated: 'Tâche créée avec succès',
        },
    };

    translate(message: PureMessage, locale: Locale): void {
        const localeTranslations =
            this.translations[locale] || this.translations['en'];
        message.localizedMessage = {
            locale,
            message: localeTranslations[message.code] || message.code,
        };
    }
}
```

```typescript
// src/infrastructure/mapping/create_task.mapper.ts
import { Mapper } from '@gilles-coudert/pure-architecture';
import { CreateTaskPayload } from '../../application_boundary/create_task.use_case';

export interface CreateTaskRequest {
    title: string;
    description?: string;
}

export class CreateTaskMapper implements Mapper<
    CreateTaskRequest,
    CreateTaskPayload
> {
    to(request: CreateTaskRequest): CreateTaskPayload {
        return {
            title: request.title,
            description: request.description,
        };
    }

    from(payload: CreateTaskPayload): CreateTaskRequest {
        return {
            title: payload.title,
            description: payload.description,
        };
    }
}
```

### 6. Implement Presentation Layer

```typescript
// src/presentation/http/express.request.ts
import { PureRequest } from '@gilles-coudert/pure-architecture';
import { Request as ExpressRequest } from 'express';
import { User } from '../../common/user';

export class ExpressPureRequest implements PureRequest<User> {
    constructor(
        private readonly req: ExpressRequest,
        private readonly user: User,
    ) {}

    getRequester(): User {
        return this.user;
    }

    getBody(): unknown {
        return this.req.body;
    }

    getQuery(): Record<string, unknown> {
        return this.req.query as Record<string, unknown>;
    }

    getHeaders(): Record<string, string> {
        return this.req.headers as Record<string, string>;
    }

    getParams(): Record<string, string> {
        return this.req.params;
    }
}
```

```typescript
// src/presentation/http/create_task.controller.ts
import {
    createPureController,
    PureRequest,
} from '@gilles-coudert/pure-architecture';
import {
    Result,
    Success,
    Failure,
    PureError,
} from '@gilles-coudert/pure-trace';
import { Response as ExpressResponse } from 'express';
import z from 'zod';
import { User } from '../../common/user';
import { CreateTaskRequest } from '../../infrastructure/mapping/create_task.mapper';

const createTaskRequestSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
});

// Create base controller with dependencies
const BaseCreateTaskController = createPureController(
    createTaskRequestSchema,
    createTaskInteractor, // injected
    translator, // injected
    mapper, // injected
);

interface HttpContext {
    statusCode: number;
    body: unknown;
    headers: Record<string, string>;
}

export class CreateTaskHttpController extends BaseCreateTaskController<ExpressResponse> {
    extractRequestData(request: PureRequest<User>): Result<CreateTaskRequest> {
        return new Success(request.getBody() as CreateTaskRequest);
    }

    initContext(_request: PureRequest<User>): HttpContext {
        return {
            statusCode: 201,
            body: null,
            headers: { 'Content-Type': 'application/json' },
        };
    }

    handleError(error: PureError, context: HttpContext): void {
        context.statusCode = error.type === 'processError' ? 400 : 500;
    }

    handleFailure(failure: Failure, context: HttpContext): void {
        context.body = {
            errors: failure.getErrors().map((error) => ({
                code: error.code,
                message: error.localizedMessage?.message || error.code,
                data: error.data,
            })),
        };
    }

    handleSuccess(success: Success<Task>, context: HttpContext): void {
        context.body = {
            data: success.value,
        };
    }

    handleContext(context: HttpContext): ExpressResponse {
        return expressRes
            .status(context.statusCode)
            .set(context.headers)
            .json(context.body);
    }
}
```

### 7. Wire Everything Together

```typescript
// src/index.ts
import express from 'express';
import { InMemoryTaskRepository } from './infrastructure/persistence/in_memory_task.repository';
import { SimpleTranslator } from './infrastructure/i18n/simple.translator';
import { CreateTaskMapper } from './infrastructure/mapping/create_task.mapper';
import { CreateTaskInteractor } from './application/create_task.interactor';
import { CreateTaskHttpController } from './presentation/http/create_task.controller';
import { ExpressPureRequest } from './presentation/http/express.request';

const app = express();
app.use(express.json());

// Dependencies
const taskRepository = new InMemoryTaskRepository();
const translator = new SimpleTranslator();
const mapper = new CreateTaskMapper();
const createTaskInteractor = new CreateTaskInteractor(taskRepository);
const createTaskController = new CreateTaskHttpController();

// Routes
app.post('/tasks', async (req, res) => {
    // Authentication middleware would populate req.user
    const user: User = {
        id: req.user.id,
        preferredLocale: req.user.locale || 'en',
        email: req.user.email,
        name: req.user.name,
    };

    const pureRequest = new ExpressPureRequest(req, user);
    return createTaskController.handle(pureRequest);
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
```

## Example 2: GraphQL API

This example shows how to adapt the same use case for GraphQL.

```typescript
// src/presentation/graphql/create_task.resolver.ts
import {
    createPureController,
    PureRequest,
} from '@gilles-coudert/pure-architecture';
import {
    Result,
    Success,
    Failure,
    PureError,
} from '@gilles-coudert/pure-trace';
import z from 'zod';

interface GraphQLContext {
    errors: Error[];
    data: unknown;
}

class GraphQLPureRequest implements PureRequest<User> {
    constructor(
        private readonly args: unknown,
        private readonly context: { user: User },
    ) {}

    getRequester(): User {
        return this.context.user;
    }

    getBody(): unknown {
        return this.args;
    }

    getQuery(): Record<string, unknown> {
        return {};
    }

    getHeaders(): Record<string, string> {
        return {};
    }

    getParams(): Record<string, string> {
        return {};
    }
}

const BaseCreateTaskController = createPureController(
    createTaskRequestSchema,
    createTaskInteractor,
    translator,
    mapper,
);

class CreateTaskGraphQLResolver extends BaseCreateTaskController<{
    task?: Task;
    errors?: Error[];
}> {
    extractRequestData(request: PureRequest<User>): Result<CreateTaskRequest> {
        return new Success(request.getBody() as CreateTaskRequest);
    }

    initContext(_request: PureRequest<User>): GraphQLContext {
        return { errors: [], data: null };
    }

    handleError(error: PureError, context: GraphQLContext): void {
        context.errors.push({
            message: error.localizedMessage?.message || error.code,
            code: error.code,
        });
    }

    handleFailure(_failure: Failure, context: GraphQLContext): void {
        // Errors already added in handleError
    }

    handleSuccess(success: Success<Task>, context: GraphQLContext): void {
        context.data = success.value;
    }

    handleContext(context: GraphQLContext): { task?: Task; errors?: Error[] } {
        return {
            task: context.data as Task,
            errors: context.errors.length > 0 ? context.errors : undefined,
        };
    }
}

// GraphQL Schema
const typeDefs = `
  type Task {
    id: ID!
    title: String!
    description: String
    ownerId: ID!
    completed: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input CreateTaskInput {
    title: String!
    description: String
  }

  type Mutation {
    createTask(input: CreateTaskInput!): CreateTaskPayload!
  }

  type CreateTaskPayload {
    task: Task
    errors: [Error!]
  }

  type Error {
    message: String!
    code: String!
  }
`;

const resolvers = {
    Mutation: {
        createTask: async (_parent, { input }, context) => {
            const resolver = new CreateTaskGraphQLResolver();
            const request = new GraphQLPureRequest(input, context);
            return resolver.handle(request);
        },
    },
};
```

## Example 3: CLI Application

This example demonstrates using PureArchitecture in a CLI context.

```typescript
// src/presentation/cli/create_task.command.ts
import {
    createPureController,
    PureRequest,
} from '@gilles-coudert/pure-architecture';
import {
    Result,
    Success,
    Failure,
    PureError,
} from '@gilles-coudert/pure-trace';

class CLIPureRequest implements PureRequest<User> {
    constructor(
        private readonly args: { title: string; description?: string },
        private readonly user: User,
    ) {}

    getRequester(): User {
        return this.user;
    }

    getBody(): unknown {
        return this.args;
    }

    getQuery(): Record<string, unknown> {
        return {};
    }

    getHeaders(): Record<string, string> {
        return {};
    }

    getParams(): Record<string, string> {
        return {};
    }
}

interface CLIContext {
    exitCode: number;
    output: string[];
}

const BaseCreateTaskController = createPureController(
    createTaskRequestSchema,
    createTaskInteractor,
    translator,
    mapper,
);

class CreateTaskCLICommand extends BaseCreateTaskController<void> {
    extractRequestData(request: PureRequest<User>): Result<CreateTaskRequest> {
        return new Success(request.getBody() as CreateTaskRequest);
    }

    initContext(_request: PureRequest<User>): CLIContext {
        return { exitCode: 0, output: [] };
    }

    handleError(error: PureError, context: CLIContext): void {
        context.exitCode = 1;
        context.output.push(
            `❌ Error: ${error.localizedMessage?.message || error.code}`,
        );
    }

    handleFailure(_failure: Failure, context: CLIContext): void {
        // Errors already added
    }

    handleSuccess(success: Success<Task>, context: CLIContext): void {
        context.output.push(
            `✅ Task created: ${success.value.title} (${success.value.id})`,
        );
    }

    handleContext(context: CLIContext): void {
        context.output.forEach((line) => console.log(line));
        process.exit(context.exitCode);
    }
}

// Usage with Commander.js
import { Command } from 'commander';

const program = new Command();

program.name('task-cli').description('Task management CLI');

program
    .command('create')
    .description('Create a new task')
    .requiredOption('-t, --title <title>', 'Task title')
    .option('-d, --description <description>', 'Task description')
    .action(async (options) => {
        const user: User = {
            id: 'cli-user',
            preferredLocale: 'en',
            email: 'cli@example.com',
            name: 'CLI User',
        };

        const command = new CreateTaskCLICommand();
        const request = new CLIPureRequest(options, user);
        await command.handle(request);
    });

program.parse();
```

## Key Takeaways

1. **Same business logic, multiple protocols**: The use case (`CreateTaskInteractor`) remains unchanged across HTTP, GraphQL, and CLI implementations.

2. **Protocol-specific adapters**: Controllers adapt the generic PureController to specific protocols (HTTP, GraphQL, CLI).

3. **Type safety**: TypeScript ensures type safety throughout the entire flow.

4. **Testability**: Each layer can be tested independently with mocks.

5. **Clean separation**: Business logic is isolated from infrastructure and presentation concerns.
