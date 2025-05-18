import React, { ReactNode } from 'react';
import Header from '@/components/Header';

interface AppLayoutProps {
  children: ReactNode;
  globalHashrate?: string;
  activePools?: number;
}

export default function AppLayout({ 
  children, 
  globalHashrate = '0 EH/s', 
  activePools = 0 
}: AppLayoutProps) {
  return (
    <div className="app-container relative min-h-screen bg-black">
      {/* Background Grid Overlay */}
      <div className="grid-overlay absolute inset-0 z-0"></div>
      
      {/* Header - stays on top with z-index */}
      <Header 
        globalHashrate={globalHashrate} 
        activePools={activePools}
      />
      
      {/* Main Content */}
      <main className="relative w-full h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
}