import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  X,
  Image,
  Check,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import SimpleImageUpload from '../../components/SimpleImageUpload';
import { uploadMultipleToCloudinary } from '../../lib/cloudinary';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  stock: number;
  images: string[];
  category_id: string;
  featured: boolean;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

const ProductsAdmin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  
  useEffect(() => {
    if (editingProduct) {
      setValue('name', editingProduct.name);
      setValue('description', editingProduct.description);
      setValue('price', editingProduct.price);
      setValue('sale_price', editingProduct.sale_price || '');
      setValue('stock', editingProduct.stock);
      setValue('category_id', editingProduct.category_id);
      setValue('featured', editingProduct.featured);
      setUploadedImageUrls(editingProduct.images);
      setSelectedImageFiles([]);
    } else {
      reset();
      setUploadedImageUrls([]);
      setSelectedImageFiles([]);
    }
  }, [editingProduct, setValue, reset]);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };
  
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset();
    setUploadedImageUrls([]);
    setSelectedImageFiles([]);
    setUploading(false);
  };
  
  const handleImagesSelected = (files: File[]) => {
    console.log('📁 handleImagesSelected called with files:', files);
    setSelectedImageFiles(files);
  };

  const removeExistingImage = (url: string) => {
    if (editingProduct) {
      const updatedImages = editingProduct.images.filter(img => img !== url);
      setEditingProduct({
        ...editingProduct,
        images: updatedImages
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    console.log('🚀 onSubmit called with data:', data);
    console.log('📁 Current selectedImageFiles:', selectedImageFiles);
    console.log('📸 Current uploadedImageUrls:', uploadedImageUrls);
    console.log('✏️ Editing product:', editingProduct);
    
    try {
      setUploading(true);
      
      const slug = data.name
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      let finalImages: string[] = [];
      
      if (editingProduct) {
        // Para productos existentes: combinar imágenes existentes + nuevas subidas + nuevos archivos
        finalImages = [...editingProduct.images];
        
        if (selectedImageFiles.length > 0) {
          console.log('📤 Subiendo nuevas imágenes para producto existente...');
          const newUploadedUrls = await uploadMultipleToCloudinary(selectedImageFiles);
          finalImages = [...finalImages, ...newUploadedUrls];
        }
        
        if (uploadedImageUrls.length > 0) {
          finalImages = [...finalImages, ...uploadedImageUrls];
        }
      } else {
        // Para productos nuevos: subir archivos seleccionados + URLs ya subidas
        if (selectedImageFiles.length > 0) {
          console.log('📤 Subiendo imágenes para nuevo producto...');
          const newUploadedUrls = await uploadMultipleToCloudinary(selectedImageFiles);
          finalImages = [...newUploadedUrls];
        }
        
        if (uploadedImageUrls.length > 0) {
          finalImages = [...finalImages, ...uploadedImageUrls];
        }
      }
        
      console.log('🖼️ Final images array:', finalImages);
        
      if (finalImages.length === 0) {
        console.log('❌ No images found, showing error');
        setNotification({
          type: 'error',
          message: 'Debes subir al menos una imagen del producto'
        });
        setUploading(false);
        return;
      }
      
      const productData = {
        name: data.name,
        slug,
        description: data.description,
        price: parseFloat(data.price),
        sale_price: data.sale_price ? parseFloat(data.sale_price) : null,
        stock: parseInt(data.stock, 10),
        category_id: data.category_id,
        images: finalImages,
        featured: data.featured || false
      };
      
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
          
        if (error) throw error;
        
        setNotification({
          type: 'success',
          message: 'Producto actualizado correctamente'
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);
          
        if (error) throw error;
        
        setNotification({
          type: 'success',
          message: 'Producto creado correctamente'
        });
      }
      
      // Reset form and state
      closeModal();
      fetchProducts();
      
    } catch (error) {
      console.error('Error saving product:', error);
      setNotification({
        type: 'error',
        message: 'Error al guardar el producto'
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        fetchProducts();
        setNotification({
          type: 'success',
          message: 'Producto eliminado correctamente'
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        setNotification({
          type: 'error',
          message: 'Error al eliminar el producto'
        });
      }
    }
  };

  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6">
      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <Check className="mr-2" />
            ) : (
              <AlertCircle className="mr-2" />
            )}
            <span>{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>
      )}
    
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administración de Productos</h1>
        <button
          onClick={openCreateModal}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-800"
        >
          <Plus size={18} className="mr-2" /> Nuevo Producto
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando productos...</p>
          </div>
        ) : (
          <>
            {filteredProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destacado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img 
                                src={product.images[0] || '/placeholder.png'} 
                                alt={product.name}
                                className="h-10 w-10 object-cover rounded" 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {product.description?.substring(0, 50)}
                                {product.description && product.description.length > 50 ? '...' : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${product.price.toLocaleString('es-CL')}</div>
                          {product.sale_price && (
                            <div className="text-sm text-red-500">${product.sale_price.toLocaleString('es-CL')}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.stock}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.featured ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Sí
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(product.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => openEditModal(product)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => deleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={18} />
                            </button>
                            <a 
                              href={`/products/${product.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Eye size={18} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Image className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? 'No se encontraron productos con tu búsqueda.' : 'Empieza creando un nuevo producto.'}
                </p>
                {searchQuery ? (
                  <div className="mt-6">
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      Limpiar búsqueda
                    </button>
                  </div>
                ) : (
                  <div className="mt-6">
                    <button
                      onClick={openCreateModal}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      Nuevo Producto
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <form onSubmit={handleSubmit(onSubmit, (errors) => {
                console.log('❌ Form validation errors:', errors);
              })}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center pb-4 mb-4 border-b">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                    </h3>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={closeModal}
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                        placeholder="Nombre del producto"
                        {...register('name', { required: 'El nombre es obligatorio' })}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-500">{errors.name.message as string}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría *
                      </label>
                      <select
                        className={`w-full border ${errors.category_id ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                        {...register('category_id', { required: 'La categoría es obligatoria' })}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.category_id && (
                        <p className="mt-1 text-xs text-red-500">{errors.category_id.message as string}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        rows={4}
                        placeholder="Descripción del producto"
                        {...register('description')}
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          className={`w-full border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md pl-7 pr-3 py-2`}
                          placeholder="0.00"
                          step="0.01"
                          {...register('price', { 
                            required: 'El precio es obligatorio',
                            min: { value: 0, message: 'El precio debe ser mayor o igual a 0' }
                          })}
                        />
                      </div>
                      {errors.price && (
                        <p className="mt-1 text-xs text-red-500">{errors.price.message as string}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio de oferta
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2"
                          placeholder="0.00"
                          step="0.01"
                          {...register('sale_price', { 
                            min: { value: 0, message: 'El precio de oferta debe ser mayor o igual a 0' }
                          })}
                        />
                      </div>
                      {errors.sale_price && (
                        <p className="mt-1 text-xs text-red-500">{errors.sale_price.message as string}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock *
                      </label>
                      <input
                        type="number"
                        className={`w-full border ${errors.stock ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                        placeholder="0"
                        {...register('stock', { 
                          required: 'El stock es obligatorio',
                          min: { value: 0, message: 'El stock debe ser mayor o igual a 0' }
                        })}
                      />
                      {errors.stock && (
                        <p className="mt-1 text-xs text-red-500">{errors.stock.message as string}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        {...register('featured')}
                      />
                      <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                        Producto destacado
                      </label>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imágenes del producto *
                      </label>
                      
                      {/* Componente simplificado para selección de archivos */}
                      <SimpleImageUpload 
                        onImagesSelected={handleImagesSelected}
                        selectedFiles={selectedImageFiles}
                        maxFiles={10}
                      />
                      
                      {/* Mostrar imágenes existentes si estamos editando */}
                      {editingProduct && editingProduct.images.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-sm mb-2">Imágenes actuales:</h4>
                          <div className="flex flex-wrap gap-2">
                            {editingProduct.images.map((url, index) => (
                              <div key={index} className="relative w-20 h-20 bg-gray-100 rounded">
                                <img 
                                  src={url}
                                  alt={`Current ${index}`}
                                  className="w-full h-full object-cover rounded"
                                />
                                <button
                                  type="button"
                                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
                                  onClick={() => removeExistingImage(url)}
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Mostrar indicador de upload cuando esté subiendo */}
                      {uploading && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            <span className="text-sm text-blue-600">Subiendo imágenes...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                      uploading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-black hover:bg-gray-800'
                    }`}
                    onClick={() => console.log('🔘 Submit button clicked')}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {selectedImageFiles.length > 0 ? 'Subiendo...' : 'Guardando...'}
                      </>
                    ) : (
                      editingProduct ? 'Guardar Cambios' : 'Crear Producto'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={uploading}
                    className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                      uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsAdmin;