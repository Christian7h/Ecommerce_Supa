import React, { useState } from 'react';
import { uploadToCloudinary } from '../lib/cloudinary';

interface CloudinaryTestSimpleProps {
  onUploadComplete?: (urls: string[]) => void;
}

const CloudinaryTestSimple: React.FC<CloudinaryTestSimpleProps> = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(true);
      setResult('Subiendo...');
      
      try {
        const url = await uploadToCloudinary(file, 'test');
        if (url) {
          setResult(`✅ Éxito: ${url}`);
          // Notificar al componente padre
          if (onUploadComplete) {
            onUploadComplete([url]);
          }
        } else {
          setResult('❌ Error: No se recibió URL');
        }
      } catch (error) {
        setResult(`❌ Error: ${error}`);
      } finally {
        setUploading(false);
      }
    };
    
    input.click();
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🧪 Test de Cloudinary</h3>
      
      <button
        onClick={testUpload}
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {uploading ? 'Subiendo...' : 'Probar Upload'}
      </button>
      
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <pre className="text-sm">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default CloudinaryTestSimple;
