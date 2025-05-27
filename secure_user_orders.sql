-- Políticas RLS más seguras para órdenes de usuarios
-- Los usuarios normales solo pueden ver sus propias órdenes
-- Los admins pueden ver todas las órdenes

-- Eliminar políticas temporales demasiado permisivas
DROP POLICY IF EXISTS "orders_select_all_authenticated" ON orders;
DROP POLICY IF EXISTS "orders_update_all_authenticated" ON orders;
DROP POLICY IF EXISTS "orders_insert_all_authenticated" ON orders;
DROP POLICY IF EXISTS "order_items_select_all_authenticated" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_all_authenticated" ON order_items;

-- Crear función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para órdenes
-- Los usuarios pueden ver sus propias órdenes, los admins pueden ver todas
CREATE POLICY "users_can_view_own_orders" 
  ON orders FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = user_id OR is_admin(auth.uid())
  );

-- Los usuarios pueden crear sus propias órdenes
CREATE POLICY "users_can_create_own_orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Solo los admins pueden actualizar órdenes
CREATE POLICY "admins_can_update_orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Políticas para order_items
-- Los usuarios pueden ver items de sus propias órdenes, los admins pueden ver todos
CREATE POLICY "users_can_view_own_order_items" 
  ON order_items FOR SELECT 
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE user_id = auth.uid() OR is_admin(auth.uid())
    )
  );

-- Los usuarios pueden crear items para sus propias órdenes
CREATE POLICY "users_can_create_own_order_items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders 
      WHERE user_id = auth.uid()
    )
  );
