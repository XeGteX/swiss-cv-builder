/**
 * MAIN LAYOUT - CV Builder with Smart Sidebar
 * 
 * Principal layout pour l'application avec Smart Sidebar intégrée.
 * Remplace le layout classique pour offrir une navigation moderne.
 * 
 * Mobile-First: Sidebar hidden on mobile, full-width content
 */

import React from 'react';
import { SmartSidebar } from '../components/sidebar/SmartSidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    console.log('📐 MainLayout rendering...');
    return (
        <div className="flex h-screen overflow-hidden bg-transparent">
            {/* Smart Sidebar (collapsible) - Hidden on mobile via SmartSidebar internal logic */}
            <SmartSidebar />

            {/* Main Content Area - Full width on mobile, margin on desktop */}
            <main className="flex-1 ml-0 md:ml-20 transition-all duration-300 h-full overflow-hidden relative z-10">
                {children}
            </main>
        </div>
    );
};
