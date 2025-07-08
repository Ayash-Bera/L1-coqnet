// src/routes/collector.ts
import { Router, Request, Response } from 'express';
import { cronService } from '../services/cronService';
import { blockCollectorService } from '../services/blockCollector';

const router = Router();

// GET /api/collector/status
router.get('/status', async (req: Request, res: Response): Promise<void> => {
    try {
        const status = cronService.getStatus();

        res.json({
            success: true,
            data: {
                isRunning: status.isRunning,
                interval: status.interval,
                collectorStats: status.stats,
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error fetching collector status:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch collector status'
        });
    }
});

// POST /api/collector/trigger - Manual trigger
router.post('/trigger', async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('🔧 Manual collection triggered via API');
        const success = await cronService.triggerManualCollection();

        res.json({
            success: true,
            data: {
                triggered: true,
                collectionSuccess: success,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error triggering manual collection:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to trigger manual collection'
        });
    }
});

// POST /api/collector/start
router.post('/start', async (req: Request, res: Response): Promise<void> => {
    try {
        await cronService.start();

        res.json({
            success: true,
            data: {
                message: 'Collector started successfully',
                status: cronService.getStatus(),
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error starting collector:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to start collector'
        });
    }
});

// POST /api/collector/stop
router.post('/stop', async (req: Request, res: Response): Promise<void> => {
    try {
        cronService.stop();

        res.json({
            success: true,
            data: {
                message: 'Collector stopped successfully',
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error stopping collector:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to stop collector'
        });
    }
});

// POST /api/collector/reset-stats
router.post('/reset-stats', async (req: Request, res: Response): Promise<void> => {
    try {
        blockCollectorService.resetStats();

        res.json({
            success: true,
            data: {
                message: 'Collector stats reset successfully',
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error resetting collector stats:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to reset collector stats'
        });
    }
});

export default router;