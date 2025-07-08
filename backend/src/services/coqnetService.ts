// src/services/coqnet.ts
import axios, { AxiosResponse } from 'axios';

// Types for Coqnet API response
export interface CoqnetBlock {
    number: string;
    timestamp: string;
    transactionCount: number;
    gasUsed: string;
    // Add other fields as needed based on actual API response
}

export interface CoqnetApiResponse {
    block?: CoqnetBlock;
    // Add other response fields as needed
}

class CoqnetService {
    private readonly apiUrl: string;
    private readonly timeout: number = 10000; // 10 seconds
    private readonly maxRetries: number = 3;

    constructor() {
        this.apiUrl = process.env.COQNET_API_URL ||
            'https://23aqu1537ysecjmxw11xhjpra6bptbsps5d4xxupt8hn2queag.idx2.solokhin.com/api/blocks/latest';
    }

    async fetchLatestBlock(): Promise<CoqnetBlock | null> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`📡 Fetching latest block from Coqnet API (attempt ${attempt}/${this.maxRetries})`);

                const response: AxiosResponse<any> = await axios.get(this.apiUrl, {
                    timeout: this.timeout,
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Coqnet-Explorer/1.0.0'
                    }
                });

                // Log the raw response to understand the structure
                console.log('📊 Raw API Response:', JSON.stringify(response.data, null, 2));

                // Parse the response based on actual API structure
                const blockData = this.parseApiResponse(response.data);

                if (!blockData) {
                    throw new Error('No block data found in API response');
                }

                console.log(`✅ Successfully fetched block #${blockData.number}`);
                return blockData;

            } catch (error) {
                lastError = error as Error;
                console.error(`❌ Attempt ${attempt} failed:`, error instanceof Error ? error.message : 'Unknown error');

                // Wait before retry (exponential backoff)
                if (attempt < this.maxRetries) {
                    const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                    console.log(`⏳ Waiting ${waitTime}ms before retry...`);
                    await this.sleep(waitTime);
                }
            }
        }

        console.error(`💥 All ${this.maxRetries} attempts failed. Last error:`, lastError?.message);
        return null;
    }

    private parseApiResponse(data: any): CoqnetBlock | null {
        try {
            // Handle different possible response structures
            let blockData: any = null;

            // Try different possible structures
            if (data.block) {
                blockData = data.block;
            } else if (data.result) {
                blockData = data.result;
            } else if (data.data) {
                blockData = data.data;
            } else if (data.number || data.blockNumber) {
                blockData = data;
            } else {
                // Log structure to help debug
                console.warn('🔍 Unknown API response structure:', Object.keys(data));
                return null;
            }

            // Extract fields with fallbacks
            const number = blockData.number || blockData.blockNumber || blockData.height;
            const timestamp = blockData.timestamp || blockData.time || Date.now();
            const transactionCount = blockData.transactionCount || blockData.txCount || blockData.transactions?.length || 0;
            const gasUsed = blockData.gasUsed || blockData.gas || blockData.gasLimit || '0';

            if (!number) {
                console.error('❌ No block number found in response');
                return null;
            }

            return {
                number: typeof number === 'string' ? number : number.toString(),
                timestamp: typeof timestamp === 'string' ? timestamp : timestamp.toString(),
                transactionCount: typeof transactionCount === 'number' ? transactionCount : parseInt(transactionCount) || 0,
                gasUsed: typeof gasUsed === 'string' ? gasUsed : gasUsed.toString()
            };

        } catch (error) {
            console.error('❌ Error parsing API response:', error);
            return null;
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Health check method
    async checkApiHealth(): Promise<boolean> {
        try {
            const response = await axios.get(this.apiUrl, { timeout: 5000 });
            return response.status === 200;
        } catch (error) {
            console.error('🏥 API health check failed:', error instanceof Error ? error.message : 'Unknown error');
            return false;
        }
    }
}

export const coqnetService = new CoqnetService();