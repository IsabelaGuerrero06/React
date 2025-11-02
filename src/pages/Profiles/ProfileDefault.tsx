import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { checkProfileExists } from '../../services/ProfileService';

/**
 * Componente para /profile sin ID
 * Si tienes autenticación, detecta el usuario actual y redirige a su perfil
 * Si no, muestra mensaje para ir a lista de usuarios
 */
const ProfileDefault = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  // OPCIÓN A: Si tienes contexto de autenticación
  // import { useAuth } from '../../context/AuthContext';
  // const { user } = useAuth();
  // const currentUserId = user?.id;

  // OPCIÓN B: Si guardas el userId en localStorage
  // const currentUserId = localStorage.getItem('currentUserId');

  // OPCIÓN C: Temporalmente, usar un ID fijo para pruebas
  const currentUserId = 1; // 👈 Cambiar esto según tu lógica

  useEffect(() => {
    if (currentUserId) {
      checkAndRedirect();
    } else {
      setIsChecking(false);
    }
  }, [currentUserId]);

  const checkAndRedirect = async () => {
    if (!currentUserId) return;

    try {
      const exists = await checkProfileExists(Number(currentUserId));
      
      if (exists) {
        // Si el perfil existe, redirigir a verlo
        navigate(`/profile/${currentUserId}`, { replace: true });
      } else {
        // Si no existe, redirigir a crearlo
        navigate(`/profiles/create/${currentUserId}`, { replace: true });
      }
    } catch (error) {
      console.error('Error al verificar perfil:', error);
      setIsChecking(false);
    }
  };

  if (isChecking && currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario logueado o no se puede detectar
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
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/users/list')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            Ir a lista de usuarios
          </button>
          <p className="text-sm text-gray-500">
            Selecciona un usuario para ver o crear su perfil
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileDefault;