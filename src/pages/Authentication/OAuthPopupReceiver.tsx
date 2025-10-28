import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// This page should be registered as the OAuth redirect URI (same origin).
// When the OAuth provider redirects here, this component will post a message
// to the opener window with the code (or error) and then close the popup.

const OAuthPopupReceiver = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: 'oauth_callback', code, error },
          window.location.origin
        );
      }
    } catch (e) {
      // ignore
    }

    // close the popup after a short delay so the message can be delivered
    setTimeout(() => {
      try {
        window.close();
      } catch (e) {
        // ignore
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
