// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import blocksRouter from './routes/blocks';
import collectorRouter from './routes/collector';
import databaseRouter from './routes/database';
import { cronService } from './services/cronService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Coqnet Explorer API is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API routes
app.use('/api/blocks', blocksRouter);
app.use('/api/collector', collectorRouter);
app.use('/api/database', databaseRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong'
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Coqnet Explorer API server running on port ${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`🔍 Health check: http://localhost:${PORT}/`);

    // Start the block collection service
    try {
        console.log('🔄 Starting block collection service...');
        await cronService.start();
        console.log('✅ Block collection service started successfully');
    } catch (error) {
        console.error('❌ Failed to start block collection service:', error);
        console.log('⚠️  Server will continue running, but blocks won\'t be collected automatically');
        console.log('💡 You can manually start the collector via POST /api/collector/start');
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
    cronService.stop();
    console.log('✅ Cron service stopped');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
    cronService.stop();
    console.log('✅ Cron service stopped');
    process.exit(0);
});