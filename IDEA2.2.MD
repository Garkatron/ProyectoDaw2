# Base de Datos

## Usuarios
 
* `id` (PK)
* `nombre`
* `correo` (único)
* `insignias` (array FK)
* `tipo_usuario_id` (FK → TipoUsuario)
* `permisos` (FK → PermisoUsuario, tabla intermedia)

---****

## Insignias
* `id` (PK)
* `nombre`
* `usuario_id` (FK → Usuarios)

---

## TipoUsuario

* `id` (PK)
* `nombre` (Admin, Requester, Replier)

---

## Permisos

* `id` (PK)
* `nombre` (ej: crear_servicio, editar_servicio, pedir_cita, etc.)
* Permisos 
  * Admin (editar, eliminar, añadir contenido no propio) 
  * Crear servicio (admin) 
  * Editar servicio (admin) 
  * Eliminar servicio (admin) 
  * Eliminar usuario 
  * Editar usuario 
  * Crear usuario 
  * Añadir servicio (replier) 
  * Editar tarifa (replier) 
  * Remover servicio (replier) 
  * Cancelar cita (replier) 
  * Pedir cita (requester) 
  * Cancelar cita (requester) 
  * Editar cita (requester)

---

## PermisoUsuario

* `id` (PK)
* `usuario_id` (FK → Usuarios)
* `permiso_id` (FK → Permisos)

---

## Servicios

* `id` (PK)
* `nombre` (ej: limpieza interior, exterior, piscina)
* `duracion_aprox` (minutos)

---

## Citas

* `id` (PK)
* `requester_id` (FK → Usuarios)
* `replier_id` (FK → Usuarios)
* `servicio_id` (FK → Servicios)
* `fecha_hora`
* `estado` (pendiente, confirmado, cancelado, terminado)
* `precio`
* `monto_total`
* `comision_app`
* `metodo_pago`
* `moneda`

---

## Verificaciones

* `id` (PK)
* `usuario_id` (FK → Usuarios)
* `fecha`
* `correo`
* `estado` (no_confirmado, confirmado)


---

## Reseñas

* `id` (PK)
* `requester_id` (FK → Usuarios)
* `replier_id` (FK → Usuarios)
* `texto`
* `puntos` (0-5)

