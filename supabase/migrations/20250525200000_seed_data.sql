/*
  # Seed Data for E-commerce Platform (Adidas Chile Clone)

  This migration adds seed data to populate the e-commerce platform with:
  - Categories
  - Products
  - Site Settings
*/

-- Clear existing data first
TRUNCATE categories CASCADE;
TRUNCATE products CASCADE;
TRUNCATE site_settings CASCADE;

-- Seed Categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Running', 'running', 'High-performance running footwear and apparel.', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/categories/running.jpg'),
('Originals', 'originals', 'Iconic street style from the archives.', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/categories/originals.jpg'),
('Football', 'football', 'Professional football boots and equipment.', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/categories/football.jpg'),
('Basketball', 'basketball', 'Performance basketball shoes and apparel.', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/categories/basketball.jpg'),
('Training', 'training', 'Versatile gear for your workouts.', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/categories/training.jpg'),
('Outdoor', 'outdoor', 'Durable products for outdoor adventures.', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/categories/outdoor.jpg'),
('Kids', 'kids', 'Stylish and comfortable clothing for kids.', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/categories/kids.jpg'),
('Accessories', 'accessories', 'Essential accessories to complete your look.', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/categories/accessories.jpg');

-- Store category IDs for reference
DO $$
DECLARE
  running_id uuid;
  originals_id uuid;
  football_id uuid;
  basketball_id uuid;
  training_id uuid;
  outdoor_id uuid;
  kids_id uuid;
  accessories_id uuid;
BEGIN
  SELECT id INTO running_id FROM categories WHERE slug = 'running' LIMIT 1;
  SELECT id INTO originals_id FROM categories WHERE slug = 'originals' LIMIT 1;
  SELECT id INTO football_id FROM categories WHERE slug = 'football' LIMIT 1;
  SELECT id INTO basketball_id FROM categories WHERE slug = 'basketball' LIMIT 1;
  SELECT id INTO training_id FROM categories WHERE slug = 'training' LIMIT 1;
  SELECT id INTO outdoor_id FROM categories WHERE slug = 'outdoor' LIMIT 1;
  SELECT id INTO kids_id FROM categories WHERE slug = 'kids' LIMIT 1;
  SELECT id INTO accessories_id FROM categories WHERE slug = 'accessories' LIMIT 1;

  -- Seed Products - Running Category
  INSERT INTO products (name, slug, description, price, sale_price, stock, images, category_id, featured)
  VALUES
    (
      'Ultraboost 24', 
      'ultraboost-24', 
      'Experience extraordinary energy return with these running shoes. The responsive Boost midsole returns energy with each stride, while the Primeknit upper adapts to your foot for a comfortable fit.', 
      180.00, 
      NULL, 
      100, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/ultraboost-24-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/ultraboost-24-2.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/ultraboost-24-3.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/ultraboost-24-4.jpg'
      ],
      running_id,
      TRUE
    ),
    (
      'Adizero Adios Pro 3', 
      'adizero-adios-pro-3', 
      'Designed for speed, these lightweight racing shoes feature LIGHTSTRIKE PRO cushioning for energy return and a carbon-fiber ENERGYRODS system for propulsion.', 
      220.00, 
      199.95, 
      80, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/adizero-adios-pro-3-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/adizero-adios-pro-3-2.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/adizero-adios-pro-3-3.jpg'
      ],
      running_id,
      TRUE
    ),
    (
      'SolarGlide 6', 
      'solarglide-6', 
      'Designed for long-distance running, these shoes provide excellent cushioning with Boost technology and supportive guidance through the full gait cycle.', 
      140.00, 
      NULL, 
      120, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/solarglide-6-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/solarglide-6-2.jpg'
      ],
      running_id,
      FALSE
    );

  -- Seed Products - Originals Category
  INSERT INTO products (name, slug, description, price, sale_price, stock, images, category_id, featured)
  VALUES
    (
      'Superstar', 
      'superstar', 
      'The authentic shell-toe sneaker from adidas Originals. These classic shoes feature a leather upper, rubber shell toe, and herringbone-pattern rubber outsole.', 
      100.00, 
      89.95, 
      200, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/superstar-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/superstar-2.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/superstar-3.jpg'
      ],
      originals_id,
      TRUE
    ),
    (
      'Stan Smith', 
      'stan-smith', 
      'A tennis icon that has become a streetwear staple. These shoes feature a clean leather upper with perforated 3-Stripes and a smooth rubber outsole.', 
      95.00, 
      NULL, 
      150, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/stan-smith-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/stan-smith-2.jpg'
      ],
      originals_id,
      TRUE
    ),
    (
      'Gazelle', 
      'gazelle', 
      'Originally released as a training shoe in 1966, the Gazelle has become an iconic casual sneaker with a suede upper and contrasting 3-Stripes.', 
      100.00, 
      NULL, 
      120, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/gazelle-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/gazelle-2.jpg'
      ],
      originals_id,
      FALSE
    );

  -- Seed Products - Football Category
  INSERT INTO products (name, slug, description, price, sale_price, stock, images, category_id, featured)
  VALUES
    (
      'X Speedportal.1', 
      'x-speedportal-1', 
      'Designed for explosive speed with a lightweight Speedskin upper and responsive carbon fiber insert. Worn by top attacking players worldwide.', 
      280.00, 
      249.95, 
      60, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/x-speedportal-1-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/x-speedportal-1-2.jpg'
      ],
      football_id,
      TRUE
    ),
    (
      'Predator Edge.1', 
      'predator-edge-1', 
      'Control the game with these boots featuring an innovative rubber striking zone and precision fit collar for superior ball control and passing accuracy.', 
      250.00, 
      NULL, 
      80, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/predator-edge-1-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/predator-edge-1-2.jpg'
      ],
      football_id,
      TRUE
    );

  -- Seed Products - Basketball Category
  INSERT INTO products (name, slug, description, price, sale_price, stock, images, category_id, featured)
  VALUES
    (
      'Trae Young 3', 
      'trae-young-3', 
      'Signature shoes designed for agility and speed with responsive Boost cushioning and a supportive fit system perfect for dynamic players.', 
      140.00, 
      NULL, 
      90, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/trae-young-3-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/trae-young-3-2.jpg'
      ],
      basketball_id,
      TRUE
    ),
    (
      'Dame 9', 
      'dame-9', 
      'Damian Lillard\'s signature shoe with Lightstrike cushioning for responsive comfort and a multidirectional outsole pattern for superior traction.', 
      120.00, 
      99.95, 
      85, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/dame-9-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/dame-9-2.jpg'
      ],
      basketball_id,
      FALSE
    );

  -- Seed Products - Training Category
  INSERT INTO products (name, slug, description, price, sale_price, stock, images, category_id, featured)
  VALUES
    (
      'Dropset Trainer', 
      'dropset-trainer', 
      'Versatile training shoes with responsive cushioning and a stable base for weightlifting and high-intensity workouts.', 
      130.00, 
      NULL, 
      100, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/dropset-trainer-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/dropset-trainer-2.jpg'
      ],
      training_id,
      TRUE
    ),
    (
      'HIIT Trainer', 
      'hiit-trainer', 
      'Designed for high-intensity interval training with enhanced stability and cushioning to support multidirectional movement patterns.', 
      100.00, 
      89.95, 
      120, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/hiit-trainer-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/hiit-trainer-2.jpg'
      ],
      training_id,
      FALSE
    );

  -- Seed Products - Kids Category
  INSERT INTO products (name, slug, description, price, sale_price, stock, images, category_id, featured)
  VALUES
    (
      'Superstar Kids', 
      'superstar-kids', 
      'The iconic shell-toe sneaker sized for kids, featuring a leather upper and rubber outsole.', 
      70.00, 
      NULL, 
      150, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/superstar-kids-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/superstar-kids-2.jpg'
      ],
      kids_id,
      TRUE
    ),
    (
      'Duramo Kids', 
      'duramo-kids', 
      'Lightweight and comfortable running shoes for kids with breathable mesh upper and cushioned midsole.', 
      55.00, 
      45.95, 
      120, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/duramo-kids-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/duramo-kids-2.jpg'
      ],
      kids_id,
      FALSE
    );

  -- Seed Products - Accessories Category
  INSERT INTO products (name, slug, description, price, sale_price, stock, images, category_id, featured)
  VALUES
    (
      'Classic Backpack', 
      'classic-backpack', 
      'Spacious backpack with multiple compartments, padded laptop sleeve, and comfortable shoulder straps.', 
      55.00, 
      NULL, 
      200, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/classic-backpack-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/classic-backpack-2.jpg'
      ],
      accessories_id,
      FALSE
    ),
    (
      'Training Duffle Bag', 
      'training-duffle-bag', 
      'Durable duffle bag with spacious main compartment, separate shoe pocket, and adjustable shoulder strap.', 
      65.00, 
      59.95, 
      150, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/training-duffle-bag-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/training-duffle-bag-2.jpg'
      ],
      accessories_id,
      FALSE
    ),
    (
      'Performance Socks (3 Pack)', 
      'performance-socks-3-pack', 
      'Cushioned athletic socks with arch compression and moisture-wicking fabric for all-day comfort.', 
      18.00, 
      NULL, 
      300, 
      ARRAY[
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/performance-socks-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/products/performance-socks-2.jpg'
      ],
      accessories_id,
      FALSE
    );

END $$;

-- Seed Site Settings
INSERT INTO site_settings (key, value) VALUES
(
  'site_info', 
  jsonb_build_object(
    'site_name', 'Adidas Chile',
    'logo_url', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/logo.png',
    'favicon', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/favicon.png',
    'primary_color', '#000000',
    'secondary_color', '#FFFFFF',
    'accent_color', '#FFC107',
    'currency', 'CLP',
    'currency_symbol', '$',
    'language', 'es-CL',
    'contact_email', 'support@adidasclone.com',
    'contact_phone', '+56 2 2123 4567',
    'social_media', jsonb_build_object(
      'facebook', 'https://facebook.com/adidaschile',
      'instagram', 'https://instagram.com/adidaschile',
      'twitter', 'https://twitter.com/adidaschile',
      'youtube', 'https://youtube.com/adidaschile'
    )
  )
),
(
  'home_page', 
  jsonb_build_object(
    'hero_images', jsonb_build_array(
      jsonb_build_object(
        'image_url', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/hero/hero1.jpg',
        'alt_text', 'Summer Collection',
        'link', '/products?category=originals',
        'title', 'NUEVA COLECCIÓN VERANO',
        'subtitle', 'DESCUBRE LO NUEVO'
      ),
      jsonb_build_object(
        'image_url', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/hero/hero2.jpg',
        'alt_text', 'Running Collection',
        'link', '/products?category=running',
        'title', 'ULTRABOOST 24',
        'subtitle', 'IMPULSA TU RENDIMIENTO'
      ),
      jsonb_build_object(
        'image_url', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/hero/hero3.jpg',
        'alt_text', 'Football Collection',
        'link', '/products?category=football',
        'title', 'DOMINA LA CANCHA',
        'subtitle', 'NUEVA COLECCIÓN DE FÚTBOL'
      )
    ),
    'featured_categories', jsonb_build_array(
      jsonb_build_object(
        'category', 'running',
        'image_url', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/featured/running.jpg',
        'title', 'RUNNING'
      ),
      jsonb_build_object(
        'category', 'originals',
        'image_url', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/featured/originals.jpg',
        'title', 'ORIGINALS'
      ),
      jsonb_build_object(
        'category', 'football',
        'image_url', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/featured/football.jpg',
        'title', 'FÚTBOL'
      )
    ),
    'promotion_banner', jsonb_build_object(
      'image_url', 'https://res.cloudinary.com/demo/image/upload/v1612345678/adidas/banners/promo.jpg',
      'alt_text', 'Summer Sale',
      'title', 'HASTA 40% DE DESCUENTO',
      'subtitle', 'EN ARTÍCULOS SELECCIONADOS',
      'link', '/products?sale=true',
      'button_text', 'COMPRAR AHORA'
    )
  )
),
(
  'footer_info', 
  jsonb_build_object(
    'columns', jsonb_build_array(
      jsonb_build_object(
        'title', 'Productos',
        'links', jsonb_build_array(
          jsonb_build_object('text', 'Novedades', 'url', '/products?sort=newest'),
          jsonb_build_object('text', 'Running', 'url', '/products?category=running'),
          jsonb_build_object('text', 'Fútbol', 'url', '/products?category=football'),
          jsonb_build_object('text', 'Originals', 'url', '/products?category=originals'),
          jsonb_build_object('text', 'Outlet', 'url', '/products?sale=true')
        )
      ),
      jsonb_build_object(
        'title', 'Ayuda',
        'links', jsonb_build_array(
          jsonb_build_object('text', 'Estado del pedido', 'url', '/help/order-status'),
          jsonb_build_object('text', 'Envíos y entregas', 'url', '/help/shipping'),
          jsonb_build_object('text', 'Devoluciones', 'url', '/help/returns'),
          jsonb_build_object('text', 'Métodos de pago', 'url', '/help/payment'),
          jsonb_build_object('text', 'Contacto', 'url', '/contact')
        )
      ),
      jsonb_build_object(
        'title', 'Información',
        'links', jsonb_build_array(
          jsonb_build_object('text', 'Sobre nosotros', 'url', '/about'),
          jsonb_build_object('text', 'Tiendas', 'url', '/stores'),
          jsonb_build_object('text', 'Sostenibilidad', 'url', '/sustainability'),
          jsonb_build_object('text', 'Prensa', 'url', '/press'),
          jsonb_build_object('text', 'Trabaja con nosotros', 'url', '/careers')
        )
      )
    ),
    'legal_links', jsonb_build_array(
      jsonb_build_object('text', 'Términos y condiciones', 'url', '/terms'),
      jsonb_build_object('text', 'Política de privacidad', 'url', '/privacy'),
      jsonb_build_object('text', 'Configuración de cookies', 'url', '/cookies')
    ),
    'copyright', '© 2025 adidas Chile. Todos los derechos reservados.'
  )
),
(
  'navigation', 
  jsonb_build_object(
    'main_menu', jsonb_build_array(
      jsonb_build_object(
        'text', 'Hombre',
        'url', '/products?gender=men',
        'submenu', jsonb_build_array(
          jsonb_build_object(
            'title', 'Calzado',
            'links', jsonb_build_array(
              jsonb_build_object('text', 'Novedades', 'url', '/products?gender=men&category=new-arrivals'),
              jsonb_build_object('text', 'Originals', 'url', '/products?gender=men&category=originals'),
              jsonb_build_object('text', 'Running', 'url', '/products?gender=men&category=running'),
              jsonb_build_object('text', 'Fútbol', 'url', '/products?gender=men&category=football')
            )
          ),
          jsonb_build_object(
            'title', 'Ropa',
            'links', jsonb_build_array(
              jsonb_build_object('text', 'Camisetas', 'url', '/products?gender=men&type=tshirts'),
              jsonb_build_object('text', 'Sudaderas', 'url', '/products?gender=men&type=hoodies'),
              jsonb_build_object('text', 'Pantalones', 'url', '/products?gender=men&type=pants')
            )
          )
        )
      ),
      jsonb_build_object(
        'text', 'Mujer',
        'url', '/products?gender=women',
        'submenu', jsonb_build_array(
          jsonb_build_object(
            'title', 'Calzado',
            'links', jsonb_build_array(
              jsonb_build_object('text', 'Novedades', 'url', '/products?gender=women&category=new-arrivals'),
              jsonb_build_object('text', 'Originals', 'url', '/products?gender=women&category=originals'),
              jsonb_build_object('text', 'Running', 'url', '/products?gender=women&category=running')
            )
          ),
          jsonb_build_object(
            'title', 'Ropa',
            'links', jsonb_build_array(
              jsonb_build_object('text', 'Camisetas', 'url', '/products?gender=women&type=tshirts'),
              jsonb_build_object('text', 'Sudaderas', 'url', '/products?gender=women&type=hoodies'),
              jsonb_build_object('text', 'Leggings', 'url', '/products?gender=women&type=leggings')
            )
          )
        )
      ),
      jsonb_build_object(
        'text', 'Niños',
        'url', '/products?category=kids',
        'submenu', jsonb_build_array(
          jsonb_build_object(
            'title', 'Por edad',
            'links', jsonb_build_array(
              jsonb_build_object('text', 'Niños pequeños (1-6)', 'url', '/products?category=kids&age=toddler'),
              jsonb_build_object('text', 'Niños (7-14)', 'url', '/products?category=kids&age=children')
            )
          )
        )
      ),
      jsonb_build_object('text', 'Outlet', 'url', '/products?sale=true', 'submenu', NULL)
    )
  )
);

-- Add sample users
-- Note: In a real application, users would be created through the authentication system
-- This is just to seed some sample profiles assuming auth.users entries exist
INSERT INTO profiles (id, email, name, avatar_url, phone)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'Admin User', NULL, '+56912345678'),
  ('11111111-1111-1111-1111-111111111111', 'customer@example.com', 'Sample Customer', NULL, '+56987654321');
