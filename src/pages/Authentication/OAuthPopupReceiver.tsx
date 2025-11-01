import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const OAuthPopupReceiver = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    console.log('[OAuthPopupReceiver] Página cargada');
    console.log('[OAuthPopupReceiver] Parámetros recibidos:', { code, error });

    try {
      if (window.opener && !window.opener.closed) {
        console.log('[OAuthPopupReceiver] Enviando mensaje al opener...');
        window.opener.postMessage(
          { type: 'oauth_callback', code, error },
          window.location.origin
        );
        console.log('[OAuthPopupReceiver] Mensaje enviado correctamente ✅');
      } else {
        console.warn('[OAuthPopupReceiver] No se encontró window.opener o ya fue cerrado ❌');
      }
    } catch (e) {
      console.error('[OAuthPopupReceiver] Error enviando mensaje al opener:', e);
    }

    // Cerrar el popup tras un breve retardo
    setTimeout(() => {
      console.log('[OAuthPopupReceiver] Cerrando popup...');
      try {
        window.close();
      } catch (e) {
        console.error('[OAuthPopupReceiver] Error al cerrar popup:', e);
      }
    }, 300);
  }, [searchParams]);

  return (
    <div className="p-6 text-center">
      <h2 className="text-lg font-medium">Procesando autenticación...</h2>
      <p className="text-sm text-gray-600">Cierra esta ventana si no se cierra automáticamente.</p>
    </div>
  );
};

export default OAuthPopupReceiver;
