'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setAuthToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function RegisterPage() {
    const router = useRouter();
    const [apiError, setApiError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    // Validação para confirmar se as senhas são iguais
    const password = watch('password');

    const onSubmit = async (data: any) => {
        setApiError(null);
        try {
            // 1. Criar a conta
            await api.post('/auth/register', {
                name: data.name,
                email: data.email,
                password: data.password,
            });

            const loginRes = await api.post('/auth/login', {
                email: data.email,
                password: data.password,
            });

            setAuthToken(
                loginRes.data.access_token,
                loginRes.data.refresh_token 
            );

            toast.success('Conta criada com sucesso!');
            router.push('/analysis');
        } catch (error: any) {
            console.log(error)
            const message = error.response?.data?.message || error.response?.data?.detail || 'Erro ao criar conta';
            setApiError(message);
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white font-bold text-lg mb-4 shadow-md">
                            D
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#000' }}>Criar conta</h1>
                        <p className="text-gray-500 mt-2 text-sm">Comece a detectar deepfakes gratuitamente</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" style={{ color: '#000' }}>Nome completo</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="João Silva"
                                {...register('name', { required: 'Nome é obrigatório' })}
                                className={errors.name ? 'border-red-500' : 'border-gray-300'}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message as string}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" style={{ color: '#000' }}>Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                {...register('email', {
                                    required: 'Email é obrigatório',
                                    pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' }
                                })}
                                className={errors.email ? 'border-red-500' : 'border-gray-300'}
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message as string}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" style={{ color: '#000' }}>Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                {...register('password', {
                                    required: 'Senha é obrigatória',
                                    minLength: { value: 8, message: 'Mínimo 8 caracteres' }
                                })}
                                className={errors.password ? 'border-red-500' : 'border-gray-300'}
                            />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message as string}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" style={{ color: '#000' }}>Confirmar senha</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                {...register('confirmPassword', {
                                    required: 'Confirmação é obrigatória',
                                    validate: (value) => value === password || 'As senhas não coincidem'
                                })}
                                className={errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message as string}</p>}
                        </div>

                        {apiError && <p className="text-red-500 text-center text-sm">{apiError}</p>}

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black text-white hover:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
                        >
                            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                        </Button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-xs text-gray-400">ou</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        Já tem uma conta?{' '}
                        <Link href="/login" className="text-black font-medium hover:underline">
                            Fazer login
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