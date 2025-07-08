// src/services/database.ts
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { Router, Request, Response } from 'express';
import { databaseManagementService } from '../services/databaseManagement';

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

class DatabaseService {
    private db: sqlite3.Database;
    private dbRun: (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
    private dbGet: (sql: string, params?: any[]) => Promise<any>;
    private dbAll: (sql: string, params?: any[]) => Promise<any[]>;

    constructor() {
        const dbPath = path.join(__dirname, '../../data/blocks.db');

        // Ensure data directory exists
        const fs = require('fs');
        const dataDir = path.dirname(dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        this.db = new sqlite3.Database(dbPath);

        // Promisify database methods
        this.dbRun = promisify(this.db.run.bind(this.db));
        this.dbGet = promisify(this.db.get.bind(this.db));
        this.dbAll = promisify(this.db.all.bind(this.db));

        this.initializeDatabase();
    }

    private async initializeDatabase(): Promise<void> {
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS blocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blockNumber INTEGER UNIQUE NOT NULL,
        timestamp INTEGER NOT NULL,
        transactionCount INTEGER NOT NULL,
        gasUsed INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

        try {
            await this.dbRun(createTableSQL);
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }

    async insertBlock(block: Block): Promise<number> {
        const sql = `
      INSERT OR IGNORE INTO blocks (blockNumber, timestamp, transactionCount, gasUsed)
      VALUES (?, ?, ?, ?)
    `;

        try {
            const result = await this.dbRun(sql, [
                block.blockNumber,
                block.timestamp,
                block.transactionCount,
                block.gasUsed
            ]);

            // Handle case where INSERT OR IGNORE doesn't insert (duplicate)
            if (result && result.lastID) {
                return result.lastID;
            } else if (result && result.changes === 0) {
                // No rows were inserted (duplicate), return 0 to indicate this
                return 0;
            } else {
                // Some other case, try to get the existing block ID
                const existingBlock = await this.dbGet(
                    'SELECT id FROM blocks WHERE blockNumber = ?',
                    [block.blockNumber]
                );
                return existingBlock ? existingBlock.id : 0;
            }
        } catch (error) {
            console.error('Error inserting block:', error);
            throw error;
        }
    }

    async getBlocks(limit: number = 50): Promise<{ blocks: Block[], total: number }> {
        try {
            // Get total count
            const countResult = await this.dbGet('SELECT COUNT(*) as count FROM blocks');
            const total = countResult.count;

            // Get blocks with limit, ordered by blockNumber DESC
            const blocksSQL = `
        SELECT * FROM blocks 
        ORDER BY blockNumber DESC 
        LIMIT ?
      `;

            const blocks = await this.dbAll(blocksSQL, [limit]);

            return { blocks, total };
        } catch (error) {
            console.error('Error fetching blocks:', error);
            throw error;
        }
    }

    async getBlockStats(): Promise<BlockStats> {
        try {
            // Get latest block
            const latestBlock = await this.dbGet(`
        SELECT blockNumber, timestamp FROM blocks 
        ORDER BY blockNumber DESC 
        LIMIT 1
      `);

            if (!latestBlock) {
                return {
                    averageBlockTime: 0,
                    totalTransactionsLast100: 0,
                    averageGasUsed: 0,
                    latestBlockTimestamp: 0,
                    latestBlockNumber: 0
                };
            }

            // Get last 100 blocks for calculations
            const last100Blocks = await this.dbAll(`
        SELECT timestamp, transactionCount, gasUsed 
        FROM blocks 
        ORDER BY blockNumber DESC 
        LIMIT 100
      `);

            // Calculate average block time (between consecutive blocks)
            let totalTimeDiff = 0;
            let timeDiffCount = 0;

            for (let i = 0; i < last100Blocks.length - 1; i++) {
                const timeDiff = last100Blocks[i].timestamp - last100Blocks[i + 1].timestamp;
                if (timeDiff > 0) {
                    totalTimeDiff += timeDiff;
                    timeDiffCount++;
                }
            }

            const averageBlockTime = timeDiffCount > 0 ? totalTimeDiff / timeDiffCount : 0;

            // Calculate total transactions in last 100 blocks
            const totalTransactionsLast100 = last100Blocks.reduce(
                (sum, block) => sum + block.transactionCount,
                0
            );

            // Calculate average gas used
            const averageGasUsed = last100Blocks.length > 0
                ? last100Blocks.reduce((sum, block) => sum + block.gasUsed, 0) / last100Blocks.length
                : 0;

            return {
                averageBlockTime: Math.round(averageBlockTime),
                totalTransactionsLast100,
                averageGasUsed: Math.round(averageGasUsed),
                latestBlockTimestamp: latestBlock.timestamp,
                latestBlockNumber: latestBlock.blockNumber
            };
        } catch (error) {
            console.error('Error calculating block stats:', error);
            throw error;
        }
    }

    async getLatestBlockNumber(): Promise<number> {
        try {
            const result = await this.dbGet(`
        SELECT blockNumber FROM blocks 
        ORDER BY blockNumber DESC 
        LIMIT 1
      `);
            return result?.blockNumber || 0;
        } catch (error) {
            console.error('Error getting latest block number:', error);
            return 0;
        }
    }

    close(): void {
        this.db.close();
    }
}



export const databaseService = new DatabaseService();