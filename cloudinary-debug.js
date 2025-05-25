/**
 * Script de verificación rápida para Cloudinary
 * Copia y pega este código en la consola del navegador (F12)
 */

(function() {
  console.log('🔧 VERIFICACIÓN DE CLOUDINARY');
  console.log('================================');
  
  // Variables de entorno
  const uploadPreset = import.meta?.env?.VITE_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = import.meta?.env?.VITE_CLOUDINARY_CLOUD_NAME;
  
  console.log('📋 Variables de entorno:');
  console.log('- Upload Preset:', uploadPreset || '❌ NO DEFINIDO');
  console.log('- Cloud Name:', cloudName || '❌ NO DEFINIDO');
  
  if (!uploadPreset || !cloudName) {
    console.error('❌ ERROR: Variables de entorno faltantes');
    console.log('💡 Verifica tu archivo .env:');
    console.log('   VITE_CLOUDINARY_UPLOAD_PRESET=ml_default');
    console.log('   VITE_CLOUDINARY_CLOUD_NAME=dkefmgkgc');
    return;
  }
  
  // Test de conectividad
  console.log('🌐 Probando conectividad...');
  console.log('URL:', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
  
  // Función para probar upload preset
  window.testCloudinaryUpload = async function() {
    console.log('🧪 Probando upload preset...');
    
    try {
      // Crear imagen de prueba (1x1 pixel transparente)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 1, 1);
      
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'test.png');
        formData.append('upload_preset', uploadPreset);
        
        try {
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: 'POST',
              body: formData
            }
          );
          
          const data = await response.json();
          
          if (response.ok) {
            console.log('✅ ÉXITO: Upload preset funciona correctamente');
            console.log('📷 URL de imagen:', data.secure_url);
            console.log('📊 Respuesta completa:', data);
          } else {
            console.error('❌ ERROR en upload:', data);
            if (data.error) {
              console.error('📝 Mensaje de error:', data.error.message);
              
              // Mensajes específicos de error
              if (data.error.message?.includes('Upload preset')) {
                console.log('💡 Solución: Verifica que el upload preset existe y es "Unsigned"');
              }
              if (data.error.message?.includes('Invalid')) {
                console.log('💡 Solución: Verifica el cloud name y upload preset');
              }
            }
          }
        } catch (fetchError) {
          console.error('❌ ERROR de conexión:', fetchError);
          console.log('💡 Verifica tu conexión a internet');
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('❌ ERROR al crear imagen de prueba:', error);
    }
  };
  
  console.log('✨ Para probar el upload, ejecuta: testCloudinaryUpload()');
  console.log('================================');
})();

// Auto-ejecutar el test básico
console.log('🚀 Ejecutando verificación automática...');
if (typeof testCloudinaryUpload === 'function') {
  testCloudinaryUpload();
}
