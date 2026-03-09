import { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useEnvelopes } from '../hooks/useEnvelopes';
import type { InsertEnvelope } from '../types/database';
import { useGuestbookStore } from '../store/useGuestbookStore';

interface FormValues {
    seq_number: number;
    name: string;
    relation: string;
    amount: number;
    meal_tickets: number;
}

const AMOUNTS = [50000, 100000, 150000, 200000, 300000];
const RELATIONS = ['가족', '친척', '회사', '친구', '지인'];

export function EnvelopeForm() {
    const { weddingId, side } = useGuestbookStore();
    const { envelopes, addEnvelope } = useEnvelopes();
    const seqInputRef = useRef<HTMLInputElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const relationInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, reset, setValue, watch, setFocus } = useForm<FormValues>({
        defaultValues: {
            seq_number: 1,
            name: '',
            relation: '',
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
            name: data.name.trim() || null,
            relation: data.relation.trim() || null,
            amount: Number(data.amount),
            meal_tickets: Number(data.meal_tickets),
            memo: null,
        };

        try {
            await addEnvelope.mutateAsync(newEnvelope);
            // reset entire form but preserve next expected sequence number logic
            reset({
                seq_number: Number(data.seq_number) + 1,
                name: '',
                relation: '',
                amount: 0,
                meal_tickets: 1,
            });
            setTimeout(() => setFocus('seq_number'), 0);
        } catch (error) {
            console.error('Failed to save envelope', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    const seqRegister = register('seq_number', { required: true, valueAsNumber: true });
    const nameRegister = register('name');
    const relationRegister = register('relation');

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
                                setFocus('name');
                            }
                        }}
                        className="w-full text-2xl font-bold px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">이름 (선택)</label>
                    <input
                        {...nameRegister}
                        ref={(e) => {
                            nameRegister.ref(e);
                            nameInputRef.current = e;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                setFocus('relation');
                            }
                        }}
                        placeholder="이름을 입력하거나 Enter로 스킵"
                        className="w-full text-lg px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        autoComplete="off"
                    />
                </div>

                {/* Relation */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">소속 및 관계 (선택)</label>
                    <input
                        {...relationRegister}
                        ref={(e) => {
                            relationRegister.ref(e);
                            relationInputRef.current = e;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                setFocus('amount');
                            }
                        }}
                        placeholder="관계 입력하거나 Enter로 스킵"
                        className="w-full text-lg px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mb-2"
                        autoComplete="off"
                    />
                    <div className="flex flex-wrap gap-2">
                        {RELATIONS.map(rel => (
                            <button
                                key={rel}
                                type="button"
                                tabIndex={-1}
                                onClick={() => { setValue('relation', rel); setFocus('amount'); }}
                                className="px-3 py-1.5 text-sm rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                            >
                                {rel}
                            </button>
                        ))}
                    </div>
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
