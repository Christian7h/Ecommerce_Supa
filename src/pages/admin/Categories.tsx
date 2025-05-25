import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Image,
  AlertCircle,
  Check
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import CloudinaryUpload from '../../components/CloudinaryUpload';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

const CategoriesAdmin: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm();
  const name = watch('name', '');
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  useEffect(() => {
    if (editingCategory) {
      setValue('name', editingCategory.name);
      setValue('slug', editingCategory.slug);
      setValue('description', editingCategory.description || '');
      if (editingCategory.image_url) {
        setUploadedImageUrl(editingCategory.image_url);
      }
    } else {
      reset();
      setUploadedImageUrl(null);
    }
  }, [editingCategory, setValue, reset]);
  
  // Auto-generate slug from name
  useEffect(() => {
    if (name && !editingCategory) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setValue('slug', slug);
    }
  }, [name, setValue, editingCategory]);
  
  const handleUploadComplete = (urls: string[]) => {
    if (urls.length > 0) {
      setUploadedImageUrl(urls[0]);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
    setUploadedImageUrl(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const slug = data.slug || 
        data.name
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
      
      // Use either newly uploaded image or existing one if editing
      const image_url = uploadedImageUrl || (editingCategory?.image_url || null);
      
      const categoryData = {
        name: data.name,
        slug,
        description: data.description || null,
        image_url
      };
      
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
          
        if (error) throw error;
        
        setNotification({
          type: 'success',
          message: 'Categoría actualizada correctamente'
        });
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);
          
        if (error) throw error;
        
        setNotification({
          type: 'success',
          message: 'Categoría creada correctamente'
        });
      }
      
      // Reset form and state
      closeModal();
      fetchCategories();
      
    } catch (error) {
      console.error('Error saving category:', error);
      setNotification({
        type: 'error',
        message: 'Error al guardar la categoría'
      });
    }
  };

  const deleteCategory = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta categoría? Los productos asociados no se eliminarán, pero perderán su asociación con esta categoría.')) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        fetchCategories();
        setNotification({
          type: 'success',
          message: 'Categoría eliminada correctamente'
        });
      } catch (error) {
        console.error('Error deleting category:', error);
        setNotification({
          type: 'error',
          message: 'Error al eliminar la categoría'
        });
      }
    }
  };

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
        <h1 className="text-2xl font-bold">Administración de Categorías</h1>
        <button
          onClick={openCreateModal}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-800"
        >
          <Plus size={18} className="mr-2" /> Nueva Categoría
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando categorías...</p>
          </div>
        ) : (
          <>
            {categories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map(category => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {category.image_url ? (
                                <img 
                                  src={category.image_url} 
                                  alt={category.name}
                                  className="h-10 w-10 object-cover rounded" 
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                                  <Image size={18} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {category.slug}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {category.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => openEditModal(category)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => deleteCategory(category.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={18} />
                            </button>
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay categorías</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Empieza creando una nueva categoría.
                </p>
                <div className="mt-6">
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Nueva Categoría
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center pb-4 mb-4 border-b">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h3>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={closeModal}
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                        placeholder="Nombre de la categoría"
                        {...register('name', { required: 'El nombre es obligatorio' })}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-500">{errors.name.message as string}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="slug-de-la-categoria (generado automáticamente si se deja vacío)"
                        {...register('slug')}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Si se deja vacío, se generará automáticamente a partir del nombre.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        rows={4}
                        placeholder="Descripción de la categoría"
                        {...register('description')}
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagen
                      </label>
                      <CloudinaryUpload 
                        onUploadComplete={handleUploadComplete}
                        multiple={false}
                        maxFiles={1}
                        existingImages={editingCategory?.image_url ? [editingCategory.image_url] : []}
                        onRemoveExisting={() => editingCategory && setEditingCategory({...editingCategory, image_url: null})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default CategoriesAdmin;