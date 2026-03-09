import { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useEnvelopes } from '../hooks/useEnvelopes';
import type { InsertEnvelope } from '../types/database';
import { useGuestbookStore } from '../store/useGuestbookStore';

interface FormValues {
    seq_number: number;
    amount: number;
    meal_tickets: number;
}

const AMOUNTS = [50000, 100000, 150000, 200000, 300000];

export function EnvelopeForm() {
    const { weddingId, side } = useGuestbookStore();
    const { envelopes, addEnvelope } = useEnvelopes();
    const seqInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, reset, setValue, watch, setFocus } = useForm<FormValues>({
        defaultValues: {
            seq_number: 1,
            amount: 0,
            meal_tickets: 1,
        }
    });

    const amount = watch('amount');

    // 봉투 목록이 업데이트될 때마다 자동으로 다음 순번 계산 (단, 사용자가 수동입력 중이 아닐 때)
    useEffect(() => {
        if (envelopes.length > 0) {
            const maxSeq = Math.max(0, ...envelopes.map(e => e.seq_number || 0));
            setValue('seq_number', maxSeq + 1);
        } else {
            setValue('seq_number', 1);
        }
    }, [envelopes, setValue]);

    // 첫 렌더링 시 순번 칸 포커스
    useEffect(() => {
        seqInputRef.current?.focus();
    }, []);

    const onSubmit = async (data: FormValues) => {
        if (!weddingId || !side) return;

        const newEnvelope: InsertEnvelope = {
            wedding_id: weddingId,
            side,
            seq_number: Number(data.seq_number),
            name: null,
            relation: null,
            amount: Number(data.amount),
            meal_tickets: Number(data.meal_tickets),
            memo: null,
        };

        try {
            await addEnvelope.mutateAsync(newEnvelope);
            reset();
            // 등록 후 순번은 effect에 의해 갱신되므로 금액 혹은 순번으로 포커스. 일단 순번으로 유지
            setTimeout(() => setFocus('seq_number'), 0);
        } catch (error) {
            console.error('Failed to save envelope', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    const seqRegister = register('seq_number', { required: true, valueAsNumber: true });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-6">새 접수 입력</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col">
                {/* Seq Number */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">순번 (자동 기입)</label>
                    <input
                        type="number"
                        {...seqRegister}
                        ref={(e) => {
                            seqRegister.ref(e);
                            seqInputRef.current = e;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                setFocus('amount');
                            }
                        }}
                        className="w-full text-2xl font-bold px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">금액 (원)</label>
                    <input
                        type="number"
                        {...register('amount', { required: true, min: 0 })}
                        className="w-full text-xl px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono mb-2"
                    />
                    <div className="flex flex-wrap gap-2">
                        {AMOUNTS.map(amt => (
                            <button
                                key={amt}
                                type="button"
                                tabIndex={-1}
                                onClick={() => { setValue('amount', amt); setFocus('meal_tickets'); }}
                                className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${amount === amt ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                            >
                                +{(amt / 10000)}만
                            </button>
                        ))}
                    </div>
                </div>

                {/* Meal Tickets */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">식권 수량</label>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setValue('meal_tickets', Math.max(0, watch('meal_tickets') - 1))}
                            className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl font-bold"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            {...register('meal_tickets', { min: 0 })}
                            className="w-24 text-center text-2xl font-bold px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setValue('meal_tickets', Number(watch('meal_tickets')) + 1)}
                            className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl font-bold"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="mt-auto pt-6">
                    <button
                        type="submit"
                        className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-md transition-colors flex justify-center items-center"
                    >
                        접수 완료 (Enter)
                    </button>
                </div>
            </form>
        </div>
    );
}
