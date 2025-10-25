import React, { useState } from 'react';
import { Profile } from '../models/Profile';
import { createProfile, updateProfile } from '../services/ProfileService';

interface Props {
  userId: number;
  initialProfile: Profile | null;
  onSaved: (profile: Profile) => void;
}

const ProfileForm: React.FC<Props> = ({ userId, initialProfile, onSaved }) => {
  const [profile, setProfile] = useState<Profile>(
    initialProfile || {
      userId,
      fullName: '',
      phone: '',
      address: '',
      about: '',
    },
  );

  const isEditing = !!initialProfile;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('fullName', profile.fullName || '');
      formData.append('phone', profile.phone || '');
      formData.append('address', profile.address || '');
      formData.append('about', profile.about || '');

      if (isEditing && profile.id) {
        const res = await updateProfile(profile.id, formData);
        alert('Perfil actualizado correctamente');
        onSaved(res);
      } else {
        const res = await createProfile(userId, formData);
        alert('Perfil creado correctamente');
        onSaved(res);
      }
    } catch (error) {
      console.error(error);
      alert('Error al guardar el perfil');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md space-y-4"
    >
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
        {isEditing ? 'Editar Perfil' : 'Crear Perfil'}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre completo
        </label>
        <input
          type="text"
          name="fullName"
          value={profile.fullName}
          onChange={handleChange}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          TelÃ©fono
        </label>
        <input
          type="text"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          DirecciÃ³n
        </label>
        <input
          type="text"
          name="address"
          value={profile.address}
          onChange={handleChange}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Sobre mÃ­
        </label>
        <textarea
          name="about"
          value={profile.about}
          onChange={handleChange}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          rows={4}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
      >
        Guardar cambios
      </button>
    </form>
  );
};

export default ProfileForm;