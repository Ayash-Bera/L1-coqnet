// src/services/cronService.ts
import * as cron from 'node-cron';
import { blockCollectorService } from './blockCollector';
import { coqnetService } from './coqnetService';

class CronService {
    private blockCollectionTask: cron.ScheduledTask | null = null;
    private isRunning: boolean = false;
    private interval: number;

    constructor() {
        // Get interval from environment or default to 30 seconds
        this.interval = parseInt(process.env.FETCH_INTERVAL_SECONDS || '30');
        console.log(`⏰ Block collection interval set to ${this.interval} seconds`);
    }

    async start(): Promise<void> {
        if (this.isRunning) {
            console.log('⚠️  Cron service is already running');
            return;
        }

        try {
            // First, check if the API is accessible
            console.log('🏥 Checking Coqnet API health...');
            const isHealthy = await coqnetService.checkApiHealth();

            if (!isHealthy) {
                console.warn('⚠️  Coqnet API health check failed, but starting collection anyway...');
            } else {
                console.log('✅ Coqnet API is healthy');
            }

            // Run an initial collection
            console.log('🚀 Running initial block collection...');
            await blockCollectorService.collectLatestBlock();

            // Set up the cron job
            // Cron expression for every N seconds: `*/${N} * * * * *`
            const cronExpression = `*/${this.interval} * * * * *`;

            this.blockCollectionTask = cron.schedule(cronExpression, async () => {
                await this.runBlockCollection();
            }, {
                scheduled: false // Don't start immediately
            });

            // Start the scheduled task
            this.blockCollectionTask.start();
            this.isRunning = true;

            console.log(`✅ Cron service started - collecting blocks every ${this.interval} seconds`);
            console.log(`📅 Next collection scheduled at: ${new Date(Date.now() + this.interval * 1000).toISOString()}`);

        } catch (error) {
            console.error('💥 Failed to start cron service:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }

    private async runBlockCollection(): Promise<void> {
        try {
            const success = await blockCollectorService.collectLatestBlock();

            if (success) {
                // Schedule next collection
                const nextRun = new Date(Date.now() + this.interval * 1000);
                console.log(`⏰ Next collection: ${nextRun.toLocaleTimeString()}`);
            }

        } catch (error) {
            console.error('💥 Error in scheduled block collection:', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    stop(): void {
        if (!this.isRunning) {
            console.log('⚠️  Cron service is not running');
            return;
        }

        if (this.blockCollectionTask) {
            this.blockCollectionTask.stop();
            // this.blockCollectionTask.destroy();
            this.blockCollectionTask = null;
        }

        this.isRunning = false;
        console.log('🛑 Cron service stopped');
    }

    getStatus(): { isRunning: boolean; interval: number; stats: any } {
        return {
            isRunning: this.isRunning,
            interval: this.interval,
            stats: blockCollectorService.getStats()
        };
    }

    async triggerManualCollection(): Promise<boolean> {
        console.log('🔧 Manual collection triggered via cron service');
        return await blockCollectorService.triggerCollection();
    }

    updateInterval(newInterval: number): void {
        if (newInterval < 5) {
            console.warn('⚠️  Minimum interval is 5 seconds');
            return;
        }

        this.interval = newInterval;

        if (this.isRunning) {
            console.log(`🔄 Restarting cron service with new interval: ${newInterval} seconds`);
            this.stop();
            this.start();
        } else {
            console.log(`⏰ Interval updated to ${newInterval} seconds (will apply when started)`);
        }
    }
}

export const cronService = new CronService();