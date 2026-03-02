import { treaty, type Treaty } from '@elysiajs/eden'
import type { App } from '../../../server/src/index.ts'

export const API: Treaty.Create<App> = treaty<App>(
    import.meta.env.MODE === 'production'
        ? 'https://api.limpora.xyz'
        : 'localhost:3001',
    {
        headers: () => ({
            Authorization: `Bearer ${localStorage.getItem('firebase_token') ?? ''}`,
        }),
    }
)

