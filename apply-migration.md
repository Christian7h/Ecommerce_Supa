# Instrucciones para aplicar la migración SQL

## Paso 1: Ejecutar la migración en Supabase

Para aplicar la migración que añade los campos adicionales al perfil:

1. **Acceder al Dashboard de Supabase:**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Abrir el Editor SQL:**
   - En el menú lateral, haz clic en "SQL Editor"
   - Haz clic en "New query"

3. **Ejecutar la migración:**
   - Copia y pega el contenido del archivo `supabase/migrations/20250527000001_add_role_to_profiles.sql`
   - Haz clic en "Run" para ejecutar la migración

## Contenido de la migración:

```sql
/*
  # Modificación de la tabla profiles

  Esta migración:
  1. Añade el campo 'role' a la tabla profiles para diferenciar entre usuarios admin y customer
  2. Añade campos adicionales para información de perfil completa
  3. Establece el valor por defecto como 'customer' para los nuevos registros
  4. Actualiza los perfiles existentes sin rol asignado
*/

-- Añadir campo de rol a la tabla profiles si no existe
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer';

-- Añadir campos adicionales para información de perfil si no existen
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;

-- Actualizar los perfiles existentes que no tienen un rol asignado
UPDATE profiles 
SET role = 'customer' 
WHERE role IS NULL;

-- Crear índice para búsquedas por rol
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Asegurar que la política RLS permita acceder al rol y otros campos
CREATE OR REPLACE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE OR REPLACE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
```

## Paso 2: Verificar la migración

Después de ejecutar la migración, verifica que se aplicó correctamente:

1. **En el Dashboard de Supabase:**
   - Ve a "Table Editor"
   - Selecciona la tabla "profiles"
   - Verifica que los nuevos campos aparezcan: `role`, `address`, `city`, `postal_code`, `phone`

2. **Verificar las políticas RLS:**
   - Ve a "Authentication" > "Policies"
   - Verifica que las políticas para la tabla `profiles` estén activas

## Paso 3: Crear un usuario administrador (opcional)

Si necesitas crear un usuario administrador:

1. **Registra un usuario normalmente desde la aplicación**

2. **Actualizar el rol en la base de datos:**
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'tu-email-admin@ejemplo.com';
   ```

## Estado de las funcionalidades implementadas

✅ **Completado:**
- Sistema de autenticación con roles (admin/customer)
- Página de perfil con validaciones y manejo de errores
- Creación automática de perfil en tabla `profiles` al registrarse
- Verificación de acceso administrativo
- Mensaje de verificación de email en login
- Migración SQL con todos los campos necesarios

⏳ **Pendiente:**
- Ejecutar la migración en Supabase
- Probar el flujo completo de la aplicación

## Notas importantes

- La migración es segura y usa `IF NOT EXISTS` para evitar errores si ya existen los campos
- Los usuarios existentes mantendrán sus datos y se les asignará automáticamente el rol 'customer'
- El sistema está preparado para diferenciar entre usuarios admin y customer
- La página de perfil incluye validaciones client-side y indicadores visuales de cambios
