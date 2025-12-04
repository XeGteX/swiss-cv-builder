/**
 * MAIN LAYOUT - CV Builder with Smart Sidebar
 * 
 * Principal layout pour l'application avec Smart Sidebar intégrée.
 * Remplace le layout classique pour offrir une navigation moderne.
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
            {/* Smart Sidebar (collapsible) */}
            <SmartSidebar />

            {/* Main Content Area */}
            <main className="flex-1 ml-20 transition-all duration-300 h-full overflow-hidden relative z-10">
                {children}
            </main>
        </div>
    );
};
