import {z} from 'zod';

export const SomeApiSchema = z.object({
    host: z.string(),
    rateLimit: z.object({
        pMin: z.number()
    }).strict()
}).strict();
