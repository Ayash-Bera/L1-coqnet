// src/routes/blocks.ts
import { Router, Request, Response } from 'express';
import { databaseService } from '../services/database';

const router = Router();

// GET /api/blocks?limit=N
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;

        // Validate limit
        if (limit <= 0 || limit > 1000) {
            res.status(400).json({
                error: 'Limit must be between 1 and 1000'
            });
            return;
        }

        const result = await databaseService.getBlocks(limit);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching blocks:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch blocks'
        });
    }
});

// GET /api/blocks/stats
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
    try {
        const stats = await databaseService.getBlockStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching block stats:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch block statistics'
        });
    }
});

// GET /api/blocks/latest - Get just the latest block number
router.get('/latest', async (req: Request, res: Response): Promise<void> => {
    try {
        const latestBlockNumber = await databaseService.getLatestBlockNumber();

        res.json({
            success: true,
            data: {
                latestBlockNumber
            }
        });
    } catch (error) {
        console.error('Error fetching latest block:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch latest block'
        });
    }
});

export default router;