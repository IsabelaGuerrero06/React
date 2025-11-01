import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { microsoftAuthProvider } from '../../services/auth/microsoftAuthProvider';

const MicrosoftCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener el código de autorización de la URL
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error || !code) {
          console.error('Error en la autenticación:', error, errorDescription);
          navigate('/login');
          return;
        }

        // Procesar el callback con el código
        const result = await microsoftAuthProvider.handleCallback(code);
        
        if (result.user) {
          // Guardar la información de autenticación
          localStorage.setItem('auth_token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          navigate('/dashboard');
        } else {
          console.error('No se recibió información del usuario');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error en el callback de Microsoft:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Procesando inicio de sesión...</h2>
        <p className="text-gray-600">Por favor, espere un momento.</p>
      </div>
    </div>
  );
};

export default MicrosoftCallback;