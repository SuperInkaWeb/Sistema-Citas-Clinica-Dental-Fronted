# Sistema de Estilos Admin (Clínica Gallegos)

Este directorio introduce componentes y tokens para unificar la UI del panel de administración y las páginas de gestión de citas.

## Tokens
Definidos en `src/styles/admin/admin-tokens.css`.

## Componentes
- AdminPageLayout: Layout base con título y acciones.
- AdminCard: Contenedor con sombra y header opcional.
- AdminFormField: Wrapper accesible de campos de formulario con label, hint y error.
- AdminBadge: Badge de estado de cita.
- AdminToast: Mensajes temporales accesibles.
- CitaResumen: Lista de datos actuales de cita.
- HorarioSelector: Select de horarios hábiles dinámico.

## Convenciones CSS
Clases prefijadas con `admin-` y utilidades `u-*` para spacing rápido.

## Próximos pasos
- Migrar más vistas a estos componentes.
- Añadir pruebas unitarias.
- Considerar modo oscuro e internacionalización.

