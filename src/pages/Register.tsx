import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { extractErrorMessage } from '../utils/helpers';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const registerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (err) {
      setServerError(extractErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <svg className="h-9 w-9 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 3c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3zm6 12H6v-.57c0-.81.48-1.53 1.22-1.85C8.51 16.21 10.19 16 12 16s3.49.21 4.78.58c.74.32 1.22 1.04 1.22 1.85V19z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Boleta</h1>
          <p className="text-gray-500 mt-1">Crea tu cuenta</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <Input
              label="Nombre completo"
              type="text"
              placeholder="Juan Pérez"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@correo.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              error={errors.password?.message}
              helperText="La contraseña debe tener al menos 6 caracteres"
              {...register('password')}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
            >
              Crear cuenta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
