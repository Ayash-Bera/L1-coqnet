// src/services/databaseManagement.ts
import { databaseService } from './database';

export interface CleanupOptions {
    keepLatest?: number; // Keep only the latest N blocks
    olderThanDays?: number; // Delete blocks older than N days
    beforeBlockNumber?: number; // Delete blocks before this block number
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

class DatabaseManagementService {

    async clearAllData(): Promise<{ deletedCount: number }> {
        try {
            console.log('🗑️  Clearing all block data...');

            // Get count before deletion
            const countResult = await (databaseService as any).dbGet('SELECT COUNT(*) as count FROM blocks');
            const totalCount = countResult.count;

            // Delete all blocks
            await (databaseService as any).dbRun('DELETE FROM blocks');

            // Reset auto-increment
            await (databaseService as any).dbRun('DELETE FROM sqlite_sequence WHERE name="blocks"');

            // Vacuum database to reclaim space
            await (databaseService as any).dbRun('VACUUM');

            console.log(`✅ Cleared ${totalCount} blocks from database`);

            return { deletedCount: totalCount };
        } catch (error) {
            console.error('Error clearing all data:', error);
            throw error;
        }
    }

    async cleanupOldData(options: CleanupOptions): Promise<{ deletedCount: number }> {
        try {
            let whereClause = '';
            let params: any[] = [];

            if (options.keepLatest) {
                // Keep only the latest N blocks
                const subquery = `
          SELECT blockNumber FROM blocks 
          ORDER BY blockNumber DESC 
          LIMIT ${options.keepLatest}
        `;
                whereClause = `blockNumber NOT IN (${subquery})`;
            } else if (options.olderThanDays) {
                // Delete blocks older than N days
                const cutoffTimestamp = Math.floor(Date.now() / 1000) - (options.olderThanDays * 24 * 60 * 60);
                whereClause = 'timestamp < ?';
                params = [cutoffTimestamp];
            } else if (options.beforeBlockNumber) {
                // Delete blocks before a specific block number
                whereClause = 'blockNumber < ?';
                params = [options.beforeBlockNumber];
            } else {
                throw new Error('At least one cleanup option must be specified');
            }

            // Get count before deletion
            const countQuery = `SELECT COUNT(*) as count FROM blocks WHERE ${whereClause}`;
            const countResult = await (databaseService as any).dbGet(countQuery, params);
            const deletedCount = countResult.count;

            if (deletedCount === 0) {
                console.log('🔍 No blocks found matching cleanup criteria');
                return { deletedCount: 0 };
            }

            // Perform deletion
            const deleteQuery = `DELETE FROM blocks WHERE ${whereClause}`;
            await (databaseService as any).dbRun(deleteQuery, params);

            // Vacuum database to reclaim space
            await (databaseService as any).dbRun('VACUUM');

            console.log(`🗑️  Cleaned up ${deletedCount} old blocks`);

            return { deletedCount };
        } catch (error) {
            console.error('Error cleaning up old data:', error);
            throw error;
        }
    }

    async getDatabaseStats(): Promise<DatabaseStats> {
        try {
            // Get basic counts and ranges
            const stats = await (databaseService as any).dbGet(`
        SELECT 
          COUNT(*) as totalBlocks,
          MIN(blockNumber) as oldestBlock,
          MAX(blockNumber) as newestBlock,
          MIN(timestamp) as oldestTimestamp,
          MAX(timestamp) as newestTimestamp
        FROM blocks
      `);

            // Calculate average blocks per day
            let avgBlocksPerDay = 0;
            if (stats.totalBlocks > 0 && stats.oldestTimestamp && stats.newestTimestamp) {
                const daysDiff = (stats.newestTimestamp - stats.oldestTimestamp) / (24 * 60 * 60);
                avgBlocksPerDay = daysDiff > 0 ? stats.totalBlocks / daysDiff : 0;
            }

            // Get database file size (approximate)
            let databaseSizeKB = 0;
            try {
                const pageSizeResult = await (databaseService as any).dbGet('PRAGMA page_size');
                const pageCountResult = await (databaseService as any).dbGet('PRAGMA page_count');

                if (pageSizeResult && pageCountResult) {
                    databaseSizeKB = Math.round((pageSizeResult.page_size * pageCountResult.page_count) / 1024);
                }
            } catch (error) {
                console.warn('Could not calculate database size:', error);
            }

            return {
                totalBlocks: stats.totalBlocks || 0,
                oldestBlock: stats.oldestBlock,
                newestBlock: stats.newestBlock,
                oldestTimestamp: stats.oldestTimestamp,
                newestTimestamp: stats.newestTimestamp,
                databaseSizeKB,
                avgBlocksPerDay: Math.round(avgBlocksPerDay * 100) / 100
            };
        } catch (error) {
            console.error('Error getting database stats:', error);
            throw error;
        }
    }

    async optimizeDatabase(): Promise<void> {
        try {
            console.log('🔧 Optimizing database...');

            // Analyze tables for better query planning
            await (databaseService as any).dbRun('ANALYZE');

            // Vacuum to reclaim space and defragment
            await (databaseService as any).dbRun('VACUUM');

            // Reindex for better performance
            await (databaseService as any).dbRun('REINDEX');

            console.log('✅ Database optimization complete');
        } catch (error) {
            console.error('Error optimizing database:', error);
            throw error;
        }
    }

    async exportData(limit?: number): Promise<any[]> {
        try {
            console.log(`📤 Exporting ${limit ? `latest ${limit}` : 'all'} blocks...`);

            const sql = limit
                ? 'SELECT * FROM blocks ORDER BY blockNumber DESC LIMIT ?'
                : 'SELECT * FROM blocks ORDER BY blockNumber DESC';

            const params = limit ? [limit] : [];
            const blocks = await (databaseService as any).dbAll(sql, params);

            console.log(`✅ Exported ${blocks.length} blocks`);
            return blocks;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }

    // Automatic cleanup based on configuration
    async autoCleanup(): Promise<{ deletedCount: number } | null> {
        try {
            const maxBlocks = parseInt(process.env.MAX_STORED_BLOCKS || '10000');
            const maxDays = parseInt(process.env.MAX_STORAGE_DAYS || '30');

            const stats = await this.getDatabaseStats();

            // Check if we need cleanup
            if (stats.totalBlocks > maxBlocks) {
                console.log(`🔍 Auto-cleanup triggered: ${stats.totalBlocks} blocks > ${maxBlocks} limit`);
                return await this.cleanupOldData({ keepLatest: maxBlocks });
            }

            if (maxDays > 0 && stats.oldestTimestamp) {
                const cutoffTimestamp = Math.floor(Date.now() / 1000) - (maxDays * 24 * 60 * 60);
                if (stats.oldestTimestamp < cutoffTimestamp) {
                    console.log(`🔍 Auto-cleanup triggered: data older than ${maxDays} days found`);
                    return await this.cleanupOldData({ olderThanDays: maxDays });
                }
            }

            return null; // No cleanup needed
        } catch (error) {
            console.error('Error in auto cleanup:', error);
            return null;
        }
    }
}

export const databaseManagementService = new DatabaseManagementService();