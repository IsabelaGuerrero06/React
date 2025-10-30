import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProfileByUserId } from '../../services/ProfileService';
import { User, Mail, Phone, MapPin, Edit } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    getProfileByUserId(Number(id))
      .then((data) => {
        console.log('📦 Datos recibidos del backend:', data);
        setProfile(data);
      })
      .catch((error) => console.error('❌ Error al obtener perfil:', error));
  }, [id]);

  if (!id) {
    return <p>No se pueden ver los perfiles sin un ID.</p>;
  }

  if (!profile) {
    return <p>Cargando perfil...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-8">

          {/* Contenedor principal del perfil */}
          <main className="flex-1 bg-white rounded-lg shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                {profile.fullName || 'Usuario'} - Profile
              </h1>
              <Link
                to={`/profile/update/${id}`}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
              >
                <Edit size={18} />
                Editar
              </Link>
            </div>

            <div className="flex gap-12">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-64 h-64 border-2 border-gray-300 flex items-center justify-center bg-gray-50">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
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
                    <span className="font-medium">Name:</span>
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
                      <span className="font-medium">Phone:</span>
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