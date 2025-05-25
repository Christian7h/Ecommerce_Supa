import React, { useState } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

interface SimpleImageUploadProps {
  onImagesSelected: (files: File[]) => void;
  selectedFiles: File[];
  maxFiles?: number;
}

const SimpleImageUpload: React.FC<SimpleImageUploadProps> = ({
  onImagesSelected,
  selectedFiles,
  maxFiles = 10
}) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];
    
    files.forEach(file => {
      if (newFiles.length < maxFiles) {
        newFiles.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          setPreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    onImagesSelected(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setPreviews(newPreviews);
    onImagesSelected(newFiles);
  };

  return (
    <div className="space-y-4">
      {/* Zona de drop/selección */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <input
          type="file"
          id="image-upload"
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
        >
          <ImageIcon className="h-12 w-12 text-gray-400" />
          <span className="text-sm text-gray-600">
            Selecciona imágenes del producto
          </span>
          <span className="text-xs text-gray-400">
            Se subirán automáticamente al crear el producto
          </span>
        </label>
      </div>

      {/* Preview de archivos seleccionados */}
      {previews.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Imágenes seleccionadas ({selectedFiles.length}):</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                  {selectedFiles[index]?.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleImageUpload;
