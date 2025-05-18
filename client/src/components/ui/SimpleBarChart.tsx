import React from 'react';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { calculateTrend } from '@/lib/utils';

interface SimpleBarChartProps {
  data: number[] | undefined;
  labels?: string[];
  barColor?: string;
  trendLabel?: boolean;
}

export default function SimpleBarChart({ 
  data = [], 
  labels = DAYS_OF_WEEK,
  barColor = '#00f3ff',
  trendLabel = true
}: SimpleBarChartProps) {
  const trend = calculateTrend(data);
  
  return (
    <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-[#00f3ff]">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs text-gray-400">Last {labels.length} Days</div>
        {trendLabel && (
          <div className={`text-xs ${trend.color}`}>
            {trend.text}
          </div>
        )}
      </div>
      
      {/* Chart bars */}
      <div className="h-24 flex items-end justify-between">
        {(data && data.length > 0) ? (
          // If we have data, show the bars
          data.map((value, index) => {
            // Find the maximum value for scaling
            const maxValue = Math.max(...data || [1]);
            // Calculate height as percentage
            const height = `${(value / maxValue) * 100}%`;
            
            return (
              <div 
                key={index} 
                className="w-[12%] bg-opacity-40 hover:bg-opacity-60 transition-all rounded-t" 
                style={{ height, backgroundColor: barColor }}
              ></div>
            );
          })
        ) : (
          // If no data, show empty placeholder bars
          Array(labels.length).fill(0).map((_, index) => (
            <div 
              key={index} 
              className="w-[12%] bg-gray-800 bg-opacity-40 rounded-t"
              style={{ height: '10%' }}
            ></div>
          ))
        )}
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500 font-jetbrains">
        {labels.map((day, index) => (
          <div key={index}>{day}</div>
        ))}
      </div>
    </div>
  );
}