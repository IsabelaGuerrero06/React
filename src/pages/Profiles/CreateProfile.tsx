import { useState } from "react";
import ProfileForm from "../../components/ProfileForm";
import { Profile } from "../../models/Profile";

interface Props {
  userId: number;
}

const CreateProfile: React.FC<Props> = ({ userId }) => {
  const [profile, setProfile] = useState<Profile | null>(null);

  const handleSaved = (newProfile: Profile) => {
    setProfile(newProfile);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Crear nuevo perfil</h1>
      <ProfileForm userId={userId} initialProfile={null} onSaved={handleSaved} />
    </div>
  );
};

export default CreateProfile;
