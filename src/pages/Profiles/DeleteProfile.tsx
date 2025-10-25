import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfileByUserId, deleteProfile } from "../../services/ProfileService";
import { Profile } from "../../models/Profile";

const DeleteProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!id) return;
    getProfileByUserId(Number(id)).then(setProfile);
  }, [id]);

  const handleDelete = async () => {
    if (!profile?.id) return;
    const confirmDelete = confirm("¿Seguro que deseas eliminar este perfil?");
    if (!confirmDelete) return;

    try {
      await deleteProfile(profile.id);
      alert("Perfil eliminado correctamente");
      navigate("/profiles");
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar el perfil");
    }
  };

  if (!profile) return <p>Cargando perfil...</p>;

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Eliminar perfil de {profile.fullName}</h2>
      <p>¿Estás seguro de que deseas eliminar este perfil?</p>
      <button
        onClick={handleDelete}
        className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
      >
        Eliminar
      </button>
    </div>
  );
};

export default DeleteProfile;
