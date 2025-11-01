import React, { useEffect, useState } from 'react';
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

  // estado para manejo de archivo y preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialProfile?.avatarUrl || null,
  );

  const isEditing = !!initialProfile;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  // limpiar URL creada por createObjectURL cuando cambie el archivo o al desmontar
  useEffect(() => {
    return () => {
      if (previewUrl && selectedFile) {
        URL.revokeObjectURL(previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl, selectedFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('fullName', profile.fullName || '');
      formData.append('phone', profile.phone || '');
      formData.append('address', profile.address || '');
      formData.append('about', profile.about || '');
      // si hay un archivo seleccionado, lo anexamos con la clave 'avatar'
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

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

      <div className="flex flex-col items-center">
        <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400">No hay foto</span>
          )}
        </div>
        <div className="mt-2 w-full flex items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="avatarInput"
          />
          <label
            htmlFor="avatarInput"
            className="ml-2 inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md cursor-pointer text-sm bg-gray-50 hover:bg-gray-100"
          >
            Examinar
          </label>
          <span className="ml-3 text-sm text-gray-600 truncate">
            {selectedFile
              ? selectedFile.name
              : profile.avatarUrl
              ? 'Foto actual'
              : 'Sin archivo seleccionado'}
          </span>
        </div>
      </div>

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
          Teléfono
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
          Dirección
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
          Sobre mí
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
