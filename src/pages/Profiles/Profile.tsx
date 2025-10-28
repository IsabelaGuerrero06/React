import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProfileByUserId } from '../../services/ProfileService';

const Profile = () => {
  const { id } = useParams(); // <-- obtiene el :id de la URL
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!id) return; // si no hay id, no hace nada
    getProfileByUserId(Number(id))
      .then((data) => {
        console.log('📦 Datos recibidos del backend:', data); // 👈 aquí ves lo que llega
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <div className="flex items-center space-x-6">
        <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400">Sin foto</span>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-3xl font-bold">
            {profile.fullName || `Usuario ${id}`}
          </h2>
          {profile.email && (
            <p className="text-sm text-gray-600">{profile.email}</p>
          )}
          <div className="mt-3 text-gray-700">
            {profile.phone && (
              <p>
                <strong>Teléfono:</strong> {profile.phone}
              </p>
            )}
            {profile.address && (
              <p>
                <strong>Dirección:</strong> {profile.address}
              </p>
            )}
          </div>
        </div>

        <div className="ml-4">
          <Link
            to={`/profile/update/${id}`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Editar
          </Link>
        </div>
      </div>

      {profile.about && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Sobre mí</h3>
          <p className="mt-2 text-gray-700">{profile.about}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
