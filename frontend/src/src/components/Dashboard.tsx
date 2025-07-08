// frontend/src/components/Dashboard.tsx
import { useState } from 'react';
import { useBlocks } from '../hooks/useBlocks';
import StatsCards from './StatsCards';
import BlocksTable from './BlocksTable';
import BlockChart from './BlockChart';
import RefreshButton from './RefreshButton';

const Dashboard: React.FC = () => {
    const {
        blocks,
        stats,
        collectorStatus,
        databaseStats,
        loading,
        refreshing,
        error,
        refreshData,
        triggerCollection,
        startCollector,
        stopCollector,
        resetCollectorStats,
        clearDatabase,
        optimizeDatabase,
        cleanupDatabase,
    } = useBlocks(50);

    const [showDatabaseControls, setShowDatabaseControls] = useState(false);
    const [cleanupOptions, setCleanupOptions] = useState({
        keepLatest: '',
        olderThanDays: '',
        beforeBlockNumber: '',
    });

    const handleClearDatabase = async () => {
        if (window.confirm('Are you sure you want to clear ALL blocks from the database? This cannot be undone!')) {
            await clearDatabase();
        }
    };

    const handleCleanupDatabase = async () => {
        const options: any = {};
        if (cleanupOptions.keepLatest) options.keepLatest = parseInt(cleanupOptions.keepLatest);
        if (cleanupOptions.olderThanDays) options.olderThanDays = parseInt(cleanupOptions.olderThanDays);
        if (cleanupOptions.beforeBlockNumber) options.beforeBlockNumber = parseInt(cleanupOptions.beforeBlockNumber);

        if (Object.keys(options).length === 0) {
            alert('Please specify at least one cleanup option.');
            return;
        }

        if (window.confirm('Are you sure you want to cleanup the database with these options?')) {
            await cleanupDatabase(options);
            setCleanupOptions({ keepLatest: '', olderThanDays: '', beforeBlockNumber: '' });
        }
    };

    const Button: React.FC<{
        onClick: () => void;
        children: React.ReactNode;
        variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
        disabled?: boolean;
        size?: 'sm' | 'md';
    }> = ({ onClick, children, variant = 'primary', disabled = false, size = 'md' }) => {
        const baseClasses = "backdrop-blur-lg border rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

        const variantClasses = {
            primary: "bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/50",
            secondary: "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30",
            success: "bg-green-500/20 border-green-400/30 text-green-300 hover:bg-green-500/30 hover:border-green-400/50",
            danger: "bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30 hover:border-red-400/50",
            warning: "bg-yellow-500/20 border-yellow-400/30 text-yellow-300 hover:bg-yellow-500/30 hover:border-yellow-400/50",
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
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                        🚀 Coqnet Explorer
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Real-time blockchain monitoring and analytics dashboard
                    </p>
                    {error && (
                        <div className="mt-4 backdrop-blur-lg bg-red-500/20 border border-red-400/30 rounded-lg p-3 text-red-300">
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <StatsCards stats={stats} databaseStats={databaseStats} loading={loading} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Controls */}
                    <div className="lg:col-span-1">
                        <RefreshButton
                            onRefresh={refreshData}
                            onTriggerCollection={triggerCollection}
                            onStartCollector={startCollector}
                            onStopCollector={stopCollector}
                            refreshing={refreshing}
                            collectorStatus={collectorStatus}
                        />
                    </div>

                    {/* Chart */}
                    <div className="lg:col-span-2">
                        <BlockChart blocks={blocks} loading={loading} />
                    </div>
                </div>

                {/* Database Management Section */}
                <div className="mb-8">
                    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                🗄️ Database Management
                            </h3>
                            <Button
                                onClick={() => setShowDatabaseControls(!showDatabaseControls)}
                                variant="secondary"
                                size="sm"
                            >
                                {showDatabaseControls ? 'Hide Controls' : 'Show Controls'}
                            </Button>
                        </div>

                        {showDatabaseControls && (
                            <div className="space-y-4">
                                {/* Quick Actions */}
                                <div>
                                    <h4 className="text-gray-300 text-sm font-medium mb-2">Quick Actions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            onClick={optimizeDatabase}
                                            variant="success"
                                            size="sm"
                                        >
                                            🔧 Optimize Database
                                        </Button>
                                        <Button
                                            onClick={resetCollectorStats}
                                            variant="warning"
                                            size="sm"
                                        >
                                            📊 Reset Stats
                                        </Button>
                                        <Button
                                            onClick={handleClearDatabase}
                                            variant="danger"
                                            size="sm"
                                        >
                                            🗑️ Clear All Data
                                        </Button>
                                    </div>
                                </div>

                                {/* Cleanup Options */}
                                <div>
                                    <h4 className="text-gray-300 text-sm font-medium mb-2">Smart Cleanup</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Keep Latest N Blocks</label>
                                            <input
                                                type="number"
                                                placeholder="e.g., 1000"
                                                value={cleanupOptions.keepLatest}
                                                onChange={(e) => setCleanupOptions(prev => ({ ...prev, keepLatest: e.target.value }))}
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-400/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Older Than N Days</label>
                                            <input
                                                type="number"
                                                placeholder="e.g., 7"
                                                value={cleanupOptions.olderThanDays}
                                                onChange={(e) => setCleanupOptions(prev => ({ ...prev, olderThanDays: e.target.value }))}
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-400/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Before Block Number</label>
                                            <input
                                                type="number"
                                                placeholder="e.g., 2445000"
                                                value={cleanupOptions.beforeBlockNumber}
                                                onChange={(e) => setCleanupOptions(prev => ({ ...prev, beforeBlockNumber: e.target.value }))}
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-400/50"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleCleanupDatabase}
                                        variant="warning"
                                        size="sm"
                                    >
                                        🧹 Cleanup Database
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Blocks Table */}
                <BlocksTable blocks={blocks} loading={loading} />

                {/* Footer */}
                <div className="mt-8 text-center text-gray-400 text-sm">
                    <p>Built with React + TypeScript + Tailwind CSS</p>
                    <p className="mt-1">
                        Last updated: {new Date().toLocaleString()} •
                        Auto-refresh enabled
                    </p>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;