import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createProfile } from '../../services/ProfileService';
import { Upload, User, Phone, Camera, ArrowLeft } from 'lucide-react';

const CreateProfile = () => {
  const { id } = useParams(); // userId
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      alert('❌ Error: No se proporcionó ID de usuario');
      return;
    }

    // Validar que al menos el teléfono esté lleno
    if (!formData.phone.trim()) {
      alert('⚠️ El teléfono es obligatorio');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('phone', formData.phone);

      // Agregar foto si existe
      if (selectedFile) {
        formDataToSend.append('photo', selectedFile);
      }

      // POST /api/profiles/user/{userId}
      await createProfile(Number(id), formDataToSend);

      alert('✅ Perfil creado exitosamente');
      navigate(`/profile/${id}`);
    } catch (error: any) {
      console.error('❌ Error al crear perfil:', error);
      const errorMessage =
        error.response?.data?.error || 'Error al crear el perfil';
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <p className="text-red-600">
          No se puede crear el perfil sin un ID de usuario.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Crear Perfil
            </h1>
            <p className="text-gray-600">
              Completa la información de tu perfil para comenzar
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Sección de foto de perfil */}
              <div className="flex flex-col items-center pb-8 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Foto de perfil (opcional)
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
                    <span className="text-sm text-green-600">
                      ✓ {selectedFile.name}
                    </span>
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

              {/* Campo de teléfono */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} />
                  Número de teléfono <span className="text-red-500">*</span>
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
                <p className="mt-2 text-sm text-gray-500">
                  Este campo es obligatorio para crear tu perfil
                </p>
              </div>

              {/* Nota informativa */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Nota:</strong> Una vez creado tu perfil, podrás
                  actualizarlo desde la sección de perfil.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:scale-100"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creando perfil...
                    </span>
                  ) : (
                    'Crear Perfil'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg "
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

export default CreateProfile;
