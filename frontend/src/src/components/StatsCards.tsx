// frontend/src/components/StatsCards.tsx
import type { BlockStats, DatabaseStats } from '../services/api';

interface StatsCardsProps {
    stats: BlockStats | null;
    databaseStats: DatabaseStats | null;
    loading: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, databaseStats, loading }) => {
    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const formatTime = (timestamp: number): string => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const formatFileSize = (sizeKB: number): string => {
        if (sizeKB >= 1024) {
            return (sizeKB / 1024).toFixed(1) + ' MB';
        }
        return sizeKB.toFixed(0) + ' KB';
    };

    const StatCard: React.FC<{
        title: string;
        value: string | number;
        subtitle?: string;
        icon: string;
        loading?: boolean;
    }> = ({ title, value, subtitle, icon, loading: cardLoading = false }) => (
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6 shadow-xl hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-300 text-sm font-medium">{title}</p>
                    {cardLoading || loading ? (
                        <div className="h-8 w-20 bg-white/20 rounded animate-pulse mt-1"></div>
                    ) : (
                        <p className="text-white text-2xl font-bold mt-1">{value}</p>
                    )}
                    {subtitle && (
                        <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
                    )}
                </div>
                <div className="text-3xl">{icon}</div>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
                title="Latest Block"
                value={stats?.latestBlockNumber ? `#${formatNumber(stats.latestBlockNumber)}` : 'N/A'}
                subtitle={stats?.latestBlockTimestamp ? formatTime(stats.latestBlockTimestamp) : undefined}
                icon="📦"
                loading={loading}
            />

            <StatCard
                title="Avg Block Time"
                value={stats?.averageBlockTime ? `${stats.averageBlockTime}s` : 'N/A'}
                subtitle="Between blocks"
                icon="⏱️"
                loading={loading}
            />

            <StatCard
                title="Total Transactions"
                value={stats?.totalTransactionsLast100 ? formatNumber(stats.totalTransactionsLast100) : 'N/A'}
                subtitle="Last 100 blocks"
                icon="🔄"
                loading={loading}
            />

            <StatCard
                title="Avg Gas Used"
                value={stats?.averageGasUsed ? formatNumber(stats.averageGasUsed) : 'N/A'}
                subtitle="Per block"
                icon="⛽"
                loading={loading}
            />

            <StatCard
                title="Total Blocks Stored"
                value={databaseStats?.totalBlocks ? formatNumber(databaseStats.totalBlocks) : 'N/A'}
                subtitle="In database"
                icon="💾"
                loading={loading}
            />

            <StatCard
                title="Database Size"
                value={databaseStats?.databaseSizeKB ? formatFileSize(databaseStats.databaseSizeKB) : 'N/A'}
                subtitle="Storage used"
                icon="📊"
                loading={loading}
            />

            <StatCard
                title="Blocks Per Day"
                value={databaseStats?.avgBlocksPerDay ? formatNumber(Math.round(databaseStats.avgBlocksPerDay)) : 'N/A'}
                subtitle="Average rate"
                icon="📈"
                loading={loading}
            />

            <StatCard
                title="Block Range"
                value={databaseStats?.newestBlock && databaseStats?.oldestBlock
                    ? `${formatNumber(databaseStats.newestBlock - databaseStats.oldestBlock)}`
                    : 'N/A'}
                subtitle="Range stored"
                icon="📏"
                loading={loading}
            />
        </div>
    );
};

export default StatsCards;