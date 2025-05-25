// Services to interact with Cloudinary API with signed uploads
const CLOUDINARY_CLOUD_NAME = 'dkefmgkgc';
const CLOUDINARY_API_KEY = '433634351169882';
const CLOUDINARY_API_SECRET = 'KGSeoVXTJTJ5-XRPmzIgolTb4kk';

// Función para generar timestamp
const generateTimestamp = () => Math.round(new Date().getTime() / 1000);

// Función para crear la firma SHA-1 usando Web Crypto API
const createSignature = async (paramsToSign: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(paramsToSign + CLOUDINARY_API_SECRET);
  
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

// Función para subir imagen con firma
export const uploadToCloudinary = async (
  file: File,
  folder: string = 'products'
): Promise<string | null> => {
  try {
    console.log('🚀 Iniciando upload a Cloudinary...');
    
    const timestamp = generateTimestamp();
    
    // Parámetros para la firma
    const params = {
      folder: folder,
      timestamp: timestamp,
    };
    
    // Crear string para firmar (ordenado alfabéticamente)
    const paramsString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key as keyof typeof params]}`)
      .join('&');
    
    const signature = await createSignature(paramsString);
    
    console.log('📝 Parámetros para firma:', paramsString);
    console.log('📝 Firma generada:', signature);

    // Preparamos el FormData con todos los parámetros
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('folder', folder);

    console.log('📤 Enviando archivo a Cloudinary...');
    
    // Enviamos el archivo a Cloudinary
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Error de Cloudinary:', errorText);
      throw new Error(`Error ${uploadResponse.status}: ${errorText}`);
    }

    const data = await uploadResponse.json();
    console.log('✅ Upload exitoso:', data.secure_url);
    
    return data.secure_url;
  } catch (error) {
    console.error('❌ Error uploading to Cloudinary:', error);
    return null;
  }
};

// Función para subir múltiples imágenes
export const uploadMultipleToCloudinary = async (
  files: File[],
  onProgress?: (progress: number) => void,
  folder: string = 'products'
): Promise<string[]> => {
  if (!files.length) return [];
  
  const uploadUrls: string[] = [];
  const totalFiles = files.length;
  let completedUploads = 0;
  
  try {
    console.log(`🚀 Iniciando upload de ${totalFiles} archivos...`);
    
    const uploadPromises = files.map(async (file, index) => {
      console.log(`📤 Subiendo archivo ${index + 1}/${totalFiles}: ${file.name}`);
      
      const url = await uploadToCloudinary(file, folder);
      
      completedUploads++;
      if (onProgress) {
        const progress = Math.round((completedUploads / totalFiles) * 100);
        onProgress(progress);
        console.log(`📊 Progreso: ${progress}%`);
      }
      
      return url;
    });
    
    const results = await Promise.all(uploadPromises);
    
    results.forEach(url => {
      if (url) uploadUrls.push(url);
    });
    
    console.log(`✅ Upload completo: ${uploadUrls.length}/${totalFiles} archivos exitosos`);
    return uploadUrls;
  } catch (error) {
    console.error('❌ Error uploading multiple files to Cloudinary:', error);
    return uploadUrls;
  }
};

export default {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
};
