import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, AlertCircle, CheckCircle, Loader2, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface ProfileData {
  name: string;
  email: string;
  role?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  postal_code?: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
  });

  const [originalData, setOriginalData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
  });
  
  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
      if (profileData.phone && !/^\+?[\d\s\-()]+$/.test(profileData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }
    
    if (profileData.postal_code && !/^\d{5,10}$/.test(profileData.postal_code)) {
      newErrors.postal_code = 'Código postal debe tener entre 5 y 10 dígitos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verificar si hay cambios sin guardar
  const hasUnsavedChanges = (): boolean => {
    return JSON.stringify(profileData) !== JSON.stringify(originalData);
  };

  // Auto-ocultar notificaciones
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Cargar información del perfil desde la base de datos
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error;
        }
        
        const loadedData = {
          name: data?.name || user.name || '',
          email: user.email,
          role: data?.role || 'customer',
          address: data?.address || '',
          city: data?.city || '',
          postal_code: data?.postal_code || '',
          phone: data?.phone || '',
        };
        
        setProfileData(loadedData);
        setOriginalData(loadedData);
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
        setNotification({
          type: 'error',
          message: 'No se pudo cargar la información del perfil'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, navigate]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Guardar cambios del perfil
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !validateForm()) return;
    
    setSaving(true);
    setNotification(null);
    
    try {
      // Actualizar metadatos del usuario (nombre)
      if (profileData.name !== user.name) {
        await updateProfile({ name: profileData.name });
      }
      
      // Actualizar información adicional en la tabla profiles
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profileData.name,
          email: user.email,
          address: profileData.address,
          city: profileData.city,
          postal_code: profileData.postal_code,
          phone: profileData.phone,
          role: profileData.role || 'customer',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Actualizar los datos originales para detectar futuros cambios
      setOriginalData({...profileData});
      
      setNotification({
        type: 'success',
        message: 'Perfil actualizado correctamente'
      });
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setNotification({
        type: 'error',
        message: 'No se pudo actualizar el perfil. Inténtalo de nuevo.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Redirigir al login si no hay usuario
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-gray-500">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  // Mostrar loader mientras se cargan los datos
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-gray-500">Cargando información del perfil...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Mi perfil</h1>
        </div>
        
        {profileData.role === 'admin' && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <Shield className="h-4 w-4" />
            <span>Administrador</span>
          </div>
        )}
      </div>
      
      {/* Indicador de cambios sin guardar */}
      {hasUnsavedChanges() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-yellow-700 text-sm">
              Tienes cambios sin guardar. No olvides guardar antes de salir.
            </p>
          </div>
        </div>
      )}
      
      {notification && (
        <div className={`p-4 rounded-md mb-6 ${notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            )}
            <p className={notification.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {notification.message}
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium">Información personal</h2>
            <p className="mt-1 text-sm text-gray-500">
              Actualiza tu información personal y de contacto
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={profileData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={profileData.email}
                  disabled
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  No puedes cambiar tu correo electrónico
                </p>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={profileData.phone || ''}
                  onChange={handleChange}
                  placeholder="+56 9 1234 5678"
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
              
              {profileData.role && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de cuenta
                  </label>
                  <div className="mt-1 flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profileData.role === 'admin' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profileData.role === 'admin' ? (
                        <>
                          <Shield className="w-3 h-3 mr-1" />
                          Administrador
                        </>
                      ) : (
                        'Cliente'
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Dirección de envío</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={profileData.address || ''}
                    onChange={handleChange}
                    placeholder="Ej: Av. Providencia 1234, Depto 101"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    value={profileData.city || ''}
                    onChange={handleChange}
                    placeholder="Ej: Santiago"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                    Código postal
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    id="postal_code"
                    value={profileData.postal_code || ''}
                    onChange={handleChange}
                    placeholder="Ej: 7500000"
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm ${
                      errors.postal_code ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.postal_code && (
                    <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {hasUnsavedChanges() && (
                <span className="text-yellow-600">• Cambios pendientes</span>
              )}
            </div>
            <button
              type="submit"
              disabled={saving || loading || !hasUnsavedChanges()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Sección de historial de pedidos - Se podría añadir en una versión futura */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium">Historial de pedidos</h2>
          <p className="mt-1 text-sm text-gray-500">
            Revisa tus pedidos anteriores
          </p>
        </div>
        
        <div className="p-6">
          <p className="text-gray-500 text-center py-8">
            No tienes pedidos recientes
          </p>
          {/* Aquí se podría mostrar un listado de pedidos en el futuro */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
