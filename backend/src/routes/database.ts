// src/routes/database.ts
import { Router, Request, Response } from 'express';
import { databaseManagementService } from '../services/databaseManagement';

const router = Router();

// GET /api/database/stats
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
    try {
        const stats = await databaseManagementService.getDatabaseStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching database stats:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch database statistics'
        });
    }
});

// DELETE /api/database/clear
router.delete('/clear', async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await databaseManagementService.clearAllData();

        res.json({
            success: true,
            data: {
                message: 'All data cleared successfully',
                deletedCount: result.deletedCount,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error clearing database:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to clear database'
        });
    }
});

// POST /api/database/cleanup
router.post('/cleanup', async (req: Request, res: Response): Promise<void> => {
    try {
        const { keepLatest, olderThanDays, beforeBlockNumber } = req.body;

        // Validate at least one option is provided
        if (!keepLatest && !olderThanDays && !beforeBlockNumber) {
            res.status(400).json({
                error: 'Bad request',
                message: 'At least one cleanup option must be specified: keepLatest, olderThanDays, or beforeBlockNumber'
            });
            return;
        }

        const result = await databaseManagementService.cleanupOldData({
            keepLatest: keepLatest ? parseInt(keepLatest) : undefined,
            olderThanDays: olderThanDays ? parseInt(olderThanDays) : undefined,
            beforeBlockNumber: beforeBlockNumber ? parseInt(beforeBlockNumber) : undefined
        });

        res.json({
            success: true,
            data: {
                message: 'Cleanup completed successfully',
                deletedCount: result.deletedCount,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error cleaning up database:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to cleanup database'
        });
    }
});

// POST /api/database/optimize
router.post('/optimize', async (req: Request, res: Response): Promise<void> => {
    try {
        await databaseManagementService.optimizeDatabase();

        res.json({
            success: true,
            data: {
                message: 'Database optimization completed successfully',
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error optimizing database:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to optimize database'
        });
    }
});

// GET /api/database/export?limit=N
router.get('/export', async (req: Request, res: Response): Promise<void> => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

        if (limit && (limit <= 0 || limit > 10000)) {
            res.status(400).json({
                error: 'Bad request',
                message: 'Limit must be between 1 and 10000'
            });
            return;
        }

        const blocks = await databaseManagementService.exportData(limit);

        res.json({
            success: true,
            data: {
                blocks,
                count: blocks.length,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to export data'
        });
    }
});

// POST /api/database/auto-cleanup
router.post('/auto-cleanup', async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await databaseManagementService.autoCleanup();

        if (result) {
            res.json({
                success: true,
                data: {
                    message: 'Auto-cleanup completed',
                    deletedCount: result.deletedCount,
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            res.json({
                success: true,
                data: {
                    message: 'No cleanup needed',
                    deletedCount: 0,
                    timestamp: new Date().toISOString()
                }
            });
        }
    } catch (error) {
        console.error('Error in auto cleanup:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to perform auto cleanup'
        });
    }
});

export default router;