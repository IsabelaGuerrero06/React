import { useParams } from 'react-router-dom';
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
    <div>
      <h2>Perfil de usuario {id}</h2>
      <p>
        <strong>Nombre:</strong> {profile.fullName}
      </p>
      <p>
        <strong>Teléfono:</strong> {profile.phone}
      </p>
      <p>
        <strong>Dirección:</strong> {profile.address}
      </p>
      <p>
        <strong>Sobre mí:</strong> {profile.about}
      </p>
    </div>
  );
};

export default Profile;
