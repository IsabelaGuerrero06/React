import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProfileForm from "../../components/ProfileForm";
import { getProfileByUserId } from "../../services/ProfileService";
import { Profile } from "../../models/Profile";

const UpdateProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!id) return;
    getProfileByUserId(Number(id)).then(setProfile);
  }, [id]);

  if (!id) return <p>Falta el ID de usuario.</p>;
  if (!profile) return <p>Cargando perfil...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Editar perfil</h1>
      <ProfileForm userId={Number(id)} initialProfile={profile} onSaved={setProfile} />
    </div>
  );
};

export default UpdateProfile;
