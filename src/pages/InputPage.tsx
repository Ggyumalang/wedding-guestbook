import { useGuestbookStore } from '../store/useGuestbookStore';
import { WeddingSelector } from '../components/WeddingSelector';
import { EnvelopeForm } from '../components/EnvelopeForm';
import { Link } from 'react-router-dom';

export function InputPage() {
    const { weddingId, side, clearWeddingInfo } = useGuestbookStore();

    if (!weddingId) {
        return <WeddingSelector />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white shadow-sm border-b border-gray-200 px-3 md:px-4 py-3 flex justify-between items-center w-full">
                <h1 className="text-lg font-bold text-gray-800 shrink-0">
                    {side} 접수
                </h1>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={clearWeddingInfo}
                        className="text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                    >
                        웨딩/소속 변경
                    </button>
                    <Link
                        to="/admin"
                        className="text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                    >
                        관리자 페이지
                    </Link>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center p-4 md:p-8">
                <div className="w-full max-w-md flex flex-col gap-4">
                    <EnvelopeForm />
                </div>
            </main>
        </div>
    );
}
