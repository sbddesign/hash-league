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
    // Initialize map
    if (mapRef.current && !leafletMap.current) {
      // Wait a bit for the DOM to be ready
      setTimeout(() => {
        try {
          console.log("Initializing map...");
          leafletMap.current = L.map(mapRef.current, {
            center: [20, 0],
            zoom: 2,
            minZoom: 2,
            maxZoom: 10,
            zoomControl: false,
            attributionControl: false,
          });
    
          // Add dark mode tile layer
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(leafletMap.current);
    
          // Add zoom control in the bottom left
          L.control.zoom({
            position: 'bottomleft'
          }).addTo(leafletMap.current);
          
          // Force a resize to ensure the map fills the container
          setTimeout(() => {
            if (leafletMap.current) {
              console.log("Invalidating map size...");
              leafletMap.current.invalidateSize();
            }
          }, 100);
        } catch (error) {
          console.error("Error initializing map:", error);
        }
      }, 100);
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Add markers when pool data is loaded
  useEffect(() => {
    if (leafletMap.current && pools && pools.length > 0) {
      // Clear existing markers
      Object.values(markers.current).forEach(marker => {
        if (leafletMap.current) {
          leafletMap.current.removeLayer(marker);
        }
      });
      markers.current = {};
      
      // Create custom icon for markers
      const poolIcon = L.divIcon({
        className: 'pool-marker',
        iconSize: [20, 20]
      });

      // Add new markers
      pools.forEach(pool => {
        if (leafletMap.current) {
          const marker = L.marker([pool.latitude, pool.longitude], { 
            icon: poolIcon,
            title: pool.name
          }).addTo(leafletMap.current);
          
          marker.on('click', () => {
            onSelectPool(pool);
            
            // Center and zoom to marker
            leafletMap.current?.setView([pool.latitude, pool.longitude], 5, {
              animate: true,
              duration: 1
            });
          });
          
          // Simple popup on hover
          marker.bindPopup(`
            <div class="font-bold text-[#ff00ea]">${pool.name}</div>
            <div class="text-xs">${pool.city}, ${pool.country}</div>
          `);
          
          markers.current[pool.id] = marker;
        }
      });
    }
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
    <div className="map-container">
      <div id="map" ref={mapRef} className="z-10 h-full w-full absolute inset-0"></div>
      
      {/* Legend */}
      <div className="absolute bottom-5 left-5 z-20 bg-black bg-opacity-70 backdrop-blur-sm p-3 rounded-lg border-glow-blue text-xs font-jetbrains hidden md:block">
        <h3 className="text-[#00f3ff] mb-2 uppercase tracking-wider font-semibold">Map Legend</h3>
        <div className="grid grid-cols-1 gap-1">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-[#ff00ea] mr-2" style={{ boxShadow: '0 0 5px #ff00ea' }}></span>
            <span>Mining Pool Location</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded border border-[#00f3ff] mr-2"></span>
            <span>Country Border</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-[#39FF14] bg-opacity-30 mr-2"></span>
            <span>Hash Power Heat Map</span>
          </div>
        </div>
      </div>
    </div>
  );
}
