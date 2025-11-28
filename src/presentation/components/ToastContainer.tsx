import React from 'react';
import { useToastStore } from '@/application/store/toast-store';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/presentation/design-system/atoms/Button';

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast: { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }) => (
                <div
                    key={toast.id}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] animate-in slide-in-from-right-full fade-in duration-300",
                        toast.type === 'success' && "bg-green-50 text-green-800 border border-green-200",
                        toast.type === 'error' && "bg-red-50 text-red-800 border border-red-200",
                        toast.type === 'warning' && "bg-yellow-50 text-yellow-800 border border-yellow-200",
                        toast.type === 'info' && "bg-blue-50 text-blue-800 border border-blue-200"
                    )}
                >
                    {toast.type === 'success' && <CheckCircle size={18} />}
                    {toast.type === 'error' && <AlertCircle size={18} />}
                    {toast.type === 'warning' && <AlertTriangle size={18} />}
                    {toast.type === 'info' && <Info size={18} />}

                    <p className="text-sm font-medium flex-1">{toast.message}</p>

                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-current opacity-60 hover:opacity-100 transition-opacity"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};
