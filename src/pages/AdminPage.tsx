import { useGuestbookStore } from '../store/useGuestbookStore';
import { WeddingSelector } from '../components/WeddingSelector';
import { DashboardTopBar } from '../components/DashboardTopBar';
import { EnvelopeForm } from '../components/EnvelopeForm';
import { RecentEnvelopesList } from '../components/RecentEnvelopesList';

export function AdminPage() {
    const { weddingId } = useGuestbookStore();

    if (!weddingId) {
        return <WeddingSelector />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <DashboardTopBar />

            <main className="flex-1 max-w-7xl w-full mx-auto p-2 md:p-6 flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6 pb-20 lg:pb-6">
                {/* Left Section: Fast Input Form */}
                <section className="col-span-1 lg:col-span-6 xl:col-span-4 flex-shrink-0">
                    <EnvelopeForm />
                </section>

                {/* Right Section: Recent List */}
                <section className="col-span-1 lg:col-span-6 xl:col-span-8 flex-1 lg:h-full">
                    <RecentEnvelopesList />
                </section>
            </main>
        </div>
    );
}
