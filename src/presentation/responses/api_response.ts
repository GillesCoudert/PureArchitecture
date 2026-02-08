import z from 'zod';
import { cultureSchema, Culture } from '../../common/culture';

export interface ApiResponseTrace {
    code: string;
    context?: unknown;
    localizedMessage?: string;
}

export interface ApiResponsePagination {
    pageNumber: number;
    pageSize: number;
    count?: number;
}

export interface ApiResponseMetadata {
    culture?: Culture;
    pagination?: ApiResponsePagination;
    trace?: ApiResponseTrace[];
}

export type ApiResponse<T> =
    | {
          success: true;
          data?: T | T[];
          metadata?: ApiResponseMetadata;
      }
    | {
          success: false;
          errors: ApiResponseTrace[];
          metadata?: ApiResponseMetadata;
      };

const apiResponseTraceSchema = z.object({
    code: z.string(),
    context: z.json().optional(),
    localizedMessage: z.string().optional(),
});

const apiResponsePaginationSchema = z.object({
    pageNumber: z.number(),
    pageSize: z.number(),
    count: z.number().optional(),
});

const apiResponseMetadataSchema = z.object({
    culture: cultureSchema.optional(),
    pagination: apiResponsePaginationSchema.optional(),
    trace: apiResponseTraceSchema.array().optional(),
});

export const apiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
    z.discriminatedUnion('success', [
        z.object({
            success: z.literal(true),
            data: z.union([schema, schema.array()]).optional(),
            metadata: apiResponseMetadataSchema.optional(),
        }),
        z.object({
            success: z.literal(false),
            errors: apiResponseTraceSchema.array(),
            metadata: apiResponseMetadataSchema.optional(),
        }),
    ]);
