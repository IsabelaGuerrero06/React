import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProfileByUserId, checkProfileExists } from '../../services/ProfileService';
import { User, Mail, Phone, MapPin, Edit, UserPlus } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Verificar si el perfil existe
      const exists = await checkProfileExists(Number(id));
      setProfileExists(exists);
      
      if (exists) {
        // Si existe, cargar los datos
        const data = await getProfileByUserId(Number(id));
        console.log('📦 Datos recibidos del backend:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('❌ Error al obtener perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Si no hay ID, probablemente es el usuario actual
  // Mostrar el mensaje de crear perfil
  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-md text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserPlus size={48} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Perfil no encontrado
          </h2>
          <p className="text-gray-600 mb-8">
            Este usuario aún no ha creado su perfil. Crea uno ahora para comenzar.
          </p>
          <button
            onClick={() => {
              // Si no hay ID, redirigir a una página de error o pedir el ID
              alert('⚠️ No se puede crear un perfil sin un ID de usuario válido');
            }}
            className="w-full bg-gray-400 cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium"
            disabled
          >
            <UserPlus size={20} className="inline mr-2" />
            Crear Perfil
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Por favor, accede desde la lista de usuarios
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Si el perfil NO existe, mostrar mensaje para crear
  if (!profileExists) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-md text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserPlus size={48} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Perfil no encontrado
          </h2>
          <p className="text-gray-600 mb-8">
            Este usuario aún no ha creado su perfil. Crea uno ahora para comenzar.
          </p>
          <button
            onClick={() => navigate(`/profiles/create/${id}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <UserPlus size={20} />
            Crear Perfil
          </button>
        </div>
      </div>
    );
  }

  // Si el perfil existe pero no se cargó
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Error al cargar el perfil.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-8">
          {/* Contenedor principal del perfil */}
          <main className="flex-1 bg-white rounded-lg shadow-sm p-8 relative">
            
            {/* Botón de actualizar en la esquina superior derecha */}
            <Link
              to={`/profile/update/${id}`}
              className="absolute top-6 right-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Edit size={18} />
              <span className="font-medium">Actualizar</span>
            </Link>

            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-800 mb-8 pr-40">
              {profile.fullName || 'Usuario'} - Perfil
            </h1>

            <div className="flex gap-12">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-64 h-64 rounded-lg border-2 border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden shadow-sm">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error al cargar imagen:', profile.avatarUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-gray-400">
                      <User size={80} strokeWidth={1} />
                    </div>
                  )}
                </div>
              </div>

              {/* Información del perfil */}
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <User size={16} />
                    <span className="font-medium">Nombre:</span>
                  </div>
                  <p className="text-lg text-gray-800">{profile.fullName || 'No especificado'}</p>
                </div>

                {profile.email && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Mail size={16} />
                      <span className="font-medium">Email:</span>
                    </div>
                    <p className="text-lg text-gray-800">{profile.email}</p>
                  </div>
                )}

                {profile.phone && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Phone size={16} />
                      <span className="font-medium">Teléfono:</span>
                    </div>
                    <p className="text-lg text-gray-800">{profile.phone}</p>
                  </div>
                )}

                {profile.address && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <MapPin size={16} />
                      <span className="font-medium">Dirección:</span>
                    </div>
                    <p className="text-lg text-gray-800">{profile.address}</p>
                  </div>
                )}
              </div>
            </div>

            {profile.about && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Sobre mí</h3>
                <p className="text-gray-700 leading-relaxed">{profile.about}</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;