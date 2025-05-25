// @ts-nocheck - Archivo pendiente de refactorización de tipos completa
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  AlertCircle, 
  Check,
  Image,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Edit
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import CloudinaryUpload from '../../components/CloudinaryUpload';

import { HomePageSettings, HeroSlide, FeaturedCategory, PromotionBanner } from '../../types/siteSettings';

const SiteSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<HomePageSettings | null>(null);
  const [categories, setCategories] = useState<{id: string, name: string, slug: string}[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [editingHeroIndex, setEditingHeroIndex] = useState<number | null>(null);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editingBanner, setEditingBanner] = useState(false);
  
  // Usamos un tipo genérico para el formulario actual
  // @ts-ignore - Para simplificar el uso de form sin tipar todos los campos
  const { register, handleSubmit, reset, setValue } = useForm();
  
  // Fetch settings and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch categories for dropdown selection
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name');
          
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
        
        // Fetch homepage settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'home_page')
          .single();
          
        if (settingsError && settingsError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" error, which is ok if no settings exist yet
          throw settingsError;
        }
        
        if (settingsData) {
          setSettings(settingsData.value as HomePageSettings);
        } else {
          // Initialize with default structure if no settings exist
          setSettings({
            hero_images: [],
            featured_categories: [],
            promotion_banner: {
              image_url: '',
              alt_text: '',
              title: '',
              subtitle: '',
              link: '',
              button_text: 'COMPRAR AHORA'
            }
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setNotification({
          type: 'error',
          message: 'Error al cargar la configuración'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase.from('site_settings').upsert({
        key: 'home_page',
        value: settings
      }, { onConflict: 'key' });
      
      if (error) throw error;
      
      setNotification({
        type: 'success',
        message: 'Configuración guardada correctamente'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setNotification({
        type: 'error',
        message: 'Error al guardar la configuración'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Hero Slides Management
  const handleHeroUploadComplete = (urls: string[]) => {
    if (!settings || urls.length === 0) return;
    
    if (editingHeroIndex !== null) {
      // Update existing slide
      const updatedSlides = [...settings.hero_images];
      updatedSlides[editingHeroIndex] = {
        ...updatedSlides[editingHeroIndex],
        image_url: urls[0]
      };
      setSettings({...settings, hero_images: updatedSlides});
    } else {
      // Add new slide with default values
      const newSlide: HeroSlide = {
        image_url: urls[0],
        alt_text: 'Nueva Imagen',
        title: 'NUEVO TÍTULO',
        subtitle: 'Nuevo subtítulo',
        link: '/'
      };
      setSettings({
        ...settings,
        hero_images: [...settings.hero_images, newSlide]
      });
      
      // Start editing the new slide
      setEditingHeroIndex(settings.hero_images.length);
    }
  };
  const updateHeroSlide = (data: Record<string, any>) => {
    if (editingHeroIndex === null || !settings) return;
    
    const updatedSlides = [...settings.hero_images];
    updatedSlides[editingHeroIndex] = {
      ...updatedSlides[editingHeroIndex],
      alt_text: data.alt_text,
      title: data.title,
      subtitle: data.subtitle,
      link: data.link
    };
    
    setSettings({...settings, hero_images: updatedSlides});
    setEditingHeroIndex(null);
    reset();
  };
  
  const removeHeroSlide = (index: number) => {
    if (!settings) return;
    
    const updatedSlides = [...settings.hero_images];
    updatedSlides.splice(index, 1);
    setSettings({...settings, hero_images: updatedSlides});
    
    // Reset editing if the slide being edited is removed
    if (editingHeroIndex === index) {
      setEditingHeroIndex(null);
      reset();
    } else if (editingHeroIndex !== null && editingHeroIndex > index) {
      // Adjust the editing index if a slide before it is removed
      setEditingHeroIndex(editingHeroIndex - 1);
    }
  };
  
  const moveHeroSlide = (index: number, direction: 'up' | 'down') => {
    if (!settings) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= settings.hero_images.length) return;
    
    const updatedSlides = [...settings.hero_images];
    [updatedSlides[index], updatedSlides[newIndex]] = [updatedSlides[newIndex], updatedSlides[index]];
    
    setSettings({...settings, hero_images: updatedSlides});
    
    // Update editing index if the slide being edited is moved
    if (editingHeroIndex === index) {
      setEditingHeroIndex(newIndex);
    } else if (editingHeroIndex === newIndex) {
      setEditingHeroIndex(index);
    }
  };
  
  const editHeroSlide = (index: number) => {
    if (!settings) return;
    
    const slide = settings.hero_images[index];
    
    // Set form values
    setValue('alt_text', slide.alt_text);
    setValue('title', slide.title);
    setValue('subtitle', slide.subtitle);
    setValue('link', slide.link);
    
    setEditingHeroIndex(index);
  };
  
  // Featured Categories Management
  const handleCategoryUploadComplete = (urls: string[]) => {
    if (!settings || urls.length === 0) return;
    
    if (editingCategoryIndex !== null) {
      // Update existing category
      const updatedCategories = [...settings.featured_categories];
      updatedCategories[editingCategoryIndex] = {
        ...updatedCategories[editingCategoryIndex],
        image_url: urls[0]
      };
      setSettings({...settings, featured_categories: updatedCategories});
    } else {
      // Add new category with default values
      const newCategory: FeaturedCategory = {
        category: categories.length > 0 ? categories[0].slug : '',
        image_url: urls[0],
        title: 'NUEVA CATEGORÍA'
      };
      setSettings({
        ...settings,
        featured_categories: [...settings.featured_categories, newCategory]
      });
      
      // Start editing the new category
      setEditingCategoryIndex(settings.featured_categories.length);
    }
  };
  
  const updateFeaturedCategory = (data: any) => {
    if (editingCategoryIndex === null || !settings) return;
    
    const updatedCategories = [...settings.featured_categories];
    updatedCategories[editingCategoryIndex] = {
      ...updatedCategories[editingCategoryIndex],
      category: data.category,
      title: data.title
    };
    
    setSettings({...settings, featured_categories: updatedCategories});
    setEditingCategoryIndex(null);
    reset();
  };
  
  const removeFeaturedCategory = (index: number) => {
    if (!settings) return;
    
    const updatedCategories = [...settings.featured_categories];
    updatedCategories.splice(index, 1);
    setSettings({...settings, featured_categories: updatedCategories});
    
    // Reset editing if the category being edited is removed
    if (editingCategoryIndex === index) {
      setEditingCategoryIndex(null);
      reset();
    } else if (editingCategoryIndex !== null && editingCategoryIndex > index) {
      // Adjust the editing index if a category before it is removed
      setEditingCategoryIndex(editingCategoryIndex - 1);
    }
  };
  
  const moveFeaturedCategory = (index: number, direction: 'up' | 'down') => {
    if (!settings) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= settings.featured_categories.length) return;
    
    const updatedCategories = [...settings.featured_categories];
    [updatedCategories[index], updatedCategories[newIndex]] = [updatedCategories[newIndex], updatedCategories[index]];
    
    setSettings({...settings, featured_categories: updatedCategories});
    
    // Update editing index if the category being edited is moved
    if (editingCategoryIndex === index) {
      setEditingCategoryIndex(newIndex);
    } else if (editingCategoryIndex === newIndex) {
      setEditingCategoryIndex(index);
    }
  };
  
  const editFeaturedCategory = (index: number) => {
    if (!settings) return;
    
    const category = settings.featured_categories[index];
    
    // Set form values
    setValue('category', category.category);
    setValue('category_title', category.title);
    
    setEditingCategoryIndex(index);
  };
  
  // Promotion Banner Management
  const handleBannerUploadComplete = (urls: string[]) => {
    if (!settings || urls.length === 0) return;
    
    const updatedBanner = {
      ...settings.promotion_banner,
      image_url: urls[0]
    };
    
    setSettings({...settings, promotion_banner: updatedBanner});
  };
  
  const updatePromotionBanner = (data: any) => {
    if (!settings) return;
    
    const updatedBanner = {
      ...settings.promotion_banner,
      alt_text: data.banner_alt_text,
      title: data.banner_title,
      subtitle: data.banner_subtitle,
      link: data.banner_link,
      button_text: data.banner_button_text
    };
    
    setSettings({...settings, promotion_banner: updatedBanner});
    setEditingBanner(false);
    reset();
  };
  
  const editPromotionBanner = () => {
    if (!settings) return;
    
    const banner = settings.promotion_banner;
    
    // Set form values
    setValue('banner_alt_text', banner.alt_text);
    setValue('banner_title', banner.title);
    setValue('banner_subtitle', banner.subtitle);
    setValue('banner_link', banner.link);
    setValue('banner_button_text', banner.button_text);
    
    setEditingBanner(true);
  };
  
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Cargando configuración...</p>
      </div>
    );
  }
  
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
        <h1 className="text-2xl font-bold">Personalización de la Página Principal</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-800 disabled:bg-gray-400"
        >
          {saving ? (
            <>
              <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" /> Guardar Cambios
            </>
          )}
        </button>
      </div>
      
      <div className="space-y-8">
        {/* Hero Slides Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-medium text-gray-900">Imágenes del Slider Principal</h2>
          </div>
          
          <div className="p-6">
            {settings?.hero_images && settings.hero_images.length > 0 ? (
              <div className="space-y-4 mb-6">
                {settings.hero_images.map((slide, index) => (
                  <div 
                    key={`hero-${index}`} 
                    className={`border rounded-lg p-4 ${editingHeroIndex === index ? 'border-blue-500 bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-medium">Slide {index + 1}</h3>
                      <div className="flex space-x-1">
                        {index > 0 && (
                          <button 
                            type="button"
                            onClick={() => moveHeroSlide(index, 'up')}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <MoveUp size={16} />
                          </button>
                        )}
                        {index < settings.hero_images.length - 1 && (
                          <button 
                            type="button"
                            onClick={() => moveHeroSlide(index, 'down')}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <MoveDown size={16} />
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => editHeroSlide(index)}
                          className="p-1 text-blue-500 hover:text-blue-700"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => removeHeroSlide(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <img 
                          src={slide.image_url} 
                          alt={slide.alt_text} 
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <div className="font-semibold text-lg">{slide.title}</div>
                        <div className="text-gray-600">{slide.subtitle}</div>
                        <div className="text-sm text-gray-500">Enlace: {slide.link}</div>
                      </div>
                    </div>
                    
                    {editingHeroIndex === index && (
                      <form onSubmit={handleSubmit(updateHeroSlide)} className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Título
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              {...register('title', { required: true })}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Subtítulo
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              {...register('subtitle')}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Texto alternativo
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              {...register('alt_text')}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Enlace
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              {...register('link')}
                            />
                          </div>
                          
                          <div className="flex justify-end space-x-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingHeroIndex(null);
                                reset();
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-500 rounded-md text-white hover:bg-blue-600"
                            >
                              Guardar
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-6">No hay slides configurados.</p>
            )}
            
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Agregar Nuevo Slide</p>
              <CloudinaryUpload 
                onUploadComplete={handleHeroUploadComplete}
                multiple={false}
                maxFiles={1}
              />
            </div>
          </div>
        </div>
        
        {/* Featured Categories Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-medium text-gray-900">Categorías Destacadas</h2>
          </div>
          
          <div className="p-6">
            {settings?.featured_categories && settings.featured_categories.length > 0 ? (
              <div className="space-y-4 mb-6">
                {settings.featured_categories.map((category, index) => (
                  <div 
                    key={`category-${index}`} 
                    className={`border rounded-lg p-4 ${editingCategoryIndex === index ? 'border-blue-500 bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-medium">Categoría {index + 1}</h3>
                      <div className="flex space-x-1">
                        {index > 0 && (
                          <button 
                            type="button"
                            onClick={() => moveFeaturedCategory(index, 'up')}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <MoveUp size={16} />
                          </button>
                        )}
                        {index < settings.featured_categories.length - 1 && (
                          <button 
                            type="button"
                            onClick={() => moveFeaturedCategory(index, 'down')}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <MoveDown size={16} />
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => editFeaturedCategory(index)}
                          className="p-1 text-blue-500 hover:text-blue-700"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => removeFeaturedCategory(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <img 
                          src={category.image_url} 
                          alt={category.title} 
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <div className="font-semibold text-lg">{category.title}</div>
                        <div className="text-sm text-gray-500">
                          Categoría: {
                            categories.find(c => c.slug === category.category)?.name || category.category
                          }
                        </div>
                      </div>
                    </div>
                    
                    {editingCategoryIndex === index && (
                      <form onSubmit={handleSubmit(updateFeaturedCategory)} className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Título
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              {...register('category_title', { required: true })}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Categoría
                            </label>
                            <select
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              {...register('category', { required: true })}
                            >
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.slug}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex justify-end space-x-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryIndex(null);
                                reset();
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-500 rounded-md text-white hover:bg-blue-600"
                            >
                              Guardar
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-6">No hay categorías destacadas configuradas.</p>
            )}
            
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Agregar Nueva Categoría Destacada</p>
              <CloudinaryUpload 
                onUploadComplete={handleCategoryUploadComplete}
                multiple={false}
                maxFiles={1}
              />
            </div>
          </div>
        </div>
        
        {/* Promotion Banner Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-medium text-gray-900">Banner Promocional</h2>
          </div>
          
          <div className="p-6">
            {settings?.promotion_banner ? (
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-medium">Banner Actual</h3>
                  <button 
                    type="button"
                    onClick={editPromotionBanner}
                    className="p-1 text-blue-500 hover:text-blue-700"
                  >
                    <Edit size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    {settings.promotion_banner.image_url ? (
                      <img 
                        src={settings.promotion_banner.image_url} 
                        alt={settings.promotion_banner.alt_text} 
                        className="w-full h-32 object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                        <Image size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <div className="font-semibold text-lg">{settings.promotion_banner.title}</div>
                    <div className="text-gray-600">{settings.promotion_banner.subtitle}</div>
                    <div className="text-sm text-gray-500">
                      Enlace: {settings.promotion_banner.link}
                    </div>
                    <div className="text-sm font-medium">
                      Botón: {settings.promotion_banner.button_text}
                    </div>
                  </div>
                </div>
                
                {editingBanner && (
                  <form onSubmit={handleSubmit(updatePromotionBanner)} className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          {...register('banner_title', { required: true })}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subtítulo
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          {...register('banner_subtitle')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Texto alternativo
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          {...register('banner_alt_text')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enlace
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          {...register('banner_link')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Texto del botón
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          {...register('banner_button_text')}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBanner(false);
                            reset();
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-500 rounded-md text-white hover:bg-blue-600"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <p className="text-gray-500 mb-6">No hay banner promocional configurado.</p>
            )}
            
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Cambiar Imagen del Banner</p>
              <CloudinaryUpload 
                onUploadComplete={handleBannerUploadComplete}
                multiple={false}
                maxFiles={1}
                existingImages={settings?.promotion_banner?.image_url ? [settings.promotion_banner.image_url] : []}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;
