import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { User } from '../../models/User';
import SecurityService from '../../services/securityService';
import Breadcrumb from '../../components/Breadcrumb';
import SocialSignInButton from '../../components/SocialSignInButton';
import { AuthProvider } from '../../types/authTypes';
import { signInWith } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSocial = async (provider: AuthProvider) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Social sign-in clicked:', provider);

      // Iniciar flujo OAuth con popup
      const result = await signInWith(provider, { popup: true });
      console.log('OAuth result:', result);

      // Si el resultado contiene directamente el usuario (Microsoft con Firebase)
      if ((result as any).user) {
        const firebaseUser = (result as any).user;
        const token = (result as any).accessToken || '';

        // Extraer datos básicos de Firebase
        const name = firebaseUser.displayName || 'Sin nombre';
        const email = firebaseUser.email || '';

        try {
          // 🔹 Crear o recuperar el usuario en el backend
          const backendUser = await userService.createIfNotExists(name, email);

          // 🔹 Guardar la sesión local y el ID
          if (backendUser) {
            localStorage.setItem('currentUserId', String(backendUser.id));
            SecurityService.setSession(backendUser, token);
            console.log('✅ Sesión iniciada correctamente con:', backendUser);
            navigate('/');
            return;
          } else {
            console.warn(
              '⚠️ No se pudo crear ni obtener el usuario en el backend',
            );
          }
        } catch (error) {
          console.error('❌ Error sincronizando usuario con backend:', error);
        }
      }

      // Si obtuvimos un código de autorización, enviarlo al backend
      const code = (result as any).code;
      if (code) {
        console.log('Exchanging code with backend...');

        const resp = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/oauth/callback`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider,
              code,
              redirectUri: import.meta.env[`VITE_${provider}_REDIRECT_URI`],
            }),
          },
        );

        const data = await resp.json();
        console.log('Exchange response:', resp.status, data);

        if (resp.ok) {
          const user = data.user || data;
          const token = data.token || data.accessToken;

          if (user && token) {
            SecurityService.setSession(user, token);
            navigate('/');
            return;
          }
        } else {
          throw new Error(data.message || 'Authentication failed');
        }
      }

      // Si obtuvimos accessToken directo
      const accessToken = (result as any).accessToken;
      if (accessToken) {
        console.log('Processing access token...');

        const resp = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/oauth/token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider, accessToken }),
          },
        );

        const data = await resp.json();
        if (resp.ok) {
          const user = data.user || data;
          const token = data.token || accessToken;

          SecurityService.setSession(user, token);
          navigate('/');
          return;
        }
      }

      throw new Error('No valid authentication data received');
    } catch (err: any) {
      console.error('Social sign-in error:', err);
      setError(err.message || 'Authentication failed. Please try again.');

      if (err.code) console.error('Error code:', err.code);
      if (err.details) console.error('Error details:', err.details);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (user: User) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Traditional login:', user);

      const response = await SecurityService.login(user);
      console.log('Usuario autenticado:', response);
      navigate('/');
    } catch (err: any) {
      console.error('Error al iniciar sesión', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Sign In" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="px-26 py-17.5 text-center">
              <img
                className="hidden dark:block"
                src={'/images/logo/logo.svg'}
                alt="Logo"
                width={176}
                height={32}
              />
              <img
                className="dark:hidden"
                src={'/images/logo/logo-dark.svg'}
                alt="Logo"
                width={176}
                height={32}
              />

              <p className="2xl:px-20">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit
                suspendisse.
              </p>
            </div>
          </div>

          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
              <span className="mb-1.5 block font-medium">Start for free</span>
              <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Sign In to TailAdmin
              </h2>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Formik
                initialValues={{
                  email: '',
                  password: '',
                }}
                validationSchema={Yup.object({
                  email: Yup.string()
                    .email('Email inválido')
                    .required('El email es obligatorio'),
                  password: Yup.string().required(
                    'La contraseña es obligatoria',
                  ),
                })}
                onSubmit={(values) => {
                  handleLogin(values);
                }}
              >
                {({ handleSubmit }) => (
                  <Form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-4 bg-white rounded-md"
                  >
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2.5 block font-medium text-black dark:text-white"
                      >
                        Email
                      </label>
                      <Field
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="email"
                        component="p"
                        className="mt-1 text-red-500 text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="mb-2.5 block font-medium text-black dark:text-white"
                      >
                        Password
                      </label>
                      <Field
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="password"
                        component="p"
                        className="mt-1 text-red-500 text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className="flex items-center justify-center">
                      <span className="block h-px w-full bg-stroke dark:bg-strokedark"></span>
                      <span className="px-4 text-sm text-body">OR</span>
                      <span className="block h-px w-full bg-stroke dark:bg-strokedark"></span>
                    </div>

                    <div className="space-y-3">
                      <SocialSignInButton
                        provider={AuthProvider.GOOGLE}
                        onClick={() => handleSocial(AuthProvider.GOOGLE)}
                        disabled={loading}
                      />
                      <SocialSignInButton
                        provider={AuthProvider.MICROSOFT}
                        onClick={() => handleSocial(AuthProvider.MICROSOFT)}
                        disabled={loading}
                      />
                      <SocialSignInButton
                        provider={AuthProvider.GITHUB}
                        onClick={() => handleSocial(AuthProvider.GITHUB)}
                        disabled={loading}
                      />
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
