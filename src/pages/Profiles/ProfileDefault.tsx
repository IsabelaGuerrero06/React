import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { checkProfileExists } from '../../services/ProfileService';

/**
 * Componente para /profile sin ID
 * Detecta el usuario logueado desde localStorage
 * y redirige automáticamente a su perfil.
 */
const ProfileDefault = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  // ✅ Obtener el ID real del usuario logueado
  const currentUserId = localStorage.getItem('currentUserId');

 useEffect(() => {
  const storedId = localStorage.getItem('currentUserId');
  if (!storedId) {
    console.warn('⚠️ No hay usuario autenticado en localStorage');
    setIsChecking(false);
    return;
  }

  // 🔒 Convertir a número y asegurar que no sea NaN
  const idNum = Number(storedId);
  if (isNaN(idNum)) {
    console.error('⚠️ currentUserId inválido en localStorage');
    setIsChecking(false);
    return;
  }

  // ✅ Guardar ID autenticado fijo
  checkAndRedirect(idNum);
}, []);

  const checkAndRedirect = async (idNum: number) => {
  try {
    const exists = await checkProfileExists(idNum);

    if (exists) {
      navigate(`/profile/${idNum}`, { replace: true });
    } else {
      navigate(`/profiles/create/${idNum}`, { replace: true });
    }
  } catch (error) {
    console.error('Error al verificar perfil:', error);
    setIsChecking(false);
  }
};

  // Si no hay usuario logueado o no se detectó ID
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
          No se detectó un usuario logueado. Inicia sesión para continuar.
        </p>

        <button
          onClick={() => navigate('/auth/signin')}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          Ir al inicio de sesión
        </button>
      </div>
    </div>
  );
};

export default ProfileDefault;
