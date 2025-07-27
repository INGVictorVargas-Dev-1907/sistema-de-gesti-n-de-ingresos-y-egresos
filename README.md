# Sistema de Gestión Financiera

Sistema web completo para la gestión de ingresos y egresos, con control de usuarios y generación de reportes financieros.

---

## 📚 Tabla de Contenidos

- [🧱 Arquitectura Hexagonal + Principios SOLID](#-arquitectura-hexagonal--principios-solid)
  - [Principios SOLID Aplicados](#principios-solid--aplicados)
- [📁 Estructura del Proyecto](#estructura-del-proyecto)
- [🚀 Tecnologías](#-tecnologías)
- [📋 Funcionalidades](#-funcionalidades)
  - [Roles y Permisos](#roles-y-permisos)
  - [Gestión de Transacciones](#gestión-de-transacciones)
  - [Gestión de Usuarios](#gestión-de-usuarios)
  - [Reportes Financieros](#reportes-financieros)
  - [API y Documentación](#api-y-documentación)
- [🛠️ Instalación y Configuración](#️-instalación-y-configuración)
- [🧪 Testing](#-testing)
- [📚 Documentación de la API](#documentación-de-la-api)
- [🚀 Despliegue en Vercel](#-despliegue-en-vercel)
- [🔐 Seguridad](#-seguridad)
- [📈 Metodología Ágil](#-metodología-ágil)
- [🤝 Contribución](#-contribución)
- [👤 Autor](#autor)
- [📄 Licencia](#-licencia)

---

## 🧱 Arquitectura Hexagonal + Principios SOLID

El proyecto está construido siguiendo la **Arquitectura Hexagonal (Ports & Adapters)**, facilitando la separación de responsabilidades, la testabilidad y la extensibilidad.

---

### Principios SOLID  Aplicados

- **S**: Cada clase/módulo tiene una sola responsabilidad.
- **O**: Abierto a extensión, cerrado a modificación.
- **L**: Sustitución segura de abstracciones.
- **I**: Interfaces segregadas y específicas.
- **D**: Las dependencias se inyectan hacia abstracciones.

---

### Estructura del Proyecto

```
project/
├── __tests__/              # Pruebas automatizadas unitarias de servicios y rutas API
│   ├── api/                # Tests para endpoints (ej. transacciones)
│   └── domain/             # Tests para lógica de negocio (servicios de dominio)
│
├── app/                    # Archivos globales de estilo y layout de Next.js
│   ├── globals.css         # Estilos globales de Tailwind
│   └── layout.tsx          # Componente raíz para layout (Next.js App Router)
│
├── components/             # Componentes reutilizables del frontend
│   ├── layout/             # Layout general de la aplicación (Navbar, Sidebar, etc.)
│   ├── reports/            # Componentes de visualización de reportes financieros
│   ├── transactions/       # Formularios y tablas para transacciones
│   ├── ui/                 # Componentes de UI personalizados (basados en Shadcn/ui)
│   ├── users/              # Componentes para gestión de usuarios
│
├── hooks/                  # Hooks personalizados reutilizables
│   └── use-toast.ts        # Hook para sistema de notificaciones
│
├── lib/                    # Funciones utilitarias generales
│   └── utils.ts            # Funciones auxiliares (helpers)
│
├── pages/                  # Páginas y rutas de la aplicación (Next.js Pages Router)
│   ├── api/                # Endpoints de API (Next.js API Routes)
│   ├── reports/            # Página de reportes financieros
│   ├── transactions/       # Página de transacciones
│   ├── users/              # Página de gestión de usuarios
│   ├── _app.tsx            # Configuración global de la app (providers, layout, etc.)
│   ├── docs.tsx            # Página de documentación de la API (Swagger UI)
│   └── index.tsx           # Página principal (dashboard)
│
├── prisma/                 # Archivos de configuración y migración de base de datos
│   ├── migrations/         # Historial de migraciones
│   └── schema.prisma       # Definición del modelo de datos con Prisma
│
├── src/                    # Lógica principal del negocio (arquitectura hexagonal/DDD)
│   ├── core/               # Núcleo de la lógica de negocio
│   │   ├── application/    # Casos de uso y puertos de aplicación
│   │   ├── domain/         # Entidades del dominio
│   ├── infraestructure/    # Implementaciones concretas (ej: repositorios con Prisma)
│   ├── lib/                # Lógica compartida: validaciones, autenticación, Swagger, DB
│
├── types/                  # Tipos globales TypeScript
│   ├── index.ts
│   └── next-auth.d.ts      # Tipado personalizado para autenticación
│
├── .env                    # Variables de entorno
├── README.md               # Documentación del proyecto
├── tailwind.config.ts      # Configuración de Tailwind CSS
├── tsconfig.json           # Configuración de TypeScript
├── vitest.config.ts        # Configuración para Vitest
└── vite.setup.ts           # Setup personalizado para entorno de testing

```

---


## 🚀 Tecnologías

| Categoría      | Stack                                                  |
|----------------|--------------------------------------------------------|
| Frontend       | Next.js 13, TypeScript, Tailwind CSS, Shadcn/ui       |
| Backend        | API Routes de Next.js, Prisma ORM                     |
| Base de Datos  | PostgreSQL (Supabase como servicio backend)           |
| Autenticación  | NextAuth.js con OAuth (GitHub)                        |
| Testing        | Vitest                                                 |
| Gráficas       | Recharts (para reportes financieros)                  |
| Documentación  | Swagger / OpenAPI                                      |

---

## 📋 Funcionalidades

### Roles y Permisos
- **Usuario**: Acceso a visualización de transacciones ¡ solo vista!
- **Administrador**: Acceso completo (gestión de usuarios, transacciones y reportes)

### Gestión de Transacciones
- ✅ Vista de ingresos y egresos con tabla completa
- ✅ Creación de nuevas transacciones (solo admins)
- ✅ Eliminación de transacciones (solo admins)
- ✅ Filtrado y búsqueda

### Gestión de Usuarios
- ✅ Lista completa de usuarios (solo admins)
- ✅ Edición de roles y datos de usuario
- ✅ Control de acceso basado en roles (RBAC)

### Reportes Financieros
- ✅ Gráfico de movimientos financieros por mes
- ✅ Resumen de balance, ingresos y egresos
- ✅ Descarga de reportes en formato CSV
- ✅ Visualización de métricas clave

### API y Documentación
- ✅ API REST completamente documentada
- ✅ Swagger UI disponible en `/docs`
- ✅ Validación de datos con Zod
- ✅ Manejo de errores estructurado

---

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- PostgreSQL
- Cuenta de GitHub (para OAuth)

### Paso 1: Clonar e instalar dependencias

```bash
git clone <repository-url>
cd financial-management-system
npm install
```

### Paso 2: Configurar variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# 🔗 Supabase PostgreSQL (reemplaza la base local en producción)
DATABASE_URL="postgresql://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/<DATABASE_NAME>"

# 🛡️ NextAuth.js configuración
NEXTAUTH_SECRET="<GENERATE_A_SECURE_SECRET>"
NEXTAUTH_URL="http://localhost:3000" # o tu dominio de producción

# 🔐 GitHub OAuth para autenticación con NextAuth
GITHUB_CLIENT_ID="<YOUR_GITHUB_CLIENT_ID>"
GITHUB_CLIENT_SECRET="<YOUR_GITHUB_CLIENT_SECRET>"

# 💾 (Opcional) base de datos local para entorno de desarrollo
LOCAL_DATABASE_URL="postgresql://<USERNAME>:<PASSWORD>@localhost:5432/<DATABASE_NAME>"
```

### Paso 3: Configurar GitHub OAuth

1. Ve a GitHub Settings > Developer settings > OAuth Apps
2. Crea una nueva OAuth App:
   - Application name: `Sistema Gestión Financiera`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copia el Client ID y Client Secret al archivo `.env`

### Paso 4: Configurar base de datos

```bash
# Generar cliente Prisma
npm run db:generate

# Sincronizar esquema con la base de datos
npm run db:push
```

### Paso 5: Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 🧪 Testing

Ejecutar pruebas unitarias:

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar en modo watch
npm run test:watch

# Ejecutar con UI
npm run test:ui
```

Las pruebas cubren:
- Servicios de dominio
- Casos de uso
- Endpoints de API

---

## 📚 Documentación de la API

La documentación completa de la API está disponible en:
- **Desarrollo**: `http://localhost:3000/docs`
- **Producción**: `https://tu-dominio.com/docs`

---

### Endpoints principales:

- `GET /api/transactions` - Listar transacciones
- `POST /api/transactions` - Crear transacción (admin)
- `PUT /api/transactions/{id}` - Actualizar transacción (admin)
- `DELETE /api/transactions/{id}` - Eliminar transacción (admin)
- `GET /api/users` - Listar usuarios (admin)
- `PUT /api/users/{id}` - Actualizar usuario (admin)
- `GET /api/reports/financial` - Reporte financiero (admin)
- `GET /api/reports/csv` - Descargar CSV (admin)

---

## 🚀 Despliegue en Vercel

### Preparación para despliegue:

1. **Configurar Supabase**:
   - Crea un proyecto en [Supabase](https://supabase.com)
   - Obtén la URL de la base de datos
   - Actualiza `DATABASE_URL` en las variables de entorno

2. **Configurar variables de entorno en Vercel**:
   ```
   # 🔗 Supabase PostgreSQL (reemplaza la base local en producción)
DATABASE_URL="postgresql://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/<DATABASE_NAME>"

# 🛡️ NextAuth.js configuración
NEXTAUTH_SECRET="<GENERATE_A_SECURE_SECRET>"
NEXTAUTH_URL="http://localhost:3000" # o tu dominio de producción

# 🔐 GitHub OAuth para autenticación con NextAuth
GITHUB_CLIENT_ID="<YOUR_GITHUB_CLIENT_ID>"
GITHUB_CLIENT_SECRET="<YOUR_GITHUB_CLIENT_SECRET>"

# 💾 (Opcional) base de datos local para entorno de desarrollo
LOCAL_DATABASE_URL="postgresql://<USERNAME>:<PASSWORD>@localhost:5432/<DATABASE_NAME>"
   ```

3. **Actualizar callback de GitHub**:
   - Authorization callback URL: `https://tu-dominio.vercel.app/api/auth/callback/github`

### Comandos de despliegue:

```bash
# Build de producción
npm run build

# Desplegar (si usas Vercel CLI)
vercel --prod
```

---

## 🔐 Seguridad

- **Autenticación**: OAuth con GitHub usando NextAuth.js
- **Autorización**: Control de acceso basado en roles (RBAC)
- **Validación**: Schemas con Zod en frontend y backend
- **Protección de rutas**: Middleware de autenticación en todas las APIs
- **Variables de entorno**: Configuración segura para credenciales

---

## 📈 Metodología Ágil

Este proyecto sigue principios de **Scrum/Kanban**:

- **Desarrollo iterativo** con sprints cortos
- **Entrega continua** de valor
- **Refactoring constante** para mantener calidad del código
- **Testing** como parte integral del desarrollo
- **Documentación** viva y actualizada

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## Autor
Victor Alfonso Vargas Diaz

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---
