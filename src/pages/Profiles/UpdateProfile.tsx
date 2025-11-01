import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProfileByUserId, updateProfile } from '../../services/ProfileService';
import { Upload } from 'lucide-react';

const UpdateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    phone: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!id) return;
    getProfileByUserId(Number(id))
      .then((data) => {
        console.log('📦 Datos recibidos del backend:', data);
        setProfile(data);
        setFormData({
          phone: data.phone || '',
        });
      })
      .catch((error) => console.error('❌ Error al obtener perfil:', error));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!profile?.id) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('phone', formData.phone);
      
      if (selectedFile) {
        formDataToSend.append('avatar', selectedFile);
      }

      await updateProfile(profile.id, formDataToSend);
      alert('Perfil actualizado correctamente');
      navigate(`/profile/${id}`);
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      alert('Error al actualizar el perfil');
    }
  };

  if (!id) {
    return <p>No se puede actualizar el perfil sin un ID.</p>;
  }

  if (!profile) {
    return <p>Cargando perfil...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-8">
          {/* Formulario de actualización */}
          <main className="flex-1 bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              FBC - Profile
            </h1>

            <div className="space-y-6 max-w-2xl">
              {/* Name - Solo lectura */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name: <span className="font-bold">{profile.fullName}</span>
                </label>
              </div>

              {/* Email - Solo lectura */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email: <span className="font-bold">{profile.email}</span>
                </label>
              </div>

              {/* Phone - Editable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone:
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese su teléfono"
                />
              </div>

              {/* Photo - File input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={selectedFile ? selectedFile.name : ''}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded bg-gray-50"
                    placeholder="No se ha seleccionado archivo"
                  />
                  <label className="inline-flex items-center gap-2 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded cursor-pointer transition">
                    <Upload size={18} />
                    Browse
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Update Button */}
              <div className="pt-4">
                <button
                  onClick={handleSubmit}
                  className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium transition"
                >
                  Update
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;