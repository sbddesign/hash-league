import { useEffect, useRef, useState } from 'react';
import { Map, Tag } from 'lucide-react';
import { MiningPool } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import * as L from 'leaflet';

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
  const markers = useRef<{[key: number]: any}>({});

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
            center: [20, 0],
            zoom: 2,
            minZoom: 2,
            maxZoom: 10,
            zoomControl: false,
            attributionControl: false,
          });
          
          leafletMap.current = map;
    
          // Add dark mode tile layer
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
                el.style.color = '#00f3ff';
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

  // Add markers when pool data is loaded
  useEffect(() => {
    // Wait until map and pools are loaded
    const addMarkers = () => {
      console.log("Adding markers, pools length:", pools?.length);
      
      if (leafletMap.current && pools && pools.length > 0) {
        // Clear existing markers
        Object.values(markers.current).forEach(marker => {
          if (leafletMap.current) {
            leafletMap.current.removeLayer(marker);
          }
        });
        markers.current = {};
        
        // Create custom icons for markers
        const realPoolIcon = L.divIcon({
          className: 'pool-marker',
          iconSize: [20, 20],
          html: '<div style="width:100%;height:100%;border-radius:50%;background-color:#ff00ea;box-shadow:0 0 10px #ff00ea, 0 0 20px #ff00ea;"></div>'
        });
        
        const testPoolIcon = L.divIcon({
          className: 'pool-marker',
          iconSize: [20, 20],
          html: '<div style="width:100%;height:100%;border-radius:50%;background-color:#00f3ff;box-shadow:0 0 10px #00f3ff, 0 0 20px #00f3ff;"></div>'
        });
  
        console.log("Adding", pools.length, "markers to map");
        
        // Add new markers
        pools.forEach(pool => {
          if (leafletMap.current) {
            try {
              // Determine if this is a test pool (has testData) or real pool
              const isTestPool = 'testData' in pool && pool.testData !== null;
              const poolIcon = isTestPool ? testPoolIcon : realPoolIcon;
              
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
              
              // Simple popup on hover with color matching marker type
              const popupColor = isTestPool ? '#00f3ff' : '#ff00ea';
              marker.bindPopup(`
                <div class="font-bold" style="color: ${popupColor}">${pool.name}</div>
                <div class="text-xs">${pool.city}, ${pool.country}</div>
              `);
              
              markers.current[pool.id] = marker;
            } catch (error) {
              console.error("Error adding marker:", error);
            }
          }
        });
      }
    };
    
    // Add markers with a slight delay to ensure map is initialized
    setTimeout(addMarkers, 2000);
  }, [pools, onSelectPool]);

  // Update map view when a pool is selected
  useEffect(() => {
    if (leafletMap.current && selectedPool) {
      leafletMap.current.setView(
        [selectedPool.latitude, selectedPool.longitude], 
        5, 
        { animate: true }
      );
    }
  }, [selectedPool]);

  if (isLoading) {
    return (
      <div className="map-container flex items-center justify-center bg-black">
        <div className="text-[#00f3ff] text-xl">Loading map data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-container flex items-center justify-center bg-black">
        <Card className="w-full max-w-md mx-4 border-glow-pink">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-[#ff00ea] mb-2">Error Loading Map</h2>
            <p className="text-white">Failed to load mining pool data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="map-container dark-map-bg">
      <div id="map" ref={mapRef} className="dark-map-bg"></div>
      
      {/* Legend */}
      <div className="absolute bottom-5 left-5 z-30 bg-black bg-opacity-70 backdrop-blur-sm p-3 rounded-lg border-glow-blue text-xs font-jetbrains hidden md:block">
        <h3 className="text-[#00f3ff] mb-2 uppercase tracking-wider font-semibold">Map Legend</h3>
        <div className="grid grid-cols-1 gap-1">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-[#ff00ea] mr-2" style={{ boxShadow: '0 0 5px #ff00ea' }}></span>
            <span>Live Mining Pool</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-[#00f3ff] mr-2" style={{ boxShadow: '0 0 5px #00f3ff' }}></span>
            <span>Unclaimed Territory</span>
          </div>
        </div>
      </div>
    </div>
  );
}
