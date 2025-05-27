-- Solución más directa: Deshabilitar RLS en profiles y crear política simple
-- Eliminar políticas problemáticas
DROP POLICY IF EXISTS "enable_select_profiles_for_users" ON profiles;
DROP POLICY IF EXISTS "enable_update_profiles_for_users" ON profiles;

-- Deshabilitar RLS temporalmente en profiles para evitar recursión
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Políticas simples para orders (sin depender de subqueries complejas)
DROP POLICY IF EXISTS "enable_select_orders_for_users" ON orders;
DROP POLICY IF EXISTS "enable_update_orders_for_admins" ON orders;
DROP POLICY IF EXISTS "enable_insert_orders_for_users" ON orders;

-- Política más permisiva temporalmente para debug
CREATE POLICY "orders_select_all_authenticated" 
  ON orders FOR SELECT 
  TO authenticated
  USING (true);  -- Permitir a todos los usuarios autenticados ver todas las órdenes temporalmente

-- Política para que admins puedan actualizar cualquier orden
CREATE POLICY "orders_update_all_authenticated" 
  ON orders FOR UPDATE 
  TO authenticated
  USING (true);  -- Permitir a todos los usuarios autenticados actualizar todas las órdenes temporalmente

-- Política para insertar órdenes
CREATE POLICY "orders_insert_all_authenticated" 
  ON orders FOR INSERT 
  TO authenticated
  WITH CHECK (true);  -- Permitir a todos los usuarios autenticados crear órdenes

-- Política similar para order_items
DROP POLICY IF EXISTS "enable_select_order_items_for_users" ON order_items;
DROP POLICY IF EXISTS "enable_insert_order_items_for_users" ON order_items;

CREATE POLICY "order_items_select_all_authenticated" 
  ON order_items FOR SELECT 
  TO authenticated
  USING (true);  -- Permitir a todos los usuarios autenticados ver todos los items temporalmente

CREATE POLICY "order_items_insert_all_authenticated" 
  ON order_items FOR INSERT 
  TO authenticated
  WITH CHECK (true);  -- Permitir a todos los usuarios autenticados crear items
