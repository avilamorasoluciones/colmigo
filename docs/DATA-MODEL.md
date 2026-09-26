# Colmigo — Modelo de datos base

## Entidades

### users
Identidad y preferencias generales. La autenticación debe quedar delegada a un sistema seguro de Auth.

### profiles
Nombre, foto, zona horaria, ciudad opcional, preferencias y configuración.

### tasks
Recordatorios, recurrencias, prioridad, fecha de vencimiento, estado y propietario.

### documents
Metadatos del archivo, categoría, fecha de vencimiento, storage key, propietario y permisos.

### payments
Nombre, importe, moneda, frecuencia, próximo vencimiento, estado y propietario. No contiene datos de tarjeta.

### vehicles
Placa, marca, modelo, año, SOAT, tecnomecánica, seguro y mantenimientos.

### households / household_members
Espacios familiares y permisos por miembro.

### subscriptions
Plan, proveedor, customer reference, estado, inicio, renovación y cancelación.

### notification_preferences
Canales y tipos de aviso permitidos.

### audit_events
Acciones sensibles para seguridad y soporte.

## Reglas

- UUIDs como identificadores externos.
- Timestamps en UTC.
- Zona horaria del usuario almacenada por separado.
- Foreign keys y restricciones.
- Row Level Security si se usa PostgreSQL/Supabase.
- No almacenar secretos de proveedores.
- Soft delete solo donde sea útil para recuperación/auditoría.
