import React from 'react';

const CloudinaryTest: React.FC = () => {
  const testConfig = () => {
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    
    console.log('=== CLOUDINARY CONFIGURATION TEST ===');
    console.log('Upload Preset:', uploadPreset);
    console.log('Cloud Name:', cloudName);
    console.log('Upload URL:', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
    
    if (!uploadPreset) {
      console.error('❌ VITE_CLOUDINARY_UPLOAD_PRESET no está definido');
    } else {
      console.log('✅ Upload Preset configurado');
    }
    
    if (!cloudName) {
      console.error('❌ VITE_CLOUDINARY_CLOUD_NAME no está definido');
    } else {
      console.log('✅ Cloud Name configurado');
    }
    
    return { uploadPreset, cloudName };
  };

  const testUploadPreset = async () => {
    const { uploadPreset, cloudName } = testConfig();
    
    if (!uploadPreset || !cloudName) {
      alert('Configuración de Cloudinary incompleta');
      return;
    }

    try {
      // Test con una imagen de 1x1 pixel transparente (base64)
      const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const response = await fetch(testImageBase64);
      const blob = await response.blob();
      const file = new File([blob], 'test.png', { type: 'image/png' });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      
      console.log('Probando upload preset...');
      
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      const result = await uploadResponse.json();
      
      if (uploadResponse.ok) {
        console.log('✅ Upload preset funciona correctamente');
        console.log('Resultado:', result);
        alert('✅ Configuración de Cloudinary correcta!');
      } else {
        console.error('❌ Error en upload preset:', result);
        alert(`❌ Error: ${result.error?.message || 'Upload preset inválido'}`);
      }
      
    } catch (error) {
      console.error('❌ Error al probar upload preset:', error);
      alert(`❌ Error de conexión: ${error}`);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg m-4">
      <h3 className="text-lg font-bold mb-4">🧪 Test de Configuración Cloudinary</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testConfig}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
        >
          Verificar Configuración
        </button>
        
        <button
          onClick={testUploadPreset}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Probar Upload Preset
        </button>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>🔍 Revisa la consola del navegador para ver los resultados detallados</p>
        <p>📋 Variables actuales:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Upload Preset: {import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '❌ No definido'}</li>
          <li>Cloud Name: {import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '❌ No definido'}</li>
        </ul>
      </div>
    </div>
  );
};

export default CloudinaryTest;
