import { useState } from 'react';
import { useGuestbookStore } from '../store/useGuestbookStore';
import { WeddingSelector } from '../components/WeddingSelector';
import { DashboardTopBar } from '../components/DashboardTopBar';
import { EnvelopeForm } from '../components/EnvelopeForm';
import { RecentEnvelopesList } from '../components/RecentEnvelopesList';

export function AdminPage() {
    const { weddingId } = useGuestbookStore();
    const [isListExpanded, setIsListExpanded] = useState(true);

    if (!weddingId) {
        return <WeddingSelector />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <DashboardTopBar />

            <main className="flex-1 max-w-7xl w-full mx-auto p-2 md:p-6 flex flex-col lg:flex-row gap-4 md:gap-6 pb-20 lg:pb-6 relative overflow-hidden">
                {/* Left Section: Fast Input Form */}
                <section className={`transition-all duration-300 ease-in-out flex-shrink-0 w-full ${isListExpanded ? 'lg:w-[400px] xl:w-[450px]' : 'lg:w-[calc(100%-4rem)] xl:w-[calc(100%-4rem)]'}`}>
                    <EnvelopeForm />
                </section>

                {/* Right Section: Recent List */}
                <section className={`transition-all duration-300 ease-in-out flex-shrink-0 lg:h-full w-full hidden lg:block ${isListExpanded ? 'lg:flex-1 lg:w-auto' : 'lg:w-12 lg:min-w-[48px]'}`}>
                    <RecentEnvelopesList isExpanded={isListExpanded} onToggle={() => setIsListExpanded(!isListExpanded)} />
                </section>
                {/* Mobile version (always expanded) */}
                <section className={`w-full lg:hidden`}>
                    <RecentEnvelopesList />
                </section>
            </main>
        </div>
    );
}
