import React from 'react';
import { ImmersiveBackground } from './ImmersiveBackground';

interface AppShellProps {
    children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
    console.log('🐚 AppShell rendering...');
    return (
        <div className="relative h-screen w-full overflow-hidden text-slate-100 font-sans">
            {/* Global Animated Background */}
            <ImmersiveBackground />

            {/* Content Layer */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </div>
    );
};
