import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '../lib/cloudinary';

interface CloudinaryUploadProps {
  onUploadComplete: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
}

const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
  onUploadComplete,
  multiple = true,
  maxFiles = 10,
  existingImages = [],
  onRemoveExisting
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    const newSelectedFiles = [...selectedFiles];
    const newPreviews = [...previews];
    
    files.forEach(file => {
      if (newSelectedFiles.length < maxFiles) {
        newSelectedFiles.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          setPreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    setSelectedFiles(newSelectedFiles);
  };

  const removeSelectedFile = (index: number) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    setUploading(true);
    setUploadProgress(0);
    
    try {
      console.log('🚀 Iniciando upload de archivos:', selectedFiles.length);
      
      let uploadUrls: string[];
      
      if (multiple && selectedFiles.length > 1) {
        uploadUrls = await uploadMultipleToCloudinary(
          selectedFiles,
          (progress) => setUploadProgress(progress),
          'products'
        );
      } else {
        const url = await uploadToCloudinary(selectedFiles[0], 'products');
        uploadUrls = url ? [url] : [];
        setUploadProgress(100);
      }
      
      if (uploadUrls.length > 0) {
        console.log('✅ Upload completo:', uploadUrls);
        onUploadComplete(uploadUrls);
        setSelectedFiles([]);
        setPreviews([]);
      } else {
        throw new Error('No se pudieron subir las imágenes');
      }
    } catch (error) {
      console.error('❌ Error en upload:', error);
      alert(`Error al subir imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <input
          type="file"
          id="cloudinary-upload"
          className="hidden"
          multiple={multiple}
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <label
          htmlFor="cloudinary-upload"
          className={`cursor-pointer flex flex-col items-center justify-center space-y-2 ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Upload className="h-12 w-12 text-gray-400" />
          <span className="text-sm text-gray-600">
            {multiple ? 'Selecciona imágenes' : 'Selecciona una imagen'}
          </span>
          <span className="text-xs text-gray-400">
            Máximo {maxFiles} archivos
          </span>
        </label>
      </div>

      {/* Preview de archivos seleccionados */}
      {previews.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Archivos seleccionados:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeSelectedFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Imágenes existentes */}
      {existingImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Imágenes actuales:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                {onRemoveExisting && (
                  <button
                    onClick={() => onRemoveExisting(url)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de subida y progreso */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Subiendo... {uploadProgress}%</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Subir {selectedFiles.length} imagen{selectedFiles.length > 1 ? 'es' : ''}</span>
              </>
            )}
          </button>

          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload;
