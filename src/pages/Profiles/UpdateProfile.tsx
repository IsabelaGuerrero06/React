import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProfileByUserId, updateProfile } from '../../services/ProfileService';
import { Upload, User, Mail, Phone, Camera } from 'lucide-react';

const UpdateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    phone: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProfileByUserId(Number(id))
      .then((data) => {
        console.log('📦 Datos recibidos del backend:', data);
        setProfile(data);
        setFormData({
          phone: data.phone || '',
        });
        // Establecer preview de la imagen actual
        if (data.avatarUrl) {
          setPreviewUrl(data.avatarUrl);
        }
      })
      .catch((error) => console.error('❌ Error al obtener perfil:', error));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Validar tamaño del archivo (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert('⚠️ El archivo es muy grande. Máximo 5MB.');
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('⚠️ Solo se permiten archivos de imagen.');
        return;
      }

      setSelectedFile(file);
      // Crear preview local
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    // Restaurar la foto original si existe
    if (profile?.avatarUrl) {
      setPreviewUrl(profile.avatarUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  // Limpiar URL del objeto cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (previewUrl && selectedFile) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, selectedFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) return;

    // Validar que al menos haya un cambio
    if (!selectedFile && formData.phone === profile.phone) {
      alert('⚠️ No hay cambios para guardar.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('phone', formData.phone);
      
      // IMPORTANTE: El backend espera 'photo' no 'avatar'
      if (selectedFile) {
        formDataToSend.append('photo', selectedFile);
      }

      const updatedProfile = await updateProfile(profile.id, formDataToSend);
      alert('✅ Perfil actualizado correctamente');
      navigate(`/profile/${id}`);
    } catch (error: any) {
      console.error('❌ Error al actualizar perfil:', error);
      const errorMessage = error.response?.data?.error || 'Error al actualizar el perfil';
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <p className="text-red-600">No se puede actualizar el perfil sin un ID.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Actualizar Perfil
          </h1>
          <p className="text-gray-600 mb-8">
            Actualiza tu información de contacto y foto de perfil
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              
              {/* Sección de foto de perfil */}
              <div className="flex flex-col items-center pb-8 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Foto de perfil
                </label>
                
                <div className="relative">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 shadow-lg">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User size={60} strokeWidth={1} />
                      </div>
                    )}
                  </div>
                  
                  {/* Botón de cámara flotante */}
                  <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all hover:scale-110">
                    <Camera size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {selectedFile && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-green-600">✓ {selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-sm text-red-600 hover:text-red-700 underline"
                    >
                      Remover
                    </button>
                  </div>
                )}
                
                <p className="mt-3 text-sm text-gray-500 text-center">
                  JPG, PNG o GIF (máx. 5MB)
                </p>
              </div>

              {/* Campos de información */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name - Solo lectura */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User size={16} />
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={profile.fullName || 'N/A'}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    title="Este campo no se puede editar desde el perfil"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Campo de solo lectura
                  </p>
                </div>

                {/* Email - Solo lectura */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} />
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={profile.email || 'N/A'}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    title="Este campo no se puede editar desde el perfil"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Campo de solo lectura
                  </p>
                </div>

                {/* Phone - Editable */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} />
                    Teléfono <span className="text-red-500">*</span>
                    <span className="text-green-600 text-xs">(Editable)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Ej: +57 300 123 4567"
                    required
                  />
                </div>
              </div>

              {/* Nota informativa */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Nota:</strong> Solo puedes actualizar tu teléfono y foto de perfil desde esta sección. 
                  Para cambiar tu nombre o correo electrónico, contacta al administrador.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Guardando...
                    </span>
                  ) : (
                    'Guardar cambios'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${id}`)}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 rounded-lg font-medium transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;