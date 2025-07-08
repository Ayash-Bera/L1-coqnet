// frontend/src/hooks/useBlocks.ts
import type { Block, BlockStats, CollectorStatus, DatabaseStats } from '../services/api';
import { blockApi, collectorApi, databaseApi } from '../services/api';
import { useState, useEffect, useCallback } from 'react';

interface UseBlocksResult {
    // Data
    blocks: Block[];
    stats: BlockStats | null;
    collectorStatus: CollectorStatus | null;
    databaseStats: DatabaseStats | null;

    // Loading states
    loading: boolean;
    refreshing: boolean;

    // Error states
    error: string | null;

    // Actions
    refreshData: () => Promise<void>;
    triggerCollection: () => Promise<void>;
    startCollector: () => Promise<void>;
    stopCollector: () => Promise<void>;
    resetCollectorStats: () => Promise<void>;
    clearDatabase: () => Promise<void>;
    optimizeDatabase: () => Promise<void>;
    cleanupDatabase: (options: {
        keepLatest?: number;
        olderThanDays?: number;
        beforeBlockNumber?: number;
    }) => Promise<void>;
}

export const useBlocks = (limit: number = 50): UseBlocksResult => {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [stats, setStats] = useState<BlockStats | null>(null);
    const [collectorStatus, setCollectorStatus] = useState<CollectorStatus | null>(null);
    const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAllData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            // Fetch all data in parallel
            const [blocksData, statsData, collectorData, dbStatsData] = await Promise.all([
                blockApi.getBlocks(limit),
                blockApi.getStats(),
                collectorApi.getStatus(),
                databaseApi.getStats()
            ]);

            setBlocks(blocksData.blocks);
            setStats(statsData);
            setCollectorStatus(collectorData);
            setDatabaseStats(dbStatsData);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [limit]);

    const refreshData = useCallback(async () => {
        await fetchAllData(true);
    }, [fetchAllData]);

    const triggerCollection = useCallback(async () => {
        try {
            setError(null);
            await collectorApi.triggerCollection();
            // Refresh data after triggering collection
            setTimeout(() => refreshData(), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to trigger collection');
        }
    }, [refreshData]);

    const startCollector = useCallback(async () => {
        try {
            setError(null);
            await collectorApi.start();
            // Refresh collector status
            const newStatus = await collectorApi.getStatus();
            setCollectorStatus(newStatus);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start collector');
        }
    }, []);

    const stopCollector = useCallback(async () => {
        try {
            setError(null);
            await collectorApi.stop();
            // Refresh collector status
            const newStatus = await collectorApi.getStatus();
            setCollectorStatus(newStatus);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to stop collector');
        }
    }, []);

    const resetCollectorStats = useCallback(async () => {
        try {
            setError(null);
            await collectorApi.resetStats();
            // Refresh collector status
            const newStatus = await collectorApi.getStatus();
            setCollectorStatus(newStatus);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset stats');
        }
    }, []);

    const clearDatabase = useCallback(async () => {
        try {
            setError(null);
            await databaseApi.clearAll();
            // Refresh all data
            await refreshData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to clear database');
        }
    }, [refreshData]);

    const optimizeDatabase = useCallback(async () => {
        try {
            setError(null);
            await databaseApi.optimize();
            // Refresh database stats
            const newDbStats = await databaseApi.getStats();
            setDatabaseStats(newDbStats);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to optimize database');
        }
    }, []);

    const cleanupDatabase = useCallback(async (options: {
        keepLatest?: number;
        olderThanDays?: number;
        beforeBlockNumber?: number;
    }) => {
        try {
            setError(null);
            await databaseApi.cleanup(options);
            // Refresh all data
            await refreshData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cleanup database');
        }
    }, [refreshData]);

    // Initial data fetch
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (!refreshing) {
                refreshData();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [refreshData, refreshing]);

    return {
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
    };
};