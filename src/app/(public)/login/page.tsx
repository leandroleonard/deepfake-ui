'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@/lib/auth';
import { Input } from '@/components/ui/input';

interface LoginFormInputs {
    email: string;
    password: string;
}

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormInputs>();

    const [apiError, setApiError] = useState<string | null>(null);
    const router = useRouter();

    const onSubmit = async (data: LoginFormInputs) => {
        setApiError(null);
        try {
            const response = await api.post('/auth/login', data);
            const token = response.data.access_token;
            setAuthToken(token);
            router.push('/analysis');
        } catch (error: any) {
            console.error('Login error:', error);

            let message = 'Erro ao fazer login';

            if (error.response) {
                console.error('Response data:', error.response.data);
                message = error.response.data.message || error.response.data.detail || message;
            } else if (error.request) {
                console.error('Request error:', error.request);
                message = 'Sem resposta do servidor. Verifique sua conexão.';
            } else {
                message = error.message;
            }

            setApiError(message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white font-bold text-lg mb-4 shadow-md">
                            D
                        </div>
                        <h1 className="text-2xl font-semibold" style={{ color: '#000' }}>
                            DeepDetect
                        </h1>

                        <p className="text-gray-500 mt-2 text-sm">
                            Entre na sua conta para continuar
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>

                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                {...register('email', { required: 'Email é obrigatório' })}
                                className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    } focus:border-black focus:ring-black rounded-md transition-all duration-200`}
                                required
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Senha
                                </label>
                                <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-black transition">
                                    Esqueceu?
                                </Link>
                            </div>

                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                {...register('password', { required: 'Senha é obrigatória' })}
                                className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'
                                    } focus:border-black focus:ring-black rounded-md transition-all duration-200`}
                            />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                        </div>

                        {apiError && <p className="text-red-500 text-center text-sm">{apiError}</p>}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black text-white hover:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg py-3"
                        >
                            {isSubmitting ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-xs text-gray-400">ou</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        Não tem uma conta?{' '}
                        <Link href="/register" className="text-black font-medium hover:underline">
                            Criar conta
                        </Link>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    © {new Date().getFullYear()} DeepDetect. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}