# 🔧 Configuración de Cloudinary

## Problema Identificado

El error **400 Bad Request** al subir imágenes a Cloudinary indica que el upload preset no está configurado correctamente o no existe.

## Solución Paso a Paso

### 1. **Verificar/Crear Upload Preset en Cloudinary**

1. **Ir al Dashboard de Cloudinary:**
   - Ve a https://cloudinary.com/console
   - Inicia sesión en tu cuenta

2. **Acceder a Settings > Upload:**
   - En el menú superior, haz clic en "Settings" (⚙️)
   - Selecciona "Upload" en el menú lateral

3. **Crear/Verificar Upload Preset:**
   - Busca el preset `ml_default` en la lista
   - Si no existe, crea uno nuevo:
     - Haz clic en "Add upload preset"
     - **Upload preset name**: `ml_default`
     - **Signing Mode**: `Unsigned`
     - **Use filename or externally defined Public ID**: ✅ (marcado)
     - **Unique filename**: ✅ (marcado)
     - **Folder**: `adidas-ecommerce` (opcional, para organizar)
     - **Access mode**: `Public`
     - **Resource type**: `Auto`
     - **Format**: `Auto`

4. **Configuración Recomendada para el Preset:**
   ```
   Preset Name: ml_default
   Signing Mode: Unsigned
   Folder: adidas-ecommerce
   Access Mode: Public
   Format: Auto
   Quality: Auto
   ```

### 2. **Verificar Variables de Entorno**

Asegúrate de que tu archivo `.env` tenga los valores correctos:

```env
VITE_CLOUDINARY_CLOUD_NAME=dkefmgkgc
VITE_CLOUDINARY_UPLOAD_PRESET=ml_default
```

### 3. **Reiniciar el Servidor de Desarrollo**

Después de verificar la configuración:

```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar
npm run dev
```

## Verificación de la Configuración

### Paso 1: Probar Upload Preset Manualmente

Puedes probar si el upload preset funciona usando curl:

```bash
curl -X POST \
  https://api.cloudinary.com/v1_1/dkefmgkgc/image/upload \
  -F "upload_preset=ml_default" \
  -F "file=@ruta-a-una-imagen.jpg"
```

### Paso 2: Verificar en la Consola del Navegador

1. Abre las herramientas de desarrollo (F12)
2. Ve a la pestaña "Console"
3. Intenta subir una imagen
4. Verifica los logs que aparecen (agregamos logs de debug)

## Configuraciones Alternativas

### Opción 1: Crear nuevo Upload Preset

Si `ml_default` sigue dando problemas, crea un nuevo preset:

1. **Crear preset personalizado:**
   - Nombre: `adidas-clone-upload`
   - Modo: Unsigned
   - Carpeta: `ecommerce-products`

2. **Actualizar .env:**
   ```env
   VITE_CLOUDINARY_UPLOAD_PRESET=adidas-clone-upload
   ```

### Opción 2: Verificar límites de cuenta

- Verifica que tu cuenta de Cloudinary no haya alcanzado los límites
- En el dashboard puedes ver tu uso actual vs límites

## Solución de Problemas Comunes

### Error 400 - Bad Request
- ✅ Verificar que el upload preset existe
- ✅ Verificar que el preset es "Unsigned"
- ✅ Verificar el cloud name correcto

### Error 401 - Unauthorized
- El preset requiere autenticación (cambiar a Unsigned)

### Error 403 - Forbidden
- Límites de cuenta alcanzados
- Configuración de permisos incorrecta

### Archivos muy grandes
- Cloudinary free tiene límite de 10MB por archivo
- Verificar el tamaño de las imágenes

## Logs de Debug

El componente ahora incluye logs detallados que te ayudarán a identificar el problema específico. Revisa la consola del navegador para ver:

- Configuración de Cloudinary
- Detalles del archivo que se intenta subir
- Respuesta completa del servidor en caso de error

---

**💡 Tip:** Si sigues teniendo problemas, revisa la sección "Upload presets" en tu dashboard de Cloudinary y asegúrate de que el preset esté marcado como "Unsigned" y "Active".
