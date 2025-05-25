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
