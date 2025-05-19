import { useEffect, useRef, useState } from 'react';
// import { Map, Tag } from 'lucide-react';
import { MiningPool } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { MAP_CONFIG, COLORS } from '@/lib/constants';
import * as L from 'leaflet';
import Map from 'react-map-gl/mapbox';

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
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  // Store markers with pool ID as the key
  const markers = useRef<{[key: number]: L.Marker}>({});

  useEffect(() => {
    // Function to initialize the map
    const initMap = () => {
      if (mapRef.current && !leafletMap.current) {
        try {
          console.log("Initializing map...");
          // Ensure the element is not null
          const mapEl = mapRef.current;
          if (!mapEl) {
            console.error("Map element is null");
            return;
          }
          
          // Create the map instance
          const map = L.map(mapEl, {
            center: MAP_CONFIG.initialView,
            zoom: MAP_CONFIG.defaultZoom,
            minZoom: MAP_CONFIG.minZoom,
            maxZoom: MAP_CONFIG.maxZoom,
            zoomControl: false,
            attributionControl: false,
          });
          
          leafletMap.current = map;
    
          // Add dark mode tile layer
          L.tileLayer(MAP_CONFIG.tileLayerUrl, {
            attribution: MAP_CONFIG.attribution
          }).addTo(map);
    
          // Add zoom control in the top right with custom styling
          // Remove existing zoom control if any
          const existingControls = document.querySelectorAll('.leaflet-control-zoom');
          existingControls.forEach(el => el.remove());
          
          // Create a custom position for zoom controls below the header
          // Add new zoom control with custom position
          const zoomControl = L.control.zoom({
            position: 'topright',
            zoomInTitle: 'Zoom in',
            zoomOutTitle: 'Zoom out'
          });
          
          zoomControl.addTo(map);
          
          // Force re-render of controls
          setTimeout(() => {
            // Apply custom styling to zoom controls
            document.querySelectorAll('.leaflet-control-zoom-in, .leaflet-control-zoom-out').forEach(el => {
              if (el instanceof HTMLElement) {
                el.style.backgroundColor = '#1a1a1a';
                el.style.color = COLORS.neonBlue;
                el.style.borderColor = '#333';
                // Make control more visible
                el.style.fontSize = '18px';
                el.style.fontWeight = 'bold';
              }
            });
          }, 100);
          
          // Force a resize to ensure the map fills the container
          setTimeout(() => {
            if (map) {
              console.log("Invalidating map size...");
              map.invalidateSize();
            }
          }, 200);
        } catch (error) {
          console.error("Error initializing map:", error);
        }
      }
    };

    // Wait for DOM to be fully rendered
    setTimeout(initMap, 500);

    return () => {
      // Clean up on unmount
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Create markers only once and update their properties when needed
  useEffect(() => {
    // Wait until map and pools are loaded
    const updateMarkers = () => {
      console.log("Updating markers, pools length:", pools?.length);
      
      if (leafletMap.current && pools && pools.length > 0) {
        // Create marker icons (defined once)
        const createRealPoolIcon = () => L.divIcon({
          className: 'pool-marker',
          iconSize: [20, 20],
          html: `<div style="width:100%;height:100%;border-radius:50%;background-color:${COLORS.neonPink};box-shadow:0 0 10px ${COLORS.neonPink}, 0 0 20px ${COLORS.neonPink};"></div>`
        });
        
        const createTestPoolIcon = () => L.divIcon({
          className: 'pool-marker',
          iconSize: [20, 20],
          html: `<div style="width:100%;height:100%;border-radius:50%;background-color:${COLORS.neonBlue};box-shadow:0 0 10px ${COLORS.neonBlue}, 0 0 20px ${COLORS.neonBlue};"></div>`
        });
        
        // Track which pools are currently on the map for cleanup
        const currentPoolIds = new Set<number>();
        
        // Update existing or add new markers
        pools.forEach(pool => {
          if (!leafletMap.current) return;
          
          try {
            currentPoolIds.add(pool.id);
            const isTestPool = 'testData' in pool && pool.testData !== null;
            const poolIcon = isTestPool ? createTestPoolIcon() : createRealPoolIcon();
            const popupColor = isTestPool ? COLORS.neonBlue : COLORS.neonPink;
            
            // Check if marker already exists
            if (markers.current[pool.id]) {
              // Just update the marker position if needed
              const existingMarker = markers.current[pool.id];
              const currentLatLng = existingMarker.getLatLng();
              
              // Only update if position changed
              if (currentLatLng.lat !== pool.latitude || currentLatLng.lng !== pool.longitude) {
                existingMarker.setLatLng([pool.latitude, pool.longitude]);
              }
              
              // Update popup content
              existingMarker.unbindPopup();
              existingMarker.bindPopup(`
                <div style="text-align: center;">
                  <div style="font-weight: bold; color: ${popupColor};">${pool.name}</div>
                  <div style="color: white; font-size: 12px;">${pool.city}, ${pool.country}</div>
                </div>
              `, {
                className: 'custom-popup',
                closeButton: true,
                autoClose: false,
                closeOnEscapeKey: true
              });
            } else {
              // Create new marker if it doesn't exist
              const marker = L.marker([pool.latitude, pool.longitude], { 
                icon: poolIcon,
                title: pool.name
              }).addTo(leafletMap.current);
              
              marker.on('click', () => {
                console.log("Marker clicked:", pool.name);
                onSelectPool(pool);
                
                // Center and zoom to marker
                leafletMap.current?.setView([pool.latitude, pool.longitude], 5, {
                  animate: true,
                  duration: 1
                });
              });
              
              // Add popup to new marker
              marker.bindPopup(`
                <div style="text-align: center;">
                  <div style="font-weight: bold; color: ${popupColor};">${pool.name}</div>
                  <div style="color: white; font-size: 12px;">${pool.city}, ${pool.country}</div>
                </div>
              `, {
                className: 'custom-popup',
                closeButton: true,
                autoClose: false,
                closeOnEscapeKey: true
              });
              
              markers.current[pool.id] = marker;
            }
          } catch (error) {
            console.error("Error updating marker for pool:", pool.name, error);
          }
        });
        
        // Remove markers that are no longer in the pools data
        Object.keys(markers.current).forEach(id => {
          const poolId = parseInt(id);
          if (!currentPoolIds.has(poolId) && leafletMap.current) {
            leafletMap.current.removeLayer(markers.current[poolId]);
            delete markers.current[poolId];
          }
        });
      }
    };
    
    // Update markers with a slight delay to ensure map is initialized
    const timerId = setTimeout(updateMarkers, 1000);
    
    return () => clearTimeout(timerId);
  }, [pools, onSelectPool]);

  // Update map view when a pool is selected and open its popup
  useEffect(() => {
    if (leafletMap.current && selectedPool) {
      // Track whether the animation is complete
      let animationComplete = false;
      
      // Close any existing popups
      leafletMap.current.closePopup();
      
      // Get the marker for the selected pool
      const marker = markers.current[selectedPool.id];
      if (!marker) return;
      
      // Define a function to handle popup opening to ensure consistent behavior
      const openPopupSafely = () => {
        if (!leafletMap.current || !marker) return;
        
        try {
          // Unbind the current popup
          marker.unbindPopup();
          
          // Create a new popup with the same content
          const isTestPool = 'testData' in selectedPool && selectedPool.testData !== null;
          const popupColor = isTestPool ? COLORS.neonBlue : COLORS.neonPink;
          
          // Rebind the popup with same content
          marker.bindPopup(`
            <div style="text-align: center;">
              <div style="font-weight: bold; color: ${popupColor};">${selectedPool.name}</div>
              <div style="color: white; font-size: 12px;">${selectedPool.city}, ${selectedPool.country}</div>
            </div>
          `, {
            className: 'custom-popup',
            closeButton: true,
            autoClose: false,    // Prevent auto-closing when clicking elsewhere
            closeOnEscapeKey: true
          });
          
          // Open the popup
          marker.openPopup();
        } catch (error) {
          console.error("Error opening popup:", error);
        }
      };
      
      // Center the map on the selected pool
      leafletMap.current.once('moveend', () => {
        animationComplete = true;
        // Open popup after animation has completed
        openPopupSafely();
      });
      
      // Start the map panning
      leafletMap.current.setView(
        [selectedPool.latitude, selectedPool.longitude], 
        5, 
        { animate: true, duration: 0.5 }
      );
      
      // Fallback to ensure popup opens even if moveend doesn't fire
      setTimeout(() => {
        if (!animationComplete) {
          openPopupSafely();
        }
      }, 600);
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
    <>
      <Map
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14
        }}
        style={{width: '100%', height: '100%'}}
        mapStyle="mapbox://styles/funwithmapping/cmauj4mcu00lp01r2a1ksa01j"
      />
    </>
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
