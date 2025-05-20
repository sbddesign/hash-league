import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseBlockHeightResult {
  currentBlockHeight: number | null;
  isLoading: boolean;
  error: Error | null;
}

export function useBlockHeight(): UseBlockHeightResult {
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const previousHeightRef = useRef<number | null>(null);
  const { toast } = useToast();
  
  // Audio setup for block notification
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/sounds/laser.mp3');
    audioRef.current.volume = 0.3;
    
    // Function to fetch the current block height
    const fetchBlockHeight = async () => {
      try {
        const response = await fetch('https://mempool.space/api/blocks/tip/height');
        if (!response.ok) {
          throw new Error(`Failed to fetch block height: ${response.status}`);
        }
        
        const blockHeight = await response.text();
        const newHeight = parseInt(blockHeight, 10);
        
        if (!isNaN(newHeight)) {
          // Check if this is a new block
          if (previousHeightRef.current !== null && newHeight > previousHeightRef.current) {
            // Show toast notification for new block
            toast({
              title: "New Block Mined!",
              description: `#${newHeight}`,
              variant: "default",
              duration: 5000,
            });
            
            // Play sound effect
            if (audioRef.current) {
              audioRef.current.play().catch(e => {
                console.error("Error playing sound:", e);
              });
            }
          }
          
          // Update state and ref
          setCurrentBlockHeight(newHeight);
          previousHeightRef.current = newHeight;
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching block height:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    };
    
    // Initial fetch
    fetchBlockHeight();
    
    // Set up polling interval
    const intervalId = setInterval(fetchBlockHeight, 10000); // Poll every 10 seconds
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [toast]);
  
  return { currentBlockHeight, isLoading, error };
}