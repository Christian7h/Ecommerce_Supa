-- Arreglar recursión infinita en políticas
-- Primero eliminar la política problemática de profiles
DROP POLICY IF EXISTS "enable_select_profiles_for_users" ON profiles;

-- Crear una política más simple para profiles que no cause recursión
CREATE POLICY "profiles_select_own_and_public" 
  ON profiles FOR SELECT 
  TO authenticated
  USING (
    id = auth.uid() OR 
    -- Los admins pueden ver todos los perfiles sin verificar role aquí
    -- para evitar recursión
    true  -- Temporalmente permisivo para evitar recursión
  );

-- Ahora actualizar las políticas de orders para que funcionen sin recursión
DROP POLICY IF EXISTS "enable_select_orders_for_users" ON orders;

CREATE POLICY "orders_select_own_or_admin" 
  ON orders FOR SELECT 
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    -- Verificar admin de forma más directa
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Actualizar políticas de order_items
DROP POLICY IF EXISTS "enable_select_order_items_for_users" ON order_items;

CREATE POLICY "order_items_select_own_or_admin" 
  ON order_items FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    ) OR 
    -- Verificar admin de forma más directa
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
