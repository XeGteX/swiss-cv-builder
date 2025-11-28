import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/presentation/design-system/atoms/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center border border-red-100">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 mb-2">
                            Oups ! Une erreur est survenue.
                        </h1>
                        <p className="text-slate-500 mb-6 text-sm">
                            {this.state.error?.message || 'Une erreur inattendue s\'est produite.'}
                        </p>
                        <div className="flex justify-center">
                            <Button
                                onClick={this.handleReload}
                                leftIcon={<RefreshCw size={16} />}
                                variant="primary"
                            >
                                Recharger l'application
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
