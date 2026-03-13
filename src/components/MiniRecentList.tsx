import { useState } from 'react';
import { useEnvelopes } from '../hooks/useEnvelopes';
import { ChevronDown, ListOrdered } from 'lucide-react';

export function MiniRecentList() {
    const { envelopes, isLoading } = useEnvelopes();
    const [isOpen, setIsOpen] = useState(false);

    // Get the most recent 10 envelopes
    const recentEnvelopes = envelopes
        .sort((a, b) => b.seq_number - a.seq_number)
        .slice(0, 10);

    if (isLoading || envelopes.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {/* Collapsible Panel */}
            <div 
                className={`bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out origin-bottom-right mb-3 ${isOpen ? 'opacity-100 scale-100 w-72 md:w-80' : 'opacity-0 scale-95 w-0 h-0 border-none'}`}
            >
                <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                        <ListOrdered className="w-4 h-4" />
                        최근 입력 내역
                    </h3>
                    <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full">최근 10건</span>
                </div>
                
                <div className="max-h-60 overflow-y-auto p-2 space-y-2">
                    {recentEnvelopes.map(env => (
                        <div key={env.id} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className="font-bold text-gray-500 w-6 shrink-0">{env.seq_number}</span>
                                <div className="truncate flex flex-col">
                                    <span className="font-semibold text-gray-900 truncate">
                                        {env.name || '이름 미상'}
                                    </span>
                                    {env.relation && <span className="text-xs text-gray-500 truncate">{env.relation}</span>}
                                </div>
                            </div>
                            <div className="flex flex-col items-end shrink-0 ml-2">
                                <span className="font-bold text-blue-700">{env.amount.toLocaleString()}원</span>
                                {env.meal_tickets > 0 && <span className="text-xs text-gray-500">식권 {env.meal_tickets}장</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ${isOpen ? 'bg-gray-800 text-white w-12 h-12' : 'bg-blue-600 hover:bg-blue-700 text-white px-4 h-12 gap-2'}`}
                title="최근 내역 보기"
            >
                {isOpen ? (
                    <ChevronDown className="w-6 h-6" />
                ) : (
                    <>
                        <ListOrdered className="w-5 h-5" />
                        <span className="font-bold text-sm">최근 내역 ({recentEnvelopes.length})</span>
                    </>
                )}
            </button>
        </div>
    );
}
