import { treaty } from '@elysiajs/eden'

export const api = treaty(
    import.meta.env.MODE === 'production'
        ? 'https://api.limpora.xyz'
        : 'localhost:3001'
)