console.log('🔍 Testing Cloudinary configuration...');

// Configuración
const CLOUDINARY_CLOUD_NAME = 'dkefmgkgc';
const CLOUDINARY_API_KEY = '433634351169882';
const CLOUDINARY_API_SECRET = 'KGSeoVXTJTJ5-XRPmzIgolTb4kk';

console.log('📋 Configuration:');
console.log('- Cloud Name:', CLOUDINARY_CLOUD_NAME);
console.log('- API Key:', CLOUDINARY_API_KEY);
console.log('- API Secret:', CLOUDINARY_API_SECRET ? '✅ Present' : '❌ Missing');

// Test de timestamp y firma
const timestamp = Math.round(new Date().getTime() / 1000);
const folder = 'test';

const params = {
  folder: folder,
  timestamp: timestamp,
};

// Crear string para firmar (ordenado alfabéticamente)
const paramsString = Object.keys(params)
  .sort()
  .map(key => `${key}=${params[key]}`)
  .join('&');

console.log('🔐 Signature test:');
console.log('- Timestamp:', timestamp);
console.log('- Params string:', paramsString);
console.log('- String to sign:', paramsString + CLOUDINARY_API_SECRET);

// Función para crear la firma SHA-1 usando Web Crypto API
async function createSignature(paramsToSign) {
  const encoder = new TextEncoder();
  const data = encoder.encode(paramsToSign + CLOUDINARY_API_SECRET);
  
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

// Test de firma
createSignature(paramsString).then(signature => {
  console.log('- Generated signature:', signature);
  
  // Simular el FormData que enviaríamos
  console.log('📤 Upload data simulation:');
  console.log('- file: [FILE_CONTENT]');
  console.log('- signature:', signature);
  console.log('- timestamp:', timestamp);
  console.log('- api_key:', CLOUDINARY_API_KEY);
  console.log('- folder:', folder);
  
  console.log('🌐 Upload URL:', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
  console.log('✅ Configuration test complete!');
}).catch(error => {
  console.error('❌ Error creating signature:', error);
});
