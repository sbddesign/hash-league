import { useState } from 'react';
import MapVisualization from '@/components/MapVisualization';
import SidePanel from '@/components/SidePanel';
import AddPoolButton from '@/components/AddPoolButton';
import TopRankingsPanel from '@/components/TopRankingsPanel';
import AppLayout from '@/components/layout/AppLayout';
import { usePoolData } from '@/hooks/use-pool-data';
import { MiningPool } from '@shared/schema';

// Import Leaflet CSS file - this is necessary for the map to display properly
import 'leaflet/dist/leaflet.css';

export default function Home() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Use our custom hook for pool data management
  const {
    pools: displayPools,
    selectedPool,
    isLoading,
    error,
    globalHashrate,
    activePools,
    handlePoolSelect: selectPool,
    setSelectedPool
  } = usePoolData();
  
  const handlePoolSelect = (pool: MiningPool) => {
    selectPool(pool);
    setIsPanelOpen(true);
  };
  
  const handlePanelClose = () => {
    setIsPanelOpen(false);
  };

  return (
    <AppLayout 
      globalHashrate={globalHashrate} 
      activePools={activePools}
    >
      {/* Map first in the DOM for better positioning */}
      <MapVisualization 
        isLoading={isLoading} 
        error={error as Error}
        pools={displayPools as MiningPool[]} 
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
      
      {/* Top Rankings Panel - always visible */}
      <TopRankingsPanel 
        pools={displayPools} 
        isVisible={true} 
        onSelectPool={handlePoolSelect}
      />
    </AppLayout>
  );
}
