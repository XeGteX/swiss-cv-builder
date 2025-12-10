/**
 * MAIN LAYOUT - CV Builder with Smart Sidebar + Mobile Bottom Nav
 * 
 * Principal layout pour l'application avec:
 * - Desktop: Smart Sidebar à gauche
 * - Mobile: Bottom Navigation Bar en bas
 * - Dynamic Atmosphere Background based on weather/time
 * 
 * Mobile-First: Sidebar hidden on mobile, MobileBottomNav shown instead
 */

import React from 'react';
import { SmartSidebar } from '../components/sidebar/SmartSidebar';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { AtmosphereBackground } from '../components/atmosphere';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    console.log('📐 MainLayout rendering...');
    return (
        <div className="flex h-screen overflow-hidden bg-transparent">
            {/* Dynamic Atmosphere Background */}
            <AtmosphereBackground showWidget={true} />

            {/* Smart Sidebar (collapsible) - Desktop only */}
            <SmartSidebar />

            {/* Main Content Area - with bottom padding on mobile for nav */}
            <main className="flex-1 ml-0 md:ml-20 transition-all duration-300 h-full overflow-hidden relative z-10 pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Navigation - Mobile only */}
            <MobileBottomNav />
        </div>
    );
};
