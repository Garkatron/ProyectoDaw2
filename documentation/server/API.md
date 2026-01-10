# API Routes

Prefijo: /api/v1

---

## 1️Servicios

### Servicios globales (catálogo de la app)

- **GET /services**Lista de servicios disponibles en la app.
- **GET /services/{serviceId}**Información de un servicio específico.
- **POST /services**Crear un nuevo servicio global.
- **PATCH /services/{serviceId}**
  Actualizar información del servicio global.

---

### Servicios de usuario (autónomo)

- **GET /users/{userId}/services**Lista de servicios que ofrece el usuario.
- **GET /users/{userId}/services/{serviceId}**Detalle de un servicio específico del usuario.
- **POST /users/{userId}/services**Agregar un servicio del catálogo al perfil del usuario.
- **PATCH /users/{userId}/services/{serviceId}**Actualiza información del servicio del usuario (precio, disponibilidad, extras).
- **DELETE /users/{userId}/services/{serviceId}**
  Elimina un servicio del perfil del usuario.

---

## 2️Ganancias

- **GET /users/{userId}/earnings**Obtiene información sobre las ganancias del usuario.
---

## 3️Review / Calificaciones

- **GET /users/{userId}/review**Obtiene las reviews del usuario.
- **PUT /users/{userId}/review**Añade una review al usuario.
- **PATCH /users/{userId}/review**Actualiza una review del usuario.
- **DELETE /users/{userId}/review**
  Elimina una review del usuario.

---

## Citas / Appointments

- **GET /users/{userId}/appointments**Obtiene las citas del usuario.
- **POST /users/{userId}/appointments**
  Reserva una cita para un servicio específico del usuario.
  Incluye flag booleana para cancelar la cita si aplica.

---

## App

- **GET /users/top**
  Obtiene el top de usuarios por review.
  Opciones de paginación disponibles.

---

## Usuario

Gestionado por la API de usuarios externa (Firebase, microservicio).
Los endpoints de usuario incluyen autenticación y manejo de datos personales.

---

# FORMATO JSON DE RESPUESTA DE LOS ENDPOINTS
Todos los endpoints de la API devuelven respuestas en formato JSON y siguen una estructura común para éxito y error.
El estado de la operación se determina siempre por el código HTTP.

### Exito (codigo 2xx)
Se devuelve cuando la petición se procesa correctamente.
```json
{
  "success": false,
  "data": {},
  "details": []
}
```
**Data**: Información devuelta por el endpoint. Puede ser un objeto, un array o un valor simple.
**Details**: Objeto con datos.
- **Code**: Código para uso interno y manejo en frontend.
- **Message**: Mensaje descriptivo.

### Error (codigo 4xx - 5xx)
Se devuelve cuando ocurre un error del cliente o del servidor.
```json
{
  "errors": [
    {
        "code": "VALIDATION_ERROR",
        "message": "Invalid data"
    }
  ]
}
```
**Errors**: Lista de errores ocurridos durante la petición.
Contiene objetos que contienen 2 campos:
- **Code**: Código del error para uso interno y manejo en frontend.
- **Message**: Mensaje descriptivo del error.

# Codigos de errores
Hay un objeto que recauda varios errores para ser usados donde se necesiten y agregarle mas si es necesario.