# Acortador de links

### tecnologias

- Backend
  - Mongo DB
  - Node/Bun 
  - TS ? JS

- Frontend
  - React
  - JS

### Endpoints

* **Gestion de link**

  * **POST /shorten**
    Recibe una URL larga y devuelve un código corto generado.

  * **GET /:code**
    Busca el código en la base de datos y redirige a la URL original.

  * **GET /stats/:code**
    Muestra métricas del link: clics, fecha de creación, etc.

  * **PUT /:code**
    Permite actualizar la URL original asociada al código.

  * **DELETE /:code**
    Elimina el link corto y sus datos.

---

### Gestion de usuarios
- Permisos

  - ADMIN

  - DELETE_LINK
  - CREATE_LINK
  - EDIT_LINK

  - DELETE_USER
  - CREATE_USER
  - EDIT_USER