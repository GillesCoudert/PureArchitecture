# PureArchitecture

A simplified Clean Architecture implementation using PureTrace for TypeScript applications.

## Core Domain Building Blocks

```mermaid
classDiagram
    direction TB
        namespace Core {
            class~Entity~TId {
                +id: TId
            }

            class~ValueObject~T {
                #value: T
                #validate(): void
                +getValue(): T
            }
        }
```

## ESLint Configuration for Clean Architecture

This package includes an ESLint configuration that enforces Clean Architecture layer boundaries.

### Installation

If using the full `@gilles-coudert/pure-architecture` package, the ESLint config is already included.

```bash
npm install --save-dev @gilles-coudert/pure-architecture eslint-plugin-import
```

### Important note about ESLint plugins

If you use ESLint Flat Config (ESLint 9+), you must declare plugins like `import` at the root of your configuration (e.g. `plugins: ['import']`).
This is required for custom rules and overrides to work, even if it seems less modular. Official presets like `typescript-eslint` work without this because they internally include their plugin reference, but your own rules and overrides need the plugin declared globally. See the [ESLint documentation](https://eslint.org/docs/latest/use/configure/plugins#configuring-plugins) for details.

### Usage

#### Flat Config (ESLint 9+)

```javascript
// eslint.config.js
import architectureConfig from '@gilles-coudert/pure-architecture/eslint-config';

export default [
    ...architectureConfig.overrides,
    // Your other configs...
];
```

#### Legacy Config (.eslintrc)

```json
{
    "extends": ["@gilles-coudert/pure-architecture/eslint-config"]
}
```

### Rules Enforced

#### Domain Layer (`src/domain/**`)

- ✅ Pure business logic only - NO dependencies
- ❌ Cannot import from anything outside domain

#### Application Boundary Layer (`src/application_boundary/**`)

- ✅ Use case contracts/interfaces
- ✅ Can import from `domain`
- ❌ Cannot import from `application`, `infrastructure_boundary`, `infrastructure`, `presentation`

#### Application Layer (`src/application/**`)

- ✅ Use case implementations
- ✅ Can import from `domain`, `application_boundary`
- ❌ Cannot import from `infrastructure`, `infrastructure_boundary`, `presentation`

#### Infrastructure Boundary Layer (`src/infrastructure_boundary/**`)

- ✅ Infrastructure service contracts/interfaces
- ✅ Can import from `domain`
- ❌ Cannot import from `application_boundary`, `application`, `infrastructure`, `presentation`

#### Infrastructure Layer (`src/infrastructure/**`)

- ✅ Infrastructure service implementations (database, APIs, etc.)
- ✅ Can import from `domain`, `application_boundary`, `infrastructure_boundary`
- ❌ Cannot import from `application`, `presentation`

#### Presentation Layer (`src/presentation/**`)

- ✅ UI controllers, API endpoints, views
- ✅ Can import from `domain`, `application_boundary`, `infrastructure_boundary`
- ❌ Cannot import from `application` (use contracts), `infrastructure` (use contracts)

### Customization

You can override specific rules in your project:

```javascript
import architectureConfig from '@gilles-coudert/pure-architecture/eslint-config';
import importPlugin from 'eslint-plugin-import';

export default [
    {
        files: ['src/domain/**/*.ts'],
        plugins: {
            import: importPlugin,
        },
        rules: {
            // Your custom rules
        },
    },
    ...architectureConfig.overrides,
];
```

### Layers Structure

**Structural Layers** (Clean Architecture):

- **`domain/`**: Pure business logic core - Base abstractions
    - `entity.ts`: Base Entity interface with unique identifier
    - `value_object.ts`: Abstract ValueObject base class for immutable domain values
- **`application_boundary/`**: Use case contracts and interfaces
    - `use_cases/`: Use case contract definitions
- **`application/`** _(optional in library)_: Use case implementations
    - Use case implementations for concrete business operations
- **`infrastructure_boundary/`**: Infrastructure service contracts
    - `i18n/`: Translation service contracts
    - `mapping/`: Object mapping service contracts
    - `persistence/`: Repository service contracts
- **`infrastructure/`** _(optional in library)_: Infrastructure implementations
    - Database adapters, external API clients, file system handlers
- **`presentation/`** _(optional in library)_: Controllers and endpoints
    - REST API controllers, GraphQL resolvers, UI handlers

In PureArchitecture, the `common/` folder contains reusable types like `Requester`, `Culture`, `Parameters`, and `PageResult`. - `requester.ts`: User/requester information - `culture.ts`: Localization configuration - `parameters.ts`: Base parameters for use cases - `page_result.ts`: Pagination result wrapper
