import { useGuestbookStore } from '../store/useGuestbookStore';
import { useEnvelopes } from '../hooks/useEnvelopes';
import { useWeddings } from '../hooks/useWeddings';
import { Users, ReceiptText, Banknote, Download } from 'lucide-react';
import { exportEnvelopesToExcel } from '../utils/exportToExcel';

export function DashboardTopBar() {
    const { weddingId, side, clearWeddingInfo } = useGuestbookStore();
    const { envelopes } = useEnvelopes();
    const { weddings } = useWeddings();

    const currentWedding = weddings.find(w => w.id === weddingId);

    const totalAmount = envelopes.reduce((sum, env) => sum + env.amount, 0);
    const totalTickets = envelopes.reduce((sum, env) => sum + env.meal_tickets, 0);
    const totalCount = envelopes.length;

    return (
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {currentWedding ? (
                            <>
                                <span>{currentWedding.groom_name}</span>
                                <span className="text-pink-400">♥</span>
                                <span>{currentWedding.bride_name}</span>
                                <span className="text-gray-400 font-normal text-lg ml-2">({side})</span>
                            </>
                        ) : (
                            side || '접수대'
                        )}
                    </h1>
                    <button
                        onClick={clearWeddingInfo}
                        className="text-sm text-gray-400 hover:text-gray-700 underline"
                    >
                        변경
                    </button>
                </div>

                <div className="flex items-center gap-4 xl:gap-6">
                    <StatBox icon={<Users className="w-5 h-5 text-blue-500" />} label="접수 건수" value={`${totalCount}건`} />
                    <StatBox icon={<ReceiptText className="w-5 h-5 text-green-500" />} label="식권 배부" value={`${totalTickets}장`} />
                    <StatBox icon={<Banknote className="w-5 h-5 text-indigo-500" />} label="총 접수액" value={`${totalAmount.toLocaleString()}원`} highlight />

                    <div className="hidden md:block w-px h-10 bg-gray-200 mx-2"></div>

                    <button
                        onClick={() => exportEnvelopesToExcel(envelopes, side || '웨딩_접수대')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
                        title="엑셀 다운로드"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden lg:inline">엑셀 다운로드</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatBox({ icon, label, value, highlight = false }: { icon: React.ReactNode, label: string, value: string, highlight?: boolean }) {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg ${highlight ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50'}`}>
            <div className="p-2 bg-white rounded-md shadow-sm">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className={`text-xl font-bold ${highlight ? 'text-indigo-700' : 'text-gray-900'}`}>{value}</p>
            </div>
        </div>
    );
}
