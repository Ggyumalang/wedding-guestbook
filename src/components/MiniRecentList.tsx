import { useState } from 'react';
import { useEnvelopes } from '../hooks/useEnvelopes';
import { ChevronRight, ChevronLeft, ListOrdered } from 'lucide-react';

export function MiniRecentList() {
    const { envelopes, isLoading } = useEnvelopes();
    const [isOpen, setIsOpen] = useState(true);

    // Get the most recent 10 envelopes
    const recentEnvelopes = envelopes
        .sort((a, b) => b.seq_number - a.seq_number)
        .slice(0, 10);

    if (isLoading || envelopes.length === 0) {
        return null;
    }

    return (
        <>
            {/* Sidebar Panel */}
            <div
                className={`fixed top-16 right-0 h-full bg-white shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] border-l border-gray-200 z-40 transition-all duration-300 ease-in-out flex flex-col ${isOpen ? 'w-80 md:w-96 translate-x-0' : 'w-0 translate-x-full'}`}
            >
                {/* Header */}
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center shrink-0 h-[64px] border-b border-gray-700">
                    <h3 className="font-bold text-base flex items-center gap-2">
                        <ListOrdered className="w-5 h-5" />
                        최근 접수 내역
                    </h3>
                    <span className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded-full border border-gray-600">최근 10건</span>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                    {recentEnvelopes.map(env => (
                        <div key={env.id} className="flex justify-between items-center p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-blue-300 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="font-bold text-gray-500 w-7 shrink-0 text-center">{env.seq_number}</span>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-semibold text-gray-900 truncate">
                                        {env.name || '이름 미상'}
                                    </span>
                                    {env.relation && <span className="text-xs text-gray-500 truncate mt-0.5">{env.relation}</span>}
                                </div>
                            </div>
                            <div className="flex flex-col items-end shrink-0 ml-3">
                                <span className="font-bold text-blue-700">{env.amount.toLocaleString()}원</span>
                                {env.meal_tickets > 0 && <span className="text-xs text-gray-500 mt-0.5">식권 {env.meal_tickets}장</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed top-1/2 -translate-y-1/2 z-50 flex items-center justify-center bg-white border border-gray-200 shadow-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 rounded-l-xl w-8 h-16 ${isOpen ? 'right-80 md:right-96' : 'right-0'}`}
                title={isOpen ? "최근 내역 닫기" : "최근 내역 열기"}
            >
                {isOpen ? (
                    <ChevronRight className="w-6 h-6" />
                ) : (
                    <ChevronLeft className="w-6 h-6" />
                )}
            </button>
        </>
    );
}
