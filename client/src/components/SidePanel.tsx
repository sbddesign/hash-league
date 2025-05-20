import { useState } from "react";
import { X, Globe, Twitter, Zap, MapPin, Server } from "lucide-react";
import { MiningPool } from "@shared/schema";
import { COLORS } from "@/lib/constants";
import StatusIndicator from "@/components/ui/StatusIndicator";
import HashrateStat from "@/components/ui/HashrateStat";
import SimpleBarChart from "@/components/ui/SimpleBarChart";
import FaqContent from "@/components/FaqContent";

interface SidePanelProps {
  isOpen: boolean;
  pool: MiningPool | null;
  onClose: () => void;
  showFaq?: boolean;
}

export default function SidePanel({
  isOpen,
  pool,
  onClose,
  showFaq = false,
}: SidePanelProps) {
  const [isLiveDataFetching, setIsLiveDataFetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full md:w-96 bg-black bg-opacity-90 backdrop-blur-md z-40 border-l border-[#00f3ff] shadow-[0_0_10px_#00f3ff] transform transition-transform overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="relative p-6 pt-16">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-[#ff00ea] transition-colors z-50"
          aria-label="Close panel"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mt-2">
          {showFaq ? (
            <FaqContent />
          ) : !pool ? (
            <div className="text-center py-12">
              <div className="text-[#ff00ea] text-5xl mb-4">
                <MapPin className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Pool Selected</h3>
              <p className="text-gray-400 mb-4">
                Click on a marker on the map to view details about a mining
                pool.
              </p>
            </div>
          ) : (
            <div>
              {/* Pool Header */}
              <div className="flex items-center mb-6">
                {/* Avatar */}
                <img
                  src={pool.avatar}
                  alt={`${pool.name} Avatar`}
                  className="w-16 h-16 rounded-full border-2 border-[#ff00ea]"
                  style={{ boxShadow: "0 0 5px #ff00ea" }}
                />

                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-white">{pool.name}</h2>
                  <div className="flex items-center text-sm text-gray-300 mt-1">
                    <MapPin className="h-4 w-4 text-[#ff00ea] mr-1" />
                    <span>
                      {pool.city}, {pool.country}
                    </span>
                  </div>

                  {/* API Status Indicator */}
                  {pool.poolApiUrl && (
                    <div className="mt-1">
                      <StatusIndicator
                        pool={pool}
                        showTimestamp={true}
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Pool Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <HashrateStat
                  label="HASHRATE"
                  value={pool.hashrate || "N/A"}
                  borderColor={COLORS.neonBlue}
                />
                <HashrateStat
                  label="RANK"
                  value={pool.rank ? `#${pool.rank}` : "N/A"}
                  borderColor={COLORS.neonBlue}
                />
                <HashrateStat
                  label="WORKERS"
                  value={pool.workers || "N/A"}
                  borderColor={COLORS.neonBlue}
                />
              </div>

              {/* Network Stats (if available) */}
              {(pool.networkHashrate || pool.difficulty) && (
                <div className="mb-6">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2 font-jetbrains">
                    Network
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {pool.networkHashrate && (
                      <HashrateStat
                        label="NETWORK HASHRATE"
                        value={pool.networkHashrate}
                        borderColor={COLORS.neonGreen}
                      />
                    )}
                    {pool.difficulty && (
                      <HashrateStat
                        label="DIFFICULTY"
                        value={
                          typeof pool.difficulty === "string" &&
                          !isNaN(parseFloat(pool.difficulty))
                            ? parseFloat(pool.difficulty).toExponential(2)
                            : "N/A"
                        }
                        borderColor={COLORS.neonGreen}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2 font-jetbrains">
                  About
                </h3>
                <p className="text-gray-200 leading-relaxed">
                  {pool.description}
                </p>
              </div>

              {/* Links */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2 font-jetbrains">
                  Links
                </h3>
                <div className="flex flex-wrap gap-2">
                  {pool.website && (
                    <a
                      href={pool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-black bg-opacity-50 rounded-lg border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:bg-opacity-10 transition-colors"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      <span>Website</span>
                    </a>
                  )}

                  {pool.twitter && (
                    <a
                      href={pool.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-black bg-opacity-50 rounded-lg border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:bg-opacity-10 transition-colors"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      <span>Twitter</span>
                    </a>
                  )}

                  {pool.nostr && (
                    <a
                      href={pool.nostr}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-black bg-opacity-50 rounded-lg border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:bg-opacity-10 transition-colors"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      <span>Nostr</span>
                    </a>
                  )}

                  {pool.poolApiUrl && (
                    <a
                      href={`${pool.poolApiUrl}/api/info`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-black bg-opacity-50 rounded-lg border border-[#ff00ea] text-[#ff00ea] hover:bg-[#ff00ea] hover:bg-opacity-10 transition-colors"
                    >
                      <Server className="h-4 w-4 mr-2" />
                      <span>Mining Pool API</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Historical Data */}
              {pool.hashHistory && (
                <div>
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2 font-jetbrains">
                    Hashrate History
                  </h3>
                  <SimpleBarChart
                    data={pool.hashHistory}
                    barColor={COLORS.neonBlue}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
