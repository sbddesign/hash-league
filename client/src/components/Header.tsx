import { FC } from 'react';

interface HeaderProps {
  globalHashrate: string;
  activePools: number;
}

export default function Header({ globalHashrate, activePools }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-black bg-opacity-70 backdrop-blur-sm border-b border-[#00f3ff] px-4 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          <span className="glow-text-blue">Hash</span><span className="glow-text-green">League</span>
        </h1>
        <span className="ml-3 bg-[#00f3ff] bg-opacity-20 text-[#00f3ff] text-xs px-2 py-1 rounded font-jetbrains">BETA</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-1 text-sm font-jetbrains">
          <div className="px-3 py-1.5 rounded bg-black bg-opacity-50 border border-[#00f3ff] text-[#00f3ff]">
            <i className="mr-2">⚡</i>Global Hashrate: <span className="font-bold">{globalHashrate}</span>
          </div>
          <div className="px-3 py-1.5 rounded bg-black bg-opacity-50 border border-[#ff00ea] text-[#ff00ea]">
            <i className="mr-2">👥</i>Active Pools: <span className="font-bold">{activePools}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
