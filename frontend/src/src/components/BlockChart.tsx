// frontend/src/components/BlockChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { Block } from '../services/api';

interface BlockChartProps {
    blocks: Block[];
    loading: boolean;
}

const BlockChart: React.FC<BlockChartProps> = ({ blocks, loading }) => {
    // Prepare chart data (reverse to show oldest to newest)
    const chartData = blocks
        .slice()
        .reverse()
        .slice(-20) // Show last 20 blocks for better readability
        .map((block) => ({
            blockNumber: block.blockNumber,
            transactions: block.transactionCount,
            gasUsed: Math.round(block.gasUsed / 1000000), // Convert to millions for readability
            timestamp: block.timestamp,
            formattedBlock: `#${block.blockNumber.toString().slice(-4)}`, // Show last 4 digits
        }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-medium">Block #{label}</p>
                    <p className="text-blue-300">
                        <span className="text-gray-300">Transactions:</span> {data.transactions}
                    </p>
                    <p className="text-purple-300">
                        <span className="text-gray-300">Gas Used:</span> {data.gasUsed}M
                    </p>
                    <p className="text-gray-400 text-sm">
                        {new Date(data.timestamp * 1000).toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading && blocks.length === 0) {
        return (
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-semibold text-white">📈 Block Metrics</h3>
                    <div className="animate-spin text-lg">⏳</div>
                </div>
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading chart data...</div>
                </div>
            </div>
        );
    }

    if (blocks.length === 0) {
        return (
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-4">📈 Block Metrics</h3>
                <div className="h-64 flex items-center justify-center">
                    <div className="text-gray-400">No data available</div>
                </div>
            </div>
        );
    }

    return (
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">📈 Block Metrics</h3>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-300">Transactions</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-300">Gas Used (M)</span>
                    </div>
                </div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="formattedBlock"
                            stroke="#9CA3AF"
                            fontSize={12}
                            tick={{ fill: '#9CA3AF' }}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            fontSize={12}
                            tick={{ fill: '#9CA3AF' }}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        <Line
                            type="monotone"
                            dataKey="transactions"
                            stroke="#60A5FA"
                            strokeWidth={2}
                            dot={{ fill: '#60A5FA', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#60A5FA', strokeWidth: 2 }}
                        />

                        <Line
                            type="monotone"
                            dataKey="gasUsed"
                            stroke="#A78BFA"
                            strokeWidth={2}
                            dot={{ fill: '#A78BFA', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#A78BFA', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                    <div className="text-gray-400">Avg Transactions</div>
                    <div className="text-blue-300 font-medium">
                        {chartData.length > 0
                            ? Math.round(chartData.reduce((sum, d) => sum + d.transactions, 0) / chartData.length)
                            : 0
                        }
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-gray-400">Avg Gas Used</div>
                    <div className="text-purple-300 font-medium">
                        {chartData.length > 0
                            ? Math.round(chartData.reduce((sum, d) => sum + d.gasUsed, 0) / chartData.length)
                            : 0
                        }M
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlockChart;