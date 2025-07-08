// src/services/blockCollector.ts
import { coqnetService, CoqnetBlock } from './coqnetService';
import { databaseService, Block } from './database';

interface CollectorStats {
    totalFetched: number;
    totalStored: number;
    totalDuplicates: number;
    totalErrors: number;
    lastFetchTime: Date | null;
    lastSuccessTime: Date | null;
    lastBlockNumber: number | null;
}

class BlockCollectorService {
    private stats: CollectorStats = {
        totalFetched: 0,
        totalStored: 0,
        totalDuplicates: 0,
        totalErrors: 0,
        lastFetchTime: null,
        lastSuccessTime: null,
        lastBlockNumber: null
    };

    async collectLatestBlock(): Promise<boolean> {
        this.stats.lastFetchTime = new Date();

        try {
            console.log('🔄 Starting block collection...');

            // Fetch latest block from Coqnet API
            const coqnetBlock = await coqnetService.fetchLatestBlock();

            if (!coqnetBlock) {
                console.error('❌ Failed to fetch block from Coqnet API');
                this.stats.totalErrors++;
                return false;
            }

            this.stats.totalFetched++;

            // Convert to our Block format
            const block = this.convertToBlock(coqnetBlock);

            console.log(`📦 Processing block #${block.blockNumber} (timestamp: ${block.timestamp}, txs: ${block.transactionCount})`);

            // Check if we already have this block
            const existingLatestBlock = await databaseService.getLatestBlockNumber();

            if (block.blockNumber <= existingLatestBlock) {
                console.log(`⏭️  Block #${block.blockNumber} already exists or is older than latest #${existingLatestBlock}`);
                this.stats.totalDuplicates++;
                return true; // Not an error, just a duplicate
            }

            // Store the block
            const insertedId = await databaseService.insertBlock(block);

            if (insertedId > 0) {
                console.log(`✅ Successfully stored block #${block.blockNumber} (ID: ${insertedId})`);
                this.stats.totalStored++;
                this.stats.lastSuccessTime = new Date();
                this.stats.lastBlockNumber = block.blockNumber;

                // Log some stats periodically
                if (this.stats.totalStored % 10 === 0) {
                    this.logStats();
                }

                return true;
            } else if (insertedId === 0) {
                // Block already exists (duplicate)
                console.log(`⏭️  Block #${block.blockNumber} already exists in database`);
                this.stats.totalDuplicates++;
                return true; // Not an error, just a duplicate
            } else {
                console.error(`❌ Failed to store block #${block.blockNumber}`);
                this.stats.totalErrors++;
                return false;
            }

        } catch (error) {
            console.error('💥 Error in block collection:', error instanceof Error ? error.message : 'Unknown error');
            this.stats.totalErrors++;
            return false;
        }
    }

    private convertToBlock(coqnetBlock: CoqnetBlock): Block {
        // Parse block number (remove hex prefix if present)
        let blockNumber: number;
        if (coqnetBlock.number.startsWith('0x')) {
            blockNumber = parseInt(coqnetBlock.number, 16);
        } else {
            blockNumber = parseInt(coqnetBlock.number);
        }

        // Parse timestamp (handle hex or decimal)
        let timestamp: number;
        if (coqnetBlock.timestamp.startsWith('0x')) {
            timestamp = parseInt(coqnetBlock.timestamp, 16);
        } else {
            timestamp = parseInt(coqnetBlock.timestamp);
        }

        // Parse gas used (handle hex or decimal)
        let gasUsed: number;
        if (coqnetBlock.gasUsed.startsWith('0x')) {
            gasUsed = parseInt(coqnetBlock.gasUsed, 16);
        } else {
            gasUsed = parseInt(coqnetBlock.gasUsed);
        }

        return {
            blockNumber,
            timestamp,
            transactionCount: coqnetBlock.transactionCount,
            gasUsed
        };
    }

    getStats(): CollectorStats {
        return { ...this.stats };
    }

    private logStats(): void {
        console.log('📊 Collection Stats:', {
            totalFetched: this.stats.totalFetched,
            totalStored: this.stats.totalStored,
            totalDuplicates: this.stats.totalDuplicates,
            totalErrors: this.stats.totalErrors,
            successRate: `${((this.stats.totalStored / this.stats.totalFetched) * 100).toFixed(1)}%`,
            lastBlockNumber: this.stats.lastBlockNumber,
            lastSuccess: this.stats.lastSuccessTime?.toISOString()
        });
    }

    resetStats(): void {
        this.stats = {
            totalFetched: 0,
            totalStored: 0,
            totalDuplicates: 0,
            totalErrors: 0,
            lastFetchTime: null,
            lastSuccessTime: null,
            lastBlockNumber: null
        };
        console.log('📊 Collection stats reset');
    }

    // Manual trigger for testing
    async triggerCollection(): Promise<boolean> {
        console.log('🔧 Manual collection triggered');
        return await this.collectLatestBlock();
    }
}

export const blockCollectorService = new BlockCollectorService();