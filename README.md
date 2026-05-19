# Mi Boleta

Aplicación frontend para gestionar boletas, rifas y tickets de juegos de azar.

## Tecnologías

- React 18 + TypeScript + Vite
- React Router v6
- Tailwind CSS v3
- Axios
- React Hook Form + Zod
- Context API

## Requisitos previos

- Node.js 18+
- npm 9+
- Backend API corriendo en `http://localhost:4000`

## Variables de entorno

Copia el archivo `.env.example` y ajusta los valores:

```bash
cp .env.example .env
```

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL base de la API REST | `http://localhost:4000/api/v1` |

## Instalación y desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`

## Compilación para producción

```bash
npm run build
npm run preview
```

## Estructura del proyecto

```
src/
├── types/          # Tipos TypeScript globales
├── services/       # Llamadas a la API (axios)
├── context/        # Estado global (AuthContext)
├── hooks/          # Custom hooks (useAuth, useTickets)
├── components/
│   ├── ui/         # Componentes reutilizables (Button, Input, Modal...)
│   └── layout/     # Navbar, Layout, ProtectedRoute
├── pages/          # Vistas/páginas de la aplicación
├── router/         # Configuración de React Router
└── utils/          # Funciones de utilidad
```

## Rutas disponibles

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | Público | Inicio de sesión |
| `/register` | Público | Registro de usuarios |
| `/dashboard` | Autenticado | Resumen y estadísticas |
| `/tickets` | Autenticado | Lista de boletas |
| `/tickets/new` | Autenticado | Crear boleta |
| `/tickets/:id` | Autenticado | Detalle de boleta |
| `/tickets/:id/edit` | Autenticado | Editar boleta |
| `/admin` | Admin | Panel de administración |

## Screenshots

> _Capturas de pantalla pendientes de agregar_

## Funcionalidades principales

- **Autenticación**: Registro, login con JWT, persistencia de sesión, logout
- **CRUD de boletas**: Crear, editar, ver y eliminar con confirmación
- **Dashboard**: Estadísticas de total, próximos sorteos y pendientes
- **Admin**: Vista de todos los tickets del sistema con filtros avanzados
- **Validaciones**: React Hook Form + Zod con errores inline
- **UX**: Loading states, empty states, diseño responsive con tema indigo/purple
