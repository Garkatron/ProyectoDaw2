<p align="center">
    <img width="400" height="419" alt="limporapng" src="https://github.com/user-attachments/assets/c2c07497-48e6-4c02-865f-2dbd93ebc842" />
</p> 

<h1>
    <p align="center">
        Cleaning, Safety and Clarity
    </p>
</h1>

[README.ES](./README.ES.md)

## What is it?
Limpora is a web application and service that connects clients with freelance cleaning professionals, making it easy to get in touch, hire, and manage jobs in a clear, fast, and secure way.

## Technologies

### Runtime & Framework
- **Bun**: Runtime and environment manager (env variables built-in)
- **ElysiaJS**: High-performance TypeScript web framework
- **TypeScript**: Primary language across the full stack

### Frontend
- Mantine UI
- Zustand (global state)
- Zod (client-side validation)

### Backend
The backend uses Bun as the runtime and ElysiaJS as the framework, leveraging TypeScript's native speed to deliver a high-performance REST API.

- **Database:** SQLite
- **Validation:** TypeBox
- **Authentication:** Firebase & googleapis (Email auth + OAuth)


## API Architecture

The API is organized into independent modules. Each module encapsulates all its logic in the following files. Modules may not always have a Router, Queries, or specific Middleware — but they will always have a `service` and a `model`.

```
modules/
└── <module>/
    ├── index.ts       # Router + endpoints
    ├── model.ts       # Data types (source of truth)
    ├── queries.ts     # Database access
    ├── service.ts     # Business logic
    ├── guard.ts       # Auth middleware
    └── test.ts        # Integration and unit tests
```


| File | Responsibility |
|---|---|
| `index.ts` | Defines HTTP routes and connects endpoints to handlers |
| `model.ts` | Declares types and schemas; the module's source of truth |
| `queries.ts` | Centralizes all database queries for the module |
| `service.ts` | Abstract class with static methods implementing business logic |
| `guard.ts` | Verifies and validates the access token before reaching the handler |
| `test.ts` | Integration and unit tests for both endpoints and service logic |


## Security
- Email verification for non-OAuth accounts
- CORS
- HPP (HTTP Parameter Pollution protection)
- `elysia-helmet`
- Rate limiting via `elysia-rate-limit`
- Role management with Firebase
- Endpoint authentication via Firebase tokens


## Observability & Logging
- **pino** + **pino-http**


## Documentation (localhost:port/docs)
- Interactive and auto-generated API docs
- Easy frontend integration
- OpenAPI standard
- Designed for low maintenance and easy extension


## Development Tools
- **eslint-define-config** — Linting configuration
- **bun:test** — Testing library (built into Bun)
- **bun env** — Environment variable management (built into Bun)
