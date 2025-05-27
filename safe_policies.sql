-- Crear políticas nuevas más simples (solo agregar, sin eliminar)
-- Para orders: usuarios ven sus órdenes, admins ven todas
CREATE POLICY "enable_select_orders_for_users_and_admins" 
  ON orders FOR SELECT 
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Para order_items: usuarios ven items de sus órdenes, admins ven todos
CREATE POLICY "enable_select_order_items_for_users_and_admins" 
  ON order_items FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
