## 🇪🇸 Español

# Limpora
### Limpieza, Seguridad y Claridad

## ¿Qué es?
Limpora es una aplicación y servicio web que conecta a clientes con autónomos especializados en servicios de limpieza, facilitando el contacto, la contratación y la gestión de trabajos de forma clara, rápida y segura.

## Tecnologías

### Runtime & Framework
- **Bun** — Runtime y gestor de entorno (variables de entorno integradas)
- **ElysiaJS** — Framework web de alto rendimiento en TypeScript
- **TypeScript** — Lenguaje principal en todo el stack

### Frontend
- Mantine UI
- Zustand (estado global)
- Zod (validación en cliente)

### Backend
El backend utiliza Bun como runtime y ElysiaJS como framework, aprovechando la velocidad nativa de TypeScript para ofrecer una API REST de alto rendimiento.

- **Base de datos:** SQLite
- **Validación:** TypeBox
- **Autenticación:** Firebase & googleapis (Email auth + OAuth)

## Arquitectura de la API

La API está organizada en módulos independientes. Cada módulo encapsula toda su lógica en los siguientes archivos. Los módulos pueden no tener Router, Queries ni Middleware específico, pero siempre tendrán `service` y `model`.

```
modules/
└── <modulo>/
    ├── index.ts       # Router + endpoints
    ├── model.ts       # Tipos de datos (fuente de verdad)
    ├── queries.ts     # Acceso a base de datos
    ├── service.ts     # Lógica de negocio
    ├── guard.ts       # Middleware de auth
    └── test.ts        # Tests de integración y unitarios
```

| Archivo | Responsabilidad |
|---|---|
| `index.ts` | Define las rutas HTTP y conecta endpoints con handlers |
| `model.ts` | Declara tipos y esquemas; fuente de verdad del módulo |
| `queries.ts` | Centraliza todas las consultas a la base de datos |
| `service.ts` | Clase abstracta con métodos estáticos de lógica de negocio |
| `guard.ts` | Verifica y valida el token de acceso antes del handler |
| `test.ts` | Tests de integración y unitarios para endpoints y servicios |

## Seguridad
- Verificación de email para cuentas sin OAuth
- CORS
- HPP (HTTP Parameter Pollution)
- `elysia-helmet`
- Rate limiting con `elysia-rate-limit`
- Roles gestionados con Firebase
- Autenticación de endpoints mediante token Firebase

## Observabilidad & Logging
- **pino** + **pino-http**

## Documentación
- Documentación interactiva y automática (generada)
- Fácil integración con el frontend
- Estándar OpenAPI
- Diseñada para bajo mantenimiento y fácil extensión

## Herramientas de Desarrollo
- **eslint-define-config** — Configuración de linting
- **bun:test** — Librería de testing (integrada en Bun)
- **bun env** — Gestión de variables de entorno (integrada en Bun)

