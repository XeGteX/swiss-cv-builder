import React, { useState } from 'react';
import { useAuthStore } from '../../../application/store/auth-store';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../design-system/atoms/Button';
import { Card } from '../../design-system/atoms/Card';
import { Lock, Mail, FileText } from 'lucide-react';
import { InfinityService } from '../../../infrastructure/pdf/infinity/infinity-service';
import type { CVProfile } from '../../../domain/entities/cv';

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

    const handleTestPdf = async () => {
        const dummyProfile: CVProfile = {
            id: 'test-1',
            lastUpdated: Date.now(),
            personal: {
                firstName: 'John',
                lastName: 'Doe',
                title: 'Software Engineer',
                contact: {
                    email: 'john@example.com',
                    phone: '+1 234 567 890',
                    address: 'New York, NY',
                },
            },
            summary: 'Experienced software engineer with a passion for building scalable applications.',
            experiences: [
                {
                    id: 'exp-1',
                    role: 'Senior Developer',
                    company: 'Tech Corp',
                    dates: '2020 - Present',
                    tasks: ['Built the core engine', 'Led a team of 5'],
                },
            ],
            educations: [
                {
                    id: 'edu-1',
                    degree: 'BS Computer Science',
                    school: 'MIT',
                    year: '2019',
                },
            ],
            languages: [],
            skills: ['TypeScript', 'React', 'Node.js'],
            strengths: [],
            metadata: {
                templateId: 'modern',
                density: 'comfortable',
                accentColor: '#3b82f6',
                fontFamily: 'sans',
            },
        };

        const blob = await InfinityService.generatePdfBlob(dummyProfile);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'infinity-test.pdf';
        a.click();
        URL.revokeObjectURL(url);
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

                <div className="mt-4 text-center space-y-2">
                    <Link to="/" className="block text-xs text-slate-400 hover:text-slate-600">
                        Continue in Offline Mode
                    </Link>
                    <button
                        onClick={handleTestPdf}
                        type="button"
                        className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center justify-center gap-1 mx-auto"
                    >
                        <FileText size={12} /> Test Infinity PDF
                    </button>
                </div>
            </Card>
        </div>
    );
};
