
import React, { useState } from 'react';
import { useAuthStore } from '../../../application/store/auth-store';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../design-system/atoms/Button';
import { Card } from '../../design-system/atoms/Card';
import { Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
        if (useAuthStore.getState().isAuthenticated) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">Sign in to your account</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full justify-center py-2.5 text-base"
                        isLoading={isLoading}
                    >
                        Sign In
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Create one
                    </Link>
                </div>

                <div className="mt-4 text-center">
                    <Link to="/" className="block text-xs text-slate-400 hover:text-slate-600">
                        Continue in Offline Mode
                    </Link>
                </div>
            </Card>
        </div>
    );
};
