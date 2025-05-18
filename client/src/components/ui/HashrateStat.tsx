import React from 'react';
import { COLORS } from '@/lib/constants';

interface HashrateStatProps {
  label: string;
  value: string | number;
  borderColor?: string;
  className?: string;
}

export default function HashrateStat({ 
  label, 
  value, 
  borderColor = COLORS.neonBlue,
  className = ''
}: HashrateStatProps) {
  return (
    <div className={`bg-black bg-opacity-50 p-3 rounded-lg border ${className}`} 
         style={{ borderColor }}>
      <div className="text-xs text-gray-400 mb-1 font-jetbrains">{label}</div>
      <div className="text-lg font-bold font-jetbrains" style={{ color: borderColor }}>
        {value}
      </div>
    </div>
  );
}