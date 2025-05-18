import React, { ReactNode } from 'react';
import { COLORS } from '@/lib/constants';

interface BasePanelProps {
  children: ReactNode;
  title?: string;
  titleIcon?: ReactNode;
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  borderColor?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export default function BasePanel({
  children,
  title,
  titleIcon,
  isCollapsible = false,
  isCollapsed = false,
  onToggleCollapse,
  className = '',
  borderColor = COLORS.neonBlue,
  headerClassName = '',
  bodyClassName = ''
}: BasePanelProps) {
  const handleToggle = () => {
    if (isCollapsible && onToggleCollapse) {
      onToggleCollapse();
    }
  };

  return (
    <div
      className={`bg-black bg-opacity-80 backdrop-blur-sm rounded-lg border overflow-hidden ${className}`}
      style={{ borderColor }}
    >
      {title && (
        <div
          className={`flex items-center justify-between px-4 py-3 bg-black bg-opacity-40 ${isCollapsible ? 'cursor-pointer' : ''} ${headerClassName}`}
          onClick={handleToggle}
        >
          <div className="flex items-center">
            {titleIcon && <div className="mr-2">{titleIcon}</div>}
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          {isCollapsible && (
            <button
              className="text-white hover:text-[#00f3ff]"
              aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
            >
              {isCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </button>
          )}
        </div>
      )}
      
      {!isCollapsed && (
        <div className={`${bodyClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
}