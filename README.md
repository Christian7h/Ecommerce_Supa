# Adidas Chile Clone E-commerce

Una plataforma de comercio electrónico completa inspirada en Adidas Chile, con panel administrativo y diseño responsivo.

## Características

- Catálogo de productos con filtrado por categorías y búsqueda
- Detalle de productos con imágenes, descripción y opciones de compra
- Carrito de compras y proceso de checkout
- Panel de administración para gestión de productos y categorías
- Sistema de autenticación de usuarios
- Diseño responsivo para todos los dispositivos
- Integración con Supabase para base de datos y autenticación
- Integración con Cloudinary para almacenamiento de imágenes
- -Integracion con Transbank WebpayPlus modo Desarrollo 
- Personalización completa del sitio (banners, secciones destacadas, etc.)

## Tecnologías utilizadas

- React + TypeScript
- Vite como bundler
- Tailwind CSS para estilos
- React Router para enrutamiento
- Zustand para gestión de estado
- Supabase para base de datos, autenticación y almacenamiento
- Cloudinary para gestión de imágenes
- React Hook Form para formularios
- Lucide para iconos

## Requisitos previos

- Node.js (v18 o superior)
- NPM o Yarn
- Una cuenta en [Supabase](https://supabase.com/)
- Una cuenta en [Cloudinary](https://cloudinary.com/)

## Configuración

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/adidas-clone-ecommerce.git
   cd adidas-clone-ecommerce
   ```

2. Instala las dependencias:
   ```bash
   npm install
   # o
   yarn
   ```

3. Crea el archivo `.env` a partir del archivo `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Completa las variables de entorno en el archivo `.env`:
   - `VITE_SUPABASE_URL`: URL de tu proyecto de Supabase
   - `VITE_SUPABASE_ANON_KEY`: Clave anónima (pública) de tu proyecto de Supabase
   - `VITE_CLOUDINARY_CLOUD_NAME`: Nombre de tu cuenta en Cloudinary
   - `VITE_CLOUDINARY_UPLOAD_PRESET`: Preset de carga para Cloudinary

## Configuración de Supabase

1. Crea un nuevo proyecto en [Supabase](https://app.supabase.io/)
2. Ve a la sección SQL Editor
3. Ejecuta los scripts SQL que están en la carpeta `supabase/migrations` en orden:
   - `20250525185141_floating_band.sql` (estructura de la base de datos)
   - `20250525200000_seed_data.sql` (datos de ejemplo)

## Ejecución

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   yarn dev
   ```

2. Abre tu navegador en `http://localhost:5173`

## Acceso al panel de administración

- URL: `http://localhost:5173/admin`
- Credenciales por defecto:
  - Email: `admin@example.com`
  - Contraseña: `password`

## Estructura del proyecto

- `src/` - Código fuente
  - `components/` - Componentes reutilizables
  - `layouts/` - Layouts para páginas
  - `lib/` - Utilidades y configuración
  - `pages/` - Páginas de la aplicación
    - `admin/` - Páginas del panel de administración
  - `store/` - Gestión de estado con Zustand
  - `types/` - Definiciones de tipos TypeScript
- `public/` - Archivos públicos
- `supabase/` - Archivos de Supabase
  - `migrations/` - Scripts SQL para la base de datos

## Personalización

### Personalización de la tienda

1. Accede al panel de administración: `http://localhost:5173/admin`
2. Ve a la sección "Ajustes del Sitio" para configurar:
   - Información general de la tienda
   - Logotipo y colores
   - Moneda y configuraciones regionales

### Personalización de la página principal

1. Accede al panel de administración: `http://localhost:5173/admin`
2. Ve a la sección "Personalización" para configurar:
   - Slider principal
   - Categorías destacadas
   - Banner promocional

## Despliegue

Para compilar la aplicación para producción:

```bash
npm run build
# o
yarn build
```

El resultado de la compilación estará en la carpeta `dist/`, que puedes desplegar en cualquier servicio de hosting estático como Netlify, Vercel, Firebase Hosting, etc.

## Licencia

MIT
