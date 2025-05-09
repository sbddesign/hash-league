import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import MapVisualization from '@/components/MapVisualization';
import SidePanel from '@/components/SidePanel';
import AddPoolButton from '@/components/AddPoolButton';
import { MiningPool } from '@shared/schema';

// Import Leaflet for map functionality
import L from 'leaflet';
// Import Leaflet CSS file - this is necessary for the map to display properly
import 'leaflet/dist/leaflet.css';

export default function Home() {
  const [selectedPool, setSelectedPool] = useState<MiningPool | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  const { data: pools, isLoading, error } = useQuery<MiningPool[]>({
    queryKey: ['/api/mining-pools'],
  });
  
  const handlePoolSelect = (pool: MiningPool) => {
    setSelectedPool(pool);
    setIsPanelOpen(true);
  };
  
  const handlePanelClose = () => {
    setIsPanelOpen(false);
  };

  // Calculate global statistics
  const totalHashrate = !isLoading && pools ? 
    pools.reduce((sum: number, pool: MiningPool) => {
      const hashValue = parseFloat(pool.hashrate);
      return sum + (isNaN(hashValue) ? 0 : hashValue);
    }, 0).toFixed(1) + ' PH/s' : 
    '0 PH/s';
  
  const activePools = !isLoading && pools ? pools.length : 0;

  return (
    <div className="app-container relative min-h-screen bg-black">
      {/* Background Grid Overlay */}
      <div className="grid-overlay absolute inset-0 z-0"></div>
      
      {/* Header - stays on top with z-index */}
      <Header 
        globalHashrate={totalHashrate} 
        activePools={activePools}
      />
      
      {/* Main Content */}
      <main className="relative w-full h-screen overflow-hidden">
        {/* Map first in the DOM for better positioning */}
        <MapVisualization 
          isLoading={isLoading} 
          error={error as Error}
          pools={pools as MiningPool[]} 
          onSelectPool={handlePoolSelect}
          selectedPool={selectedPool}
        />
        
        {/* Side Panel - high z-index to overlay map */}
        <SidePanel 
          isOpen={isPanelOpen} 
          pool={selectedPool}
          onClose={handlePanelClose}
        />
        
        {/* Add Pool Button - highest z-index for accessibility */}
        <AddPoolButton />
      </main>
    </div>
  );
}
