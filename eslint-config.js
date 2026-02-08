const plugin = require('eslint-plugin-import');

/**
 * ESLint configuration for enforcing Clean Architecture layer boundaries.
 * Can be used by both this project and consumers of the library.
 */
module.exports = {
    rules: {
        // Base import rules
        'import/no-restricted-paths': 'off', // Will be overridden in overrides
    },
    overrides: [
        // Clean Architecture: Domain layer - NO dependencies
        {
            files: ['src/domain/**/*.{ts,js}'],
            rules: {
                'import/no-restricted-paths': [
                    'error',
                    {
                        zones: [
                            {
                                target: './src/domain',
                                from: './src/application',
                                message:
                                    'Domain layer cannot depend on Application layer',
                            },
                            {
                                target: './src/domain',
                                from: './src/application_boundary',
                                message:
                                    'Domain layer cannot depend on Application boundary',
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
                            {
                                target: './src/domain',
                                from: './src/infrastructure_boundary',
                                message:
                                    'Domain layer cannot depend on Infrastructure boundary',
                            },
                        ],
                    },
                ],
            },
        },
        // Clean Architecture: Application Boundary layer - contracts only
        {
            files: ['src/application_boundary/**/*.{ts,js}'],
            rules: {
                'import/no-restricted-paths': [
                    'error',
                    {
                        zones: [
                            {
                                target: './src/application_boundary',
                                from: './src/application',
                                message:
                                    'Application boundary cannot depend on Application implementations',
                            },
                            {
                                target: './src/application_boundary',
                                from: './src/infrastructure',
                                message:
                                    'Application boundary cannot depend on Infrastructure layer',
                            },
                            {
                                target: './src/application_boundary',
                                from: './src/infrastructure_boundary',
                                message:
                                    'Application boundary cannot depend on Infrastructure boundary',
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
        // Clean Architecture: Application layer - can only depend on Domain and Application Boundary
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
                                    'Application layer cannot depend on Infrastructure layer',
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
        // Clean Architecture: Infrastructure layer - can only depend on Domain, Application and Application Boundary
        {
            files: ['src/infrastructure/**/*.{ts,js}'],
            rules: {
                'import/no-restricted-paths': [
                    'error',
                    {
                        zones: [
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
        // Presentation layer restrictions
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
                                    'Presentation layer cannot depend on Domain layer',
                            },
                            {
                                target: './src/presentation',
                                from: './src/application',
                                message:
                                    'Presentation layer cannot depend on Application implementations (use Application Boundary instead)',
                            },
                            {
                                target: './src/presentation',
                                from: './src/infrastructure',
                                message:
                                    'Presentation layer cannot depend on Infrastructure implementations',
                            },
                        ],
                    },
                ],
            },
        },
    ],
};
