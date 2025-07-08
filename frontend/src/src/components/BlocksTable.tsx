// frontend/src/components/BlocksTable.tsx
import type { Block } from '../services/api';

interface BlocksTableProps {
    blocks: Block[];
    loading: boolean;
}

const BlocksTable: React.FC<BlocksTableProps> = ({ blocks, loading }) => {
    const formatNumber = (num: number): string => {
        return num.toLocaleString();
    };

    const formatTime = (timestamp: number): string => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const formatTimeAgo = (timestamp: number): string => {
        const now = Date.now() / 1000;
        const diff = now - timestamp;

        if (diff < 60) {
            return `${Math.floor(diff)}s ago`;
        } else if (diff < 3600) {
            return `${Math.floor(diff / 60)}m ago`;
        } else if (diff < 86400) {
            return `${Math.floor(diff / 3600)}h ago`;
        } else {
            return `${Math.floor(diff / 86400)}d ago`;
        }
    };

    const formatGas = (gas: number): string => {
        if (gas >= 1000000) {
            return (gas / 1000000).toFixed(1) + 'M';
        } else if (gas >= 1000) {
            return (gas / 1000).toFixed(1) + 'K';
        }
        return gas.toString();
    };

    const LoadingRow = () => (
        <tr className="animate-pulse">
            <td className="px-6 py-4">
                <div className="h-4 bg-white/20 rounded w-20"></div>
            </td>
            <td className="px-6 py-4">
                <div className="h-4 bg-white/20 rounded w-32"></div>
            </td>
            <td className="px-6 py-4">
                <div className="h-4 bg-white/20 rounded w-16"></div>
            </td>
            <td className="px-6 py-4">
                <div className="h-4 bg-white/20 rounded w-20"></div>
            </td>
            <td className="px-6 py-4">
                <div className="h-4 bg-white/20 rounded w-24"></div>
            </td>
        </tr>
    );

    return (
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    📋 Recent Blocks
                    {loading && <div className="animate-spin text-lg">⏳</div>}
                </h3>
            </div>

            <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                    <thead className="bg-white/5 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Block #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Txs
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Gas Used
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Age
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {loading && blocks.length === 0 ? (
                            Array.from({ length: 10 }).map((_, index) => (
                                <LoadingRow key={index} />
                            ))
                        ) : blocks.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                    No blocks found
                                </td>
                            </tr>
                        ) : (
                            blocks.map((block) => (
                                <tr
                                    key={block.id || block.blockNumber}
                                    className="hover:bg-white/5 transition-colors duration-200"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-white font-medium">
                                            #{formatNumber(block.blockNumber)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-gray-300 text-sm">
                                            {formatTime(block.timestamp)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-blue-300 font-medium">
                                            {formatNumber(block.transactionCount)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-purple-300 font-medium">
                                            {formatGas(block.gasUsed)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-gray-400 text-sm">
                                            {formatTimeAgo(block.timestamp)}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {blocks.length > 0 && (
                <div className="px-6 py-3 bg-white/5 border-t border-white/20">
                    <p className="text-gray-400 text-sm">
                        Showing {blocks.length} most recent blocks
                    </p>
                </div>
            )}
        </div>
    );
};

export default BlocksTable;