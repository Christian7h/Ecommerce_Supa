# Integración de Webpay con Supabase - Documentación

## Resumen
Se ha implementado exitosamente el método de pago con Webpay Plus integrado con Supabase para el almacenamiento de órdenes. Esta implementación permite a los usuarios realizar pagos seguros y automáticamente crear órdenes en la base de datos cuando el pago es exitoso.

## Archivos Modificados/Creados

### 1. Backend (Server)
- **`server/index.cjs`**: Servidor Express con endpoints para Webpay
  - `POST /api/create-transaction`: Crea una transacción con Webpay
  - `POST /api/confirm-transaction`: Confirma el estado de la transacción

### 2. Frontend - Hooks
- **`src/hooks/useWebpay.ts`**: Hook personalizado para manejar Webpay
  - `createTransaction()`: Crea orden en DB y inicia pago
  - `confirmTransaction()`: Confirma pago y actualiza estado

### 3. Frontend - Páginas
- **`src/pages/CheckoutPage.tsx`**: Página de checkout actualizada
  - Formulario de información de envío
  - Validación de campos requeridos
  - Integración con Webpay
  
- **`src/pages/PaymentSuccessPage.tsx`**: Nueva página de confirmación
  - Procesamiento del retorno de Webpay
  - Confirmación automática de transacciones
  - Muestra detalles de la transacción
  
- **`src/pages/OrdersPage.tsx`**: Nueva página para mostrar órdenes del usuario
  - Lista de órdenes con estados
  - Detalles de productos
  - Información de envío

### 4. Frontend - Componentes
- **`src/components/Header.tsx`**: Actualizado con enlace a órdenes

### 5. Base de Datos
- **`src/lib/supabase.ts`**: Funciones para manejar órdenes
  - `createOrder()`: Crear nueva orden
  - `createOrderItems()`: Crear items de la orden
  - `updateOrderStatus()`: Actualizar estado de orden
  - `createCompleteOrder()`: Crear orden completa con items
  - `getUserOrders()`: Obtener órdenes del usuario

### 6. Tipos y Store
- **`src/store/cartStore.ts`**: Agregado campo `sale_price` opcional
- **`src/App.tsx`**: Nuevas rutas agregadas

## Flujo de Pago

### 1. Checkout (Usuario llena el formulario)
```
CheckoutPage → Validación → useWebpay.createTransaction()
```

### 2. Crear Orden y Transacción
```
createCompleteOrder() → Supabase (orders + order_items)
                     ↓
Backend API → Webpay.create() → Redirige a Webpay
```

### 3. Pago en Webpay
```
Usuario paga → Webpay procesa → Redirect a payment-success
```

### 4. Confirmación
```
PaymentSuccessPage → useWebpay.confirmTransaction()
                  ↓
Backend API → Webpay.commit() → Actualizar estado orden
                              ↓
                            Limpiar carrito
```

## Configuración Requerida

### Variables de Entorno
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary (opcional para imágenes)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Webpay Configuration
El proyecto está configurado para usar el ambiente de integración de Webpay:
- Commerce Code: `IntegrationCommerceCodes.WEBPAY_PLUS`
- API Key: `IntegrationApiKeys.WEBPAY`
- Environment: `Environment.Integration`

## Estados de Órdenes

- **`pending`**: Orden creada, esperando pago
- **`processing`**: Transacción iniciada en Webpay
- **`completed`**: Pago exitoso confirmado
- **`cancelled`**: Pago cancelado o fallido

## Rutas Nuevas

- `/checkout`: Proceso de pago
- `/payment-success`: Confirmación de pago
- `/orders`: Lista de órdenes del usuario

## Seguridad

### Row Level Security (RLS)
Las tablas de órdenes están protegidas con RLS:
- Los usuarios solo pueden ver sus propias órdenes
- Solo usuarios autenticados pueden crear órdenes

### Validaciones
- Autenticación requerida para checkout
- Validación de formulario en frontend
- Verificación de carrito no vacío
- Confirmación de pago en servidor

## Testing en Ambiente de Integración

### Tarjetas de Prueba Webpay
Para probar en ambiente de integración, usar:
- **Visa**: 4051 8856 0000 0008
- **Mastercard**: 5186 0595 9999 0004
- **Redcompra**: 4051 8800 0000 0008

### URLs de Retorno
- Success: `http://localhost:5174/payment-success`
- Error: Se maneja en la misma página de success

## Estructura de Base de Datos

### Tabla `orders`
```sql
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- status (text: pending/processing/completed/cancelled)
- total (numeric)
- shipping_address (jsonb)
- payment_intent (text, token de Webpay)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### Tabla `order_items`
```sql
- id (uuid, PK)
- order_id (uuid, FK to orders)
- product_id (uuid, FK to products)
- quantity (integer)
- price (numeric, precio al momento de la compra)
- created_at (timestamptz)
```

## Próximos Pasos

### Para Producción
1. **Cambiar a ambiente de producción**:
   - Actualizar códigos de comercio reales
   - Configurar URLs de retorno en dominio productivo
   
2. **Mejorar manejo de errores**:
   - Logs más detallados
   - Notificaciones por email
   
3. **Optimizaciones**:
   - Paginación en lista de órdenes
   - Filtros y búsqueda
   - Exportación de órdenes

### Características Adicionales
- Notificaciones por email al confirmar orden
- Tracking de envíos
- Sistema de devoluciones
- Integración con sistemas de inventario

## Comandos para Ejecutar

### Desarrollo
```bash
# Backend
cd server
node index.cjs

# Frontend
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5174
- Backend API: http://localhost:3000

## Solución de Problemas

### Error: "Usuario no autenticado"
- Verificar que el usuario esté logueado antes del checkout

### Error: "El carrito está vacío"
- Agregar productos al carrito antes del checkout

### Error de conexión con Webpay
- Verificar que el servidor backend esté ejecutándose
- Revisar configuración de CORS
- Verificar códigos de comercio de integración

### Error en confirmación de pago
- Verificar token en URL de retorno
- Revisar logs del servidor para detalles del error
