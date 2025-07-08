// frontend/src/components/RefreshButton.tsx
import type { CollectorStatus } from '../services/api';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  onTriggerCollection: () => Promise<void>;
  onStartCollector: () => Promise<void>;
  onStopCollector: () => Promise<void>;
  refreshing: boolean;
  collectorStatus: CollectorStatus | null;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  onTriggerCollection,
  onStartCollector,
  onStopCollector,
  refreshing,
  collectorStatus,
}) => {
  const Button: React.FC<{
    onClick: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
    disabled?: boolean;
    size?: 'sm' | 'md';
  }> = ({ onClick, children, variant = 'primary', disabled = false, size = 'md' }) => {
    const baseClasses = "backdrop-blur-lg border rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
      primary: "bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/50",
      secondary: "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30",
      success: "bg-green-500/20 border-green-400/30 text-green-300 hover:bg-green-500/30 hover:border-green-400/50",
      danger: "bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30 hover:border-red-400/50",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2",
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6 shadow-xl">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        🎛️ Controls
        {collectorStatus && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${collectorStatus.isRunning
              ? 'bg-green-500/20 text-green-300 border border-green-400/30'
              : 'bg-red-500/20 text-red-300 border border-red-400/30'
            }`}>
            {collectorStatus.isRunning ? 'RUNNING' : 'STOPPED'}
          </span>
        )}
      </h3>

      <div className="space-y-4">
        {/* Data Controls */}
        <div>
          <h4 className="text-gray-300 text-sm font-medium mb-2">Data Controls</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onRefresh}
              disabled={refreshing}
              variant="primary"
            >
              {refreshing ? (
                <>
                  <span className="animate-spin mr-2">🔄</span>
                  Refreshing...
                </>
              ) : (
                <>
                  🔄 Refresh Data
                </>
              )}
            </Button>

            <Button
              onClick={onTriggerCollection}
              variant="secondary"
            >
              ⚡ Trigger Collection
            </Button>
          </div>
        </div>

        {/* Collector Controls */}
        <div>
          <h4 className="text-gray-300 text-sm font-medium mb-2">Collector Controls</h4>
          <div className="flex flex-wrap gap-2">
            {collectorStatus?.isRunning ? (
              <Button
                onClick={onStopCollector}
                variant="danger"
                size="sm"
              >
                ⏹️ Stop Collector
              </Button>
            ) : (
              <Button
                onClick={onStartCollector}
                variant="success"
                size="sm"
              >
                ▶️ Start Collector
              </Button>
            )}
          </div>
        </div>

        {/* Collector Stats */}
        {collectorStatus && (
          <div>
            <h4 className="text-gray-300 text-sm font-medium mb-2">Collector Stats</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400">Fetched:</span>
                <span className="text-white ml-1 font-medium">
                  {collectorStatus.collectorStats.totalFetched}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Stored:</span>
                <span className="text-green-300 ml-1 font-medium">
                  {collectorStatus.collectorStats.totalStored}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Duplicates:</span>
                <span className="text-yellow-300 ml-1 font-medium">
                  {collectorStatus.collectorStats.totalDuplicates}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Errors:</span>
                <span className="text-red-300 ml-1 font-medium">
                  {collectorStatus.collectorStats.totalErrors}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">Interval:</span>
                <span className="text-blue-300 ml-1 font-medium">
                  {collectorStatus.interval}s
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Auto-refresh indicator */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Auto-refresh every 30 seconds
          </div>
        </div>
      </div>
    </div >
  );
};

export default RefreshButton;