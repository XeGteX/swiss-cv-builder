/**
 * MAIN LAYOUT - CV Builder with Smart Sidebar + Mobile Bottom Nav
 * 
 * Principal layout pour l'application avec:
 * - Desktop: Smart Sidebar à gauche
 * - Mobile: Bottom Navigation Bar en bas
 * 
 * Mobile-First: Sidebar hidden on mobile, MobileBottomNav shown instead
 */

import React from 'react';
import { SmartSidebar } from '../components/sidebar/SmartSidebar';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    console.log('📐 MainLayout rendering...');
    return (
        <div className="flex h-screen overflow-hidden bg-transparent">
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
