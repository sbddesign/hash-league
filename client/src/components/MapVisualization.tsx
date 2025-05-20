import { useEffect, useRef, useState } from 'react';
// import { Map, Tag } from 'lucide-react';
import { MiningPool } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { MAP_CONFIG, COLORS } from '@/lib/constants';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapVisualizationProps {
  isLoading: boolean;
  error: Error | null;
  pools: MiningPool[] | undefined;
  onSelectPool: (pool: MiningPool) => void;
  selectedPool: MiningPool | null;
}

export default function MapVisualization({ 
  isLoading, 
  error, 
  pools, 
  onSelectPool, 
  selectedPool 
}: MapVisualizationProps) {
  const [popupPoolId, setPopupPoolId] = useState<number | null>(null);

  // Open popup when selectedPool changes
  useEffect(() => {
    if (selectedPool) {
      setPopupPoolId(selectedPool.id);
    }
  }, [selectedPool]);

  if (isLoading) {
    return (
      <div className="map-container flex items-center justify-center bg-black">
        <div className="text-xl" style={{ color: COLORS.neonBlue }}>Loading map data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-container flex items-center justify-center bg-black">
        <Card className="w-full max-w-md mx-4 border-glow-pink">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-2" style={{ color: COLORS.neonPink }}>Error Loading Map</h2>
            <p className="text-white">Failed to load mining pool data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return(
    <Map
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      initialViewState={{
        longitude: -95.7129, // Center of US
        latitude: 37.0902,
        zoom: 3
      }}
      projection="mercator"
      style={{width: '100%', height: '100%'}}
      // mapStyle="mapbox://styles/mapbox/dark-v11"
      mapStyle="mapbox://styles/funwithmapping/cmauj4mcu00lp01r2a1ksa01j"
    >
      {pools && pools.map(pool => {
        // Debug: log coordinates for each marker
        console.log(`Marker for ${pool.name}: lat=${pool.latitude}, lng=${pool.longitude}`);
        
        // Ensure coordinates are numbers
        const latitude = Number(pool.latitude);
        const longitude = Number(pool.longitude);
        
        // Validate coordinates
        if (isNaN(latitude) || isNaN(longitude)) {
          console.error(`Invalid coordinates for ${pool.name}: lat=${pool.latitude}, lng=${pool.longitude}`);
          return null;
        }
        
        const isTestPool = 'testData' in pool && pool.testData !== null;
        const markerColor = isTestPool ? COLORS.neonBlue : COLORS.neonPink;
        const popupColor = markerColor;
        
        return (
          <Marker
            key={pool.id}
            longitude={longitude}
            latitude={latitude}
            anchor="center"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setPopupPoolId(pool.id);
              onSelectPool(pool);
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: markerColor,
                boxShadow: `0 0 10px ${markerColor}, 0 0 20px ${markerColor}`,
                border: '2px solid #222',
                cursor: 'pointer',
              }}
              title={pool.name}
            />
            {popupPoolId === pool.id && (
              <Popup
                longitude={longitude}
                latitude={latitude}
                anchor="top"
                closeButton={true}
                closeOnClick={false}
                onClose={() => setPopupPoolId(null)}
                focusAfterOpen={false}
                style={{ zIndex: 1000 }}
                className=""
              >
                <div className="text-center px-6 py-1">
                  <h3 className="text-[16px] font-semibold">{pool.name}</h3>
                  <p className="">{pool.city}, {pool.country}</p>
                </div>
              </Popup>
            )}
          </Marker>
        );
      })}
    </Map>
  );

  // return (
  //   <div className="map-container dark-map-bg">
  //     <div id="map" ref={mapRef} className="dark-map-bg"></div>
      
  //     {/* Legend */}
  //     <div className="absolute bottom-5 left-5 z-30 bg-black bg-opacity-70 backdrop-blur-sm p-3 rounded-lg border-glow-blue text-xs font-jetbrains hidden md:block">
  //       <h3 className="mb-2 uppercase tracking-wider font-semibold" style={{ color: COLORS.neonBlue }}>Map Legend</h3>
  //       <div className="grid grid-cols-1 gap-1">
  //         <div className="flex items-center">
  //           <span className="w-3 h-3 rounded-full mr-2" 
  //                 style={{ backgroundColor: COLORS.neonPink, boxShadow: `0 0 5px ${COLORS.neonPink}` }}></span>
  //           <span>Live Mining Pool</span>
  //         </div>
  //         <div className="flex items-center">
  //           <span className="w-3 h-3 rounded-full mr-2" 
  //                 style={{ backgroundColor: COLORS.neonBlue, boxShadow: `0 0 5px ${COLORS.neonBlue}` }}></span>
  //           <span>Unclaimed Territory</span>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}
