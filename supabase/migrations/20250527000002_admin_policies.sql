/*
  # Políticas de Admin para Órdenes

  Esta migración:
  1. Añade políticas específicas para que los administradores puedan ver todas las órdenes
  2. Permite a los administradores gestionar todas las órdenes y order_items
  3. Mantiene las políticas existentes para usuarios normales
*/

-- Crear políticas específicas para administradores en la tabla orders
CREATE POLICY "Admins can view all orders" 
  ON orders FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all orders" 
  ON orders FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all orders" 
  ON orders FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Crear políticas específicas para administradores en la tabla order_items
CREATE POLICY "Admins can view all order items" 
  ON order_items FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all order items" 
  ON order_items FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all order items" 
  ON order_items FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Política para que los administradores puedan ver todos los perfiles
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'admin'
    )
  );

-- Función RPC para que los administradores obtengan todas las órdenes
CREATE OR REPLACE FUNCTION get_all_orders_admin()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  status text,
  total numeric,
  shipping_address jsonb,
  payment_intent text,
  created_at timestamptz,
  updated_at timestamptz,
  user_email text,
  user_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar si el usuario actual es admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acceso denegado: se requieren permisos de administrador';
  END IF;

  -- Retornar todas las órdenes con información del usuario
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.status,
    o.total,
    o.shipping_address,
    o.payment_intent,
    o.created_at,
    o.updated_at,
    p.email as user_email,
    p.name as user_name
  FROM orders o
  LEFT JOIN profiles p ON o.user_id = p.id
  ORDER BY o.created_at DESC;
END;
$$;
