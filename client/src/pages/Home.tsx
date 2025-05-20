import { useState } from 'react';
import MapVisualization from '@/components/MapVisualization';
import SidePanel from '@/components/SidePanel';
import ActionButtons from '@/components/ActionButtons';
import TopRankingsPanel from '@/components/TopRankingsPanel';
import AppLayout from '@/components/layout/AppLayout';
import { usePoolData } from '@/hooks/use-pool-data';
import { usePoolHashrateTracking } from '@/hooks/use-pool-hashrate-tracking';
import { MiningPool } from '@shared/schema';

// Import Leaflet CSS file - this is necessary for the map to display properly
import 'leaflet/dist/leaflet.css';

export default function Home() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  
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
  
  // Track hashrate changes of top 3 pools and notify when they increase
  const { hashrateChanges } = usePoolHashrateTracking(displayPools);
  
  const handlePoolSelect = (pool: MiningPool) => {
    selectPool(pool);
    setShowFaq(false);
    setIsPanelOpen(true);
  };
  
  const handlePanelClose = () => {
    setIsPanelOpen(false);
  };
  
  const handleFaqClick = () => {
    setShowFaq(true);
    setIsPanelOpen(true);
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
        showFaq={showFaq}
      />
      
      {/* Action Buttons - positioned in bottom right */}
      <ActionButtons onFaqClick={handleFaqClick} />
      
      {/* Top Rankings Panel - always visible */}
      <TopRankingsPanel 
        pools={displayPools} 
        isVisible={true} 
        onSelectPool={handlePoolSelect}
      />
    </AppLayout>
  );
}
