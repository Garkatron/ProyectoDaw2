## **Usuarios**

* **id** (PK)
* nombre
* correo (único)
* tipo_usuario_id (**FK → TipoUsuario.id**)

---

## **UsuarioInsignia**

* usuario_id (**FK → Usuarios.id**)
* insignia_id (**FK → Insignias.id**)
* **PK (usuario_id, insignia_id)**

---

## **Insignias**

* **id** (PK)
* nombre

---

## **TipoUsuario**

* **id** (PK)
* nombre

---

## **TipoUsuarioPermisos**

* tipo_usuario_id (**FK → TipoUsuario.id**)
* permiso_id (**FK → Permisos.id**)
* **PK (tipo_usuario_id, permiso_id)**

---

## **Permisos**

* **id** (PK)
* nombre

---

## **PermisoUsuario**

* usuario_id (**FK → Usuarios.id**)
* permiso_id (**FK → Permisos.id**)
* **PK (usuario_id, permiso_id)**

---

## **Servicios**

* **id** (PK)
* nombre
* duracion_aprox

---

## **Citas**

* **id** (PK)
* requester_id (**FK → Usuarios.id**)
* replier_id (**FK → Usuarios.id**)
* servicio_id (**FK → Servicios.id**)
* fecha_hora
* estado
* precio
* monto_total
* comision_app
* metodo_pago
* moneda

---

## **Verificaciones**

* **id** (PK)
* usuario_id (**FK → Usuarios.id**)
* fecha
* correo
* estado

---

## **Reseñas**

* **id** (PK)
* requester_id (**FK → Usuarios.id**)
* replier_id (**FK → Usuarios.id**)
* cita_id (**FK → Citas.id**)
* texto
* puntos (0–5)

