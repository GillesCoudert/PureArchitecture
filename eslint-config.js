const plugin = require('eslint-plugin-import');

/**
 * ESLint configuration for enforcing Clean Architecture layer boundaries.
 *
 * This configuration can be imported in your project's eslint.config.mts:
 *
 * ```typescript
 * import cleanArchConfig from '@gilles-coudert/pure-architecture/eslint-config';
 *
 * export default [
 *   // ... other configs
 *   ...cleanArchConfig.overrides,
 * ];
 * ```
 *
 * Layer dependency rules (from inner to outer):
 * - domain: Core business logic (no dependencies)
 * - application_boundary: Use case contracts (no dependencies)
 * - infrastructure_boundary: Service contracts (no dependencies)
 * - application: Use case implementations (can depend on: domain, application_boundary, infrastructure_boundary)
 * - infrastructure: External services implementations (can depend on: infrastructure_boundary)
 * - presentation: Controllers/adapters (can depend on: application_boundary, infrastructure_boundary)
 *
 * Note: The 'common' layer is for shared utilities and has no architectural restrictions.
 */
module.exports = {
    rules: {
        // Base import rules
        'import/no-restricted-paths': 'off', // Will be overridden in overrides
    },
    overrides: [
        // Domain layer - no dependencies
        {
            files: ['src/domain/**/*.{ts,js}'],
            rules: {
                'import/no-restricted-paths': [
                    'error',
                    {
                        zones: [
                            {
                                target: './src/domain',
                                from: './src/application_boundary',
                                message:
                                    'Domain layer cannot depend on Application boundary',
                            },
                            {
                                target: './src/domain',
                                from: './src/application',
                                message:
                                    'Domain layer cannot depend on Application layer',
                            },
                            {
                                target: './src/domain',
                                from: './src/infrastructure_boundary',
                                message:
                                    'Domain layer cannot depend on Infrastructure boundary',
                            },
                            {
                                target: './src/domain',
                                from: './src/infrastructure',
                                message:
                                    'Domain layer cannot depend on Infrastructure layer',
                            },
                            {
                                target: './src/domain',
                                from: './src/presentation',
                                message:
                                    'Domain layer cannot depend on Presentation layer',
                            },
                        ],
                    },
                ],
            },
        },
        // Application Boundary layer - no dependencies
        {
            files: ['src/application_boundary/**/*.{ts,js}'],
            rules: {
                'import/no-restricted-paths': [
                    'error',
                    {
                        zones: [
                            {
                                target: './src/application_boundary',
                                from: './src/domain',
                                message:
                                    'Application boundary cannot depend on Domain layer',
                            },
                            {
                                target: './src/application_boundary',
                                from: './src/application',
                                message:
                                    'Application boundary cannot depend on Application implementations',
                            },
                            {
                                target: './src/application_boundary',
                                from: './src/infrastructure_boundary',
                                message:
                                    'Application boundary cannot depend on Infrastructure boundary',
                            },
                            {
                                target: './src/application_boundary',
                                from: './src/infrastructure',
                                message:
                                    'Application boundary cannot depend on Infrastructure layer',
                            },
                            {
                                target: './src/application_boundary',
                                from: './src/presentation',
                                message:
                                    'Application boundary cannot depend on Presentation layer',
                            },
                        ],
                    },
                ],
            },
        },
        // Application layer - can depend on domain, application_boundary, and infrastructure_boundary
        {
            files: ['src/application/**/*.{ts,js}'],
            rules: {
                'import/no-restricted-paths': [
                    'error',
                    {
                        zones: [
                            {
                                target: './src/application',
                                from: './src/infrastructure',
                                message:
                                    'Application layer cannot depend on Infrastructure layer (use dependency injection instead)',
                            },
                            {
                                target: './src/application',
                                from: './src/presentation',
                                message:
                                    'Application layer cannot depend on Presentation layer',
                            },
                        ],
                    },
                ],
            },
        },
        // Infrastructure layer - can depend on infrastructure_boundary only
        {
            files: ['src/infrastructure/**/*.{ts,js}'],
            rules: {
                'import/no-restricted-paths': [
                    'error',
                    {
                        zones: [
                            {
                                target: './src/infrastructure',
                                from: './src/domain',
                                message:
                                    'Infrastructure layer cannot depend on Domain layer',
                            },
                            {
                                target: './src/infrastructure',
                                from: './src/application_boundary',
                                message:
                                    'Infrastructure layer cannot depend on Application boundary',
                            },
                            {
                                target: './src/infrastructure',
                                from: './src/application',
                                message:
                                    'Infrastructure layer cannot depend on Application layer',
                            },
                            {
                                target: './src/infrastructure',
                                from: './src/presentation',
                                message:
                                    'Infrastructure layer cannot depend on Presentation layer',
                            },
                        ],
                    },
                ],
            },
        },
        // Presentation layer - can depend on application_boundary and infrastructure_boundary
        {
            files: ['src/presentation/**/*.{ts,js}'],
            rules: {
                'import/no-restricted-paths': [
                    'error',
                    {
                        zones: [
                            {
                                target: './src/presentation',
                                from: './src/domain',
                                message:
                                    'Presentation layer cannot depend on Domain layer (use Application boundary instead)',
                            },
                            {
                                target: './src/presentation',
                                from: './src/application',
                                message:
                                    'Presentation layer cannot depend on Application implementations (use Application boundary instead)',
                            },
                            {
                                target: './src/presentation',
                                from: './src/infrastructure',
                                message:
                                    'Presentation layer cannot depend on Infrastructure implementations (use dependency injection instead)',
                            },
                        ],
                    },
                ],
            },
        },
        // Infrastructure Boundary layer - no dependencies
        // (Optional layer for library-specific service contracts)
        {
            files: ['src/infrastructure_boundary/**/*.{ts,js}'],
            rules: {
                'import/no-restricted-paths': [
                    'error',
                    {
                        zones: [
                            {
                                target: './src/infrastructure_boundary',
                                from: './src/domain',
                                message:
                                    'Infrastructure boundary cannot depend on Domain layer',
                            },
                            {
                                target: './src/infrastructure_boundary',
                                from: './src/application_boundary',
                                message:
                                    'Infrastructure boundary cannot depend on Application boundary',
                            },
                            {
                                target: './src/infrastructure_boundary',
                                from: './src/application',
                                message:
                                    'Infrastructure boundary cannot depend on Application layer',
                            },
                            {
                                target: './src/infrastructure_boundary',
                                from: './src/infrastructure',
                                message:
                                    'Infrastructure boundary cannot depend on Infrastructure implementations',
                            },
                            {
                                target: './src/infrastructure_boundary',
                                from: './src/presentation',
                                message:
                                    'Infrastructure boundary cannot depend on Presentation layer',
                            },
                        ],
                    },
                ],
            },
        },
    ],
};
