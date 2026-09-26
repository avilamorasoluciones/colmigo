# Colmigo — Ruta de producción

La rama `main` es el entorno de pruebas de GitHub Pages. No contiene secretos.

## Principio

La interfaz no debe conocer credenciales, llaves privadas ni secretos de proveedores. El cambio a producción debe conservar las pantallas y reemplazar únicamente los adaptadores.

```
PWA/Web
  ↓
API HTTPS
  ├── Auth / sesiones
  ├── PostgreSQL
  ├── Storage privado
  ├── Notificaciones
  ├── Automatizaciones
  └── Pagos / webhooks
```

## Contratos previstos

- `GET /api/auth/session`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `POST /api/auth/recovery`
- `GET/POST/PATCH/DELETE /api/tasks`
- `GET/POST/PATCH/DELETE /api/documents`
- `GET/POST/PATCH/DELETE /api/payments`
- `GET/POST/PATCH/DELETE /api/vehicles`
- `GET/POST/PATCH/DELETE /api/family`
- `GET/POST /api/notifications/preferences`
- `POST /api/billing/checkout`
- `POST /api/webhooks/payment`

Los nombres son contratos de referencia; el backend puede implementarlos con Flask/FastAPI/Node u otra tecnología.

## Datos

Cada registro debe pertenecer a un usuario o espacio familiar mediante IDs del servidor. Nunca confiar en un `user_id` enviado por el navegador.

Documentos: almacenamiento privado, cifrado cuando corresponda, control de acceso y URLs temporales.

## Auth

Producción debe tener:
- correo verificado;
- recuperación de cuenta;
- sesiones revocables;
- protección contra fuerza bruta;
- rate limiting;
- cookies seguras/httpOnly cuando la arquitectura lo permita;
- 2FA opcional;
- cierre de sesión de otros dispositivos;
- auditoría de acciones sensibles.

## Pagos

No guardar números de tarjeta en Colmigo. El navegador solicita checkout al servidor; el proveedor procesa el pago; un webhook firmado confirma el estado; el servidor actualiza la suscripción.

## Notificaciones

Una sola capa de preferencias debe controlar push, correo y recordatorios. Los trabajos programados deben vivir en servidor, no en el navegador.

## Migración

1. Configurar dominio y HTTPS.
2. Crear PostgreSQL.
3. Crear Auth.
4. Crear Storage privado.
5. Configurar API.
6. Configurar proveedor de correo.
7. Configurar push.
8. Configurar pagos y webhooks.
9. Ejecutar pruebas de seguridad.
10. Cambiar `CONFIG.mode` y `backendUrl` mediante configuración de despliegue.
11. Activar `authRequired=true`.
12. Hacer pruebas de migración y respaldo antes de abrir registros públicos.

Nunca subir secretos al repositorio.
