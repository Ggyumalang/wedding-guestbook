import React, { useState } from 'react';
import { useGuestbookStore } from '../store/useGuestbookStore';
import { useWeddings } from '../hooks/useWeddings';
import { Plus, LogIn } from 'lucide-react';

export function WeddingSelector() {
    const { setWeddingInfo } = useGuestbookStore();
    const { weddings, isLoading, createWedding } = useWeddings();

    const [weddingId, setInputWeddingId] = useState('');
    const [side, setSide] = useState<'신랑측' | '신부측'>('신부측');

    const [isCreating, setIsCreating] = useState(false);
    const [newGroom, setNewGroom] = useState('');
    const [newBride, setNewBride] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [joinPassword, setJoinPassword] = useState('');

    const handleEnter = (id: string, selectedSide: '신랑측' | '신부측') => {
        if (!id.trim()) return;
        
        const targetWedding = weddings.find(w => w.id === id);
        if (!targetWedding) return;

        // If the wedding has a password, we must verify it matches the entered one.
        // For backwards compatibility, if it doesn't have a password, we let them in.
        if (targetWedding.password && targetWedding.password !== joinPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        setWeddingInfo(id.trim(), selectedSide);
    };

    const handleCreateAndEnter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroom.trim() || !newBride.trim()) return;

        try {
            const newWedding = await createWedding.mutateAsync({
                groom_name: newGroom,
                bride_name: newBride,
                password: newPassword,
                wedding_date: new Date().toISOString()
            });
            // 생성 후 바로 입장
            setWeddingInfo(newWedding.id, side);
        } catch (error) {
            console.error(error);
            alert('예식 생성 중 오류가 발생했습니다.');
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">로딩 중...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">축의대 앱</h1>
                <p className="text-gray-500">빠르고 정확한 실시간 축의금 정산</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

                {/* 탭 전환 */}
                <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
                    <button
                        onClick={() => setIsCreating(false)}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${!isCreating ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                    >
                        기존 예식 참여
                    </button>
                    <button
                        onClick={() => setIsCreating(true)}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${isCreating ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                    >
                        새 예식 생성
                    </button>
                </div>

                {/* 1) 기존 예식 선택 모드 */}
                {!isCreating && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">진행 중인 예식 선택</label>
                            {weddings.length === 0 ? (
                                <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
                                    생성된 예식이 없습니다. 새 예식을 만들어보세요!
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {weddings.map(w => (
                                        <button
                                            key={w.id}
                                            onClick={() => {
                                                setInputWeddingId(w.id);
                                                setJoinPassword('');
                                            }}
                                            className={`w-full text-left p-3 rounded-xl border transition-all ${weddingId === w.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="font-bold text-gray-900">{w.groom_name} & {w.bride_name}</div>
                                            <div className="text-xs text-gray-500 font-mono mt-1 w-full truncate border-t pt-1 border-gray-100">{w.id}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {weddings.length > 0 && (
                            <>
                                <div className="border-t border-gray-100 pt-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">접수처 선택</label>
                                    <div className="flex gap-4">
                                        <label className="flex-1 cursor-pointer">
                                            <input type="radio" name="side" checked={side === '신랑측'} onChange={() => setSide('신랑측')} className="sr-only" />
                                            <div className={`text-center py-3 rounded-xl border-2 transition-all ${side === '신랑측' ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>신랑측</div>
                                        </label>
                                        <label className="flex-1 cursor-pointer">
                                            <input type="radio" name="side" checked={side === '신부측'} onChange={() => setSide('신부측')} className="sr-only" />
                                            <div className={`text-center py-3 rounded-xl border-2 transition-all ${side === '신부측' ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>신부측</div>
                                        </label>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">접수대 입장 비밀번호</label>
                                    <input
                                        type="password"
                                        value={joinPassword}
                                        onChange={(e) => setJoinPassword(e.target.value)}
                                        placeholder="비밀번호 4자리 (생성 시 설정한 값)"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm mb-4"
                                    />
                                </div>

                                <button
                                    onClick={() => handleEnter(weddingId, side)}
                                    disabled={!weddingId}
                                    className="w-full flex justify-center items-center gap-2 py-4 bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white rounded-xl font-bold shadow-md transition-colors"
                                >
                                    <LogIn className="w-5 h-5" />
                                    접수대 입장
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* 2) 새 예식 생성 모드 */}
                {isCreating && (
                    <form onSubmit={handleCreateAndEnter} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">신랑 이름</label>
                                <input
                                    type="text"
                                    required
                                    value={newGroom}
                                    onChange={(e) => setNewGroom(e.target.value)}
                                    placeholder="예: 김철수"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">신부 이름</label>
                                <input
                                    type="text"
                                    required
                                    value={newBride}
                                    onChange={(e) => setNewBride(e.target.value)}
                                    placeholder="예: 이영희"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">접수대 접속 비밀번호 (선택)</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="숫자 4자리 등 원하는 암호를 입력하세요"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">어느 접수대부터 시작하시겠어요?</label>
                            <div className="flex gap-4">
                                <label className="flex-1 cursor-pointer">
                                    <input type="radio" name="createSide" checked={side === '신랑측'} onChange={() => setSide('신랑측')} className="sr-only" />
                                    <div className={`text-center py-3 rounded-xl border-2 transition-all ${side === '신랑측' ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>신랑측</div>
                                </label>
                                <label className="flex-1 cursor-pointer">
                                    <input type="radio" name="createSide" checked={side === '신부측'} onChange={() => setSide('신부측')} className="sr-only" />
                                    <div className={`text-center py-3 rounded-xl border-2 transition-all ${side === '신부측' ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>신부측</div>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={createWedding.isPending}
                            className="w-full flex justify-center items-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-bold shadow-md transition-colors"
                        >
                            {createWedding.isPending ? '생성 중...' : <><Plus className="w-5 h-5" /> 예식 생성 및 입장</>}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
}
