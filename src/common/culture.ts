import z from 'zod';

export const cultureSchema = z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/);
export type Culture = z.infer<typeof cultureSchema>;
