'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/header';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, LogOut, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { removeAuthToken } from '@/lib/auth';

interface User {
    id: string;
    name: string;
    email: string;
    tokens?: number;
}

interface ProfileFormInputs {
    name: string;
    email: string;
    current_password: string;
    new_password: string;
    confirm_password: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormInputs>();

    const newPassword = watch('new_password');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await api.get('/auth/me');
                setUser(data);
                setValue('email', data.email);
                setValue('name', data.name);
            } catch (err) {
                toast.error('Erro ao carregar perfil.');
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
    }, []);


    const onSubmit = async (data: ProfileFormInputs) => {
        setApiError(null);
        try {
            await api.put('/auth/profile', {
                name: data.name,
                email: data.email,
                current_password: data.current_password,
                new_password: data.new_password || undefined,
                password_confirmation: data.confirm_password || undefined,
            });
            toast.success('Perfil atualizado com sucesso!');
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.detail ||
                'Erro ao atualizar perfil.';
            setApiError(msg);
            toast.error(msg);
        }
    };

    const handleLogout = () => {
        removeAuthToken();
        router.push('/login');
    };

    if (loadingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-6 py-16">
                <h1 className="text-4xl md:text-5xl font-semibold mb-6" style={{ color: '#000' }}>
                    Perfil do Usuário
                </h1>
                <p className="text-gray-600 mb-12">Gerencie suas informações e segurança da conta</p>

                {/* Formulário */}
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
                    <h2 className="text-2xl font-medium mb-6" style={{ color: '#000' }}>
                        Atualizar Informações
                    </h2>

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" style={{ color: '#000' }}>Nome</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Seu nome"
                                {...register('name', {
                                    required: 'Nome é obrigatório',
                                })}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
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
                                    pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' },
                                })}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                        </div>

                        {/* Senha atual */}
                        <div className="space-y-2 relative">
                            <Label htmlFor="current_password" style={{ color: '#000' }}>Senha Atual</Label>
                            <Input
                                id="current_password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                {...register('current_password', { required: 'Senha atual é obrigatória' })}
                                className={errors.current_password ? 'border-red-500 pr-10' : 'pr-10'}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-9 text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                            {errors.current_password && (
                                <p className="text-red-500 text-sm">{errors.current_password.message}</p>
                            )}
                        </div>

                        {/* Nova senha */}
                        <div className="space-y-2">
                            <Label htmlFor="new_password" style={{ color: '#000' }}>Nova Senha <span className="text-gray-400 text-sm">(opcional)</span></Label>
                            <Input
                                id="new_password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                {...register('new_password', {
                                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                                })}
                                className={errors.new_password ? 'border-red-500' : ''}
                            />
                            {errors.new_password && (
                                <p className="text-red-500 text-sm">{errors.new_password.message}</p>
                            )}
                        </div>

                        {/* Confirmar nova senha */}
                        <div className="space-y-2">
                            <Label htmlFor="confirm_password" style={{ color: '#000' }}>Confirmar Nova Senha</Label>
                            <Input
                                id="confirm_password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                {...register('confirm_password', {
                                    validate: (value) =>
                                        !newPassword || value === newPassword || 'As senhas não coincidem',
                                })}
                                className={errors.confirm_password ? 'border-red-500' : ''}
                            />
                            {errors.confirm_password && (
                                <p className="text-red-500 text-sm">{errors.confirm_password.message}</p>
                            )}
                        </div>

                        {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-black text-white hover:bg-gray-900 w-full px-6 py-3 rounded-lg shadow-md"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                                </span>
                            ) : (
                                'Salvar Alterações'
                            )}
                        </Button>
                    </form>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Créditos */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-start hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCard className="w-6 h-6 text-gray-700" />
                            <h3 className="text-lg font-medium" style={{ color: '#000' }}>Créditos</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Você possui <strong>{user?.tokens ?? 0}</strong> créditos disponíveis para análise.
                        </p>
                        <Link href="/credits">
                            <Button className="bg-black text-white hover:bg-gray-900 px-4 py-2 rounded-lg shadow-md">
                                Gerenciar Créditos
                            </Button>
                        </Link>
                    </div>

                    {/* Logout */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-start hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <LogOut className="w-6 h-6 text-gray-700" />
                            <h3 className="text-lg font-medium" style={{ color: '#000' }}>Sair da Conta</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Clique abaixo para encerrar sua sessão de forma segura.
                        </p>
                        <Button
                            onClick={handleLogout}
                            className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg shadow-md"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}