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
    return (
        <div className="flex min-h-screen">
            {/* Smart Sidebar (collapsible) */}
            <SmartSidebar />

            {/* Main Content Area */}
            <main className="flex-1 ml-20 transition-all duration-300">
                {children}
            </main>
        </div>
    );
};
