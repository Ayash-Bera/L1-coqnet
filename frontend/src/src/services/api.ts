// frontend/src/services/api.ts
import axios from 'axios';
import type { AxiosResponse } from 'axios';

// Types
export interface Block {
    id?: number;
    blockNumber: number;
    timestamp: number;
    transactionCount: number;
    gasUsed: number;
    createdAt?: string;
}

export interface BlockStats {
    averageBlockTime: number;
    totalTransactionsLast100: number;
    averageGasUsed: number;
    latestBlockTimestamp: number;
    latestBlockNumber: number;
}

export interface BlocksResponse {
    blocks: Block[];
    total: number;
}

export interface CollectorStats {
    totalFetched: number;
    totalStored: number;
    totalDuplicates: number;
    totalErrors: number;
    lastFetchTime: string | null;
    lastSuccessTime: string | null;
    lastBlockNumber: number | null;
}

export interface CollectorStatus {
    isRunning: boolean;
    interval: number;
    collectorStats: CollectorStats;
    uptime: number;
    timestamp: string;
}

export interface DatabaseStats {
    totalBlocks: number;
    oldestBlock: number | null;
    newestBlock: number | null;
    oldestTimestamp: number | null;
    newestTimestamp: number | null;
    databaseSizeKB: number;
    avgBlocksPerDay: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export interface ApiError {
    error: string;
    message: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
    }
);

export const blockApi = {
    // Get blocks with pagination
    getBlocks: async (limit: number = 50): Promise<BlocksResponse> => {
        const response: AxiosResponse<ApiResponse<BlocksResponse>> = await apiClient.get(
            `/api/blocks?limit=${limit}`
        );
        return response.data.data;
    },

    // Get block statistics
    getStats: async (): Promise<BlockStats> => {
        const response: AxiosResponse<ApiResponse<BlockStats>> = await apiClient.get(
            '/api/blocks/stats'
        );
        return response.data.data;
    },

    // Get latest block number
    getLatestBlockNumber: async (): Promise<number> => {
        const response: AxiosResponse<ApiResponse<{ latestBlockNumber: number }>> =
            await apiClient.get('/api/blocks/latest');
        return response.data.data.latestBlockNumber;
    },
};

export const collectorApi = {
    // Get collector status
    getStatus: async (): Promise<CollectorStatus> => {
        const response: AxiosResponse<ApiResponse<CollectorStatus>> = await apiClient.get(
            '/api/collector/status'
        );
        return response.data.data;
    },

    // Trigger manual collection
    triggerCollection: async (): Promise<boolean> => {
        const response: AxiosResponse<ApiResponse<{ triggered: boolean; collectionSuccess: boolean }>> =
            await apiClient.post('/api/collector/trigger');
        return response.data.data.collectionSuccess;
    },

    // Start collector
    start: async (): Promise<void> => {
        await apiClient.post('/api/collector/start');
    },

    // Stop collector
    stop: async (): Promise<void> => {
        await apiClient.post('/api/collector/stop');
    },

    // Reset stats
    resetStats: async (): Promise<void> => {
        await apiClient.post('/api/collector/reset-stats');
    },
};

export const databaseApi = {
    // Get database statistics
    getStats: async (): Promise<DatabaseStats> => {
        const response: AxiosResponse<ApiResponse<DatabaseStats>> = await apiClient.get(
            '/api/database/stats'
        );
        return response.data.data;
    },

    // Clear all data
    clearAll: async (): Promise<{ deletedCount: number }> => {
        const response: AxiosResponse<ApiResponse<{ deletedCount: number }>> =
            await apiClient.delete('/api/database/clear');
        return response.data.data;
    },

    // Cleanup old data
    cleanup: async (options: {
        keepLatest?: number;
        olderThanDays?: number;
        beforeBlockNumber?: number;
    }): Promise<{ deletedCount: number }> => {
        const response: AxiosResponse<ApiResponse<{ deletedCount: number }>> =
            await apiClient.post('/api/database/cleanup', options);
        return response.data.data;
    },

    // Optimize database
    optimize: async (): Promise<void> => {
        await apiClient.post('/api/database/optimize');
    },

    // Auto cleanup
    autoCleanup: async (): Promise<{ deletedCount: number }> => {
        const response: AxiosResponse<ApiResponse<{ deletedCount: number }>> =
            await apiClient.post('/api/database/auto-cleanup');
        return response.data.data;
    },

    // Export data
    exportData: async (limit?: number): Promise<Block[]> => {
        const url = limit ? `/api/database/export?limit=${limit}` : '/api/database/export';
        const response: AxiosResponse<ApiResponse<{ blocks: Block[] }>> =
            await apiClient.get(url);
        return response.data.data.blocks;
    },
};

export const healthApi = {
    // Check server health
    checkHealth: async (): Promise<{ message: string; timestamp: string }> => {
        const response = await apiClient.get('/');
        return response.data;
    },
};