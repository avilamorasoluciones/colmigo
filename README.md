# Colmigo 🇨🇴

**Tu vida, en un solo lugar.**

Colmigo es una plataforma digital colombiana pensada para reunir recordatorios, documentos, hogar, movilidad, pagos, familia, servicios de Colombia y, posteriormente, productos para colegios, empresas y comunidades.

## Demo actual

La primera versión es una **PWA estática preparada para GitHub Pages**.

- No exige login en demo.
- Funciona con datos de demostración en el navegador.
- Diseño mobile-first tipo app.
- Bootstrap 5 + Font Awesome.
- Responsive para móvil, tablet y escritorio.
- Modo claro/oscuro persistente.
- Recordatorios, documentos, hogar, movilidad, pagos, familia, Colombia, asistente y Colmigo Plus.
- Manifest + service worker + instalación PWA.
- Splash screen e invitación de instalación.
- SEO básico, Open Graph, robots y sitemap.
- Identidad visual SVG propia con colores inspirados en Colombia.

## Arquitectura prevista

```
Android / iOS / Web / PWA
          ↓
      API segura
          ↓
  Auth + PostgreSQL
          ↓
 Storage + Notificaciones
          ↓
 Pagos + Suscripciones
```

La autenticación obligatoria se activará cuando exista backend. Los pagos digitales deben delegarse a proveedores especializados; **Colmigo no debe almacenar números de tarjeta**. Las confirmaciones de pago deben validarse mediante webhooks en servidor.

## Próximas etapas

1. Backend y cuentas reales.
2. PostgreSQL y separación segura de datos por usuario.
3. Autenticación, recuperación de cuenta y 2FA.
4. Sincronización multi-dispositivo.
5. Suscripciones y funciones Free/Plus.
6. Integración de pagos colombianos e internacionales.
7. Notificaciones push.
8. Publicación Android/iOS usando el mismo backend.
9. Módulos de educación, empresas y comunidades.
