import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../application/store/auth-store';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '../../design-system/atoms/Button';

export const SubscriptionTab: React.FC = () => {
    const { user, isAuthenticated } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Check for URL params (success/canceled)
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('success')) {
            setMessage({ type: 'success', text: 'Subscription successful! You are now a Pro member.' });
            // Remove query param
            window.history.replaceState({}, '', window.location.pathname);
        }
        if (query.get('canceled')) {
            setMessage({ type: 'error', text: 'Subscription canceled.' });
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const handleSubscribe = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/subscriptions/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error('Failed to start checkout');

            const { url } = await response.json();
            if (url) window.location.href = url;
        } catch (error) {
            console.error('Subscribe Error:', error);
            setMessage({ type: 'error', text: 'Failed to start checkout. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePortal = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/subscriptions/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error('Failed to open portal');

            const { url } = await response.json();
            if (url) window.location.href = url;
        } catch (error) {
            console.error('Portal Error:', error);
            setMessage({ type: 'error', text: 'Failed to open billing portal.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Please log in to manage your subscription.</p>
            </div>
        );
    }

    const isPro = user?.subscriptionStatus === 'PRO';

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Subscription Plan
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Manage your subscription and billing details.
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Free Plan */}
                <div className={`relative p-6 rounded-xl border-2 ${!isPro ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200 dark:border-gray-700'}`}>
                    {!isPro && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Current Plan
                        </div>
                    )}
                    <h3 className="text-lg font-semibold mb-2">Free</h3>
                    <div className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-gray-500">/mo</span></div>
                    <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            Basic CV Templates
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            Local Storage
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-400">
                            <Check className="w-4 h-4" />
                            Cloud Sync (Limited)
                        </li>
                    </ul>
                </div>

                {/* Pro Plan */}
                <div className={`relative p-6 rounded-xl border-2 ${isPro ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200 dark:border-gray-700'}`}>
                    {isPro && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Current Plan
                        </div>
                    )}
                    <h3 className="text-lg font-semibold mb-2">Pro</h3>
                    <div className="text-3xl font-bold mb-4">$9<span className="text-sm font-normal text-gray-500">/mo</span></div>
                    <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            All Premium Templates
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            Unlimited Cloud Storage
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            Advanced AI Writer
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            Priority Support
                        </li>
                    </ul>

                    {isPro ? (
                        <Button
                            onClick={handlePortal}
                            disabled={isLoading}
                            className="w-full"
                            variant="outline"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Manage Subscription'}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubscribe}
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upgrade to Pro'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
