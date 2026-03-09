import { useState } from 'react';
import { useEnvelopes } from '../hooks/useEnvelopes';
import { Trash2, Edit2, Search, X } from 'lucide-react';
import type { Envelope } from '../types/database';

export function RecentEnvelopesList() {
    const { envelopes, isLoading, deleteEnvelope, updateEnvelope } = useEnvelopes();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingEnv, setEditingEnv] = useState<Envelope | null>(null);
    const [editName, setEditName] = useState('');
    const [editRelation, setEditRelation] = useState('');

    if (isLoading) {
        return <div className="text-gray-500 text-center py-10 flex-1">로딩 중...</div>;
    }

    const filteredEnvelopes = envelopes.filter(env =>
        env.seq_number.toString().includes(searchQuery) ||
        (env.name && env.name.includes(searchQuery)) ||
        (env.relation && env.relation.includes(searchQuery))
    );

    const handleEditClick = (env: Envelope) => {
        setEditingEnv(env);
        setEditName(env.name || '');
        setEditRelation(env.relation || '');
    };

    const handleSaveEdit = () => {
        if (!editingEnv) return;
        updateEnvelope.mutate({
            id: editingEnv.id,
            updates: { name: editName, relation: editRelation }
        });
        setEditingEnv(null);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-160px)] relative">
            <div className="p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10 space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-gray-800">접수 내역 <span className="text-blue-600 text-sm ml-2 font-normal">최신순</span></h2>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="순번, 이름, 소속 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredEnvelopes.length === 0 ? (
                    <div className="text-gray-500 text-center py-10">검색 결과가 없거나 내역이 없습니다.</div>
                ) : (
                    filteredEnvelopes.map((env) => (
                        <div
                            key={env.id}
                            className={`p-4 rounded-lg border flex justify-between items-center group transition-all cursor-pointer ${env.id.startsWith('temp') ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 shadow-sm hover:border-blue-300'}`}
                            onClick={() => handleEditClick(env)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-700 text-lg border-2 border-white shadow-sm">
                                    {env.seq_number}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-bold text-lg ${env.name ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                            {env.name || '이름 미상'}
                                        </span>
                                        {env.relation && <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{env.relation}</span>}
                                    </div>
                                    <div className="text-sm text-gray-600 flex gap-4">
                                        <span className="font-semibold text-blue-700">{env.amount.toLocaleString()}원</span>
                                        <span className="text-gray-500">식권 {env.meal_tickets}장</span>
                                        <span className="text-gray-400 text-xs flex items-center gap-1">
                                            <span>{new Date(env.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            {env.modified_at && new Date(env.modified_at).getTime() - new Date(env.created_at).getTime() > 1000 && (
                                                <span className="text-gray-300 italic" title={new Date(env.modified_at).toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' })}>(수정됨)</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditClick(env);
                                    }}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="수정"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`${env.seq_number}번 내역을 삭제하시겠습니까?`)) {
                                            deleteEnvelope.mutate(env.id);
                                        }
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="삭제"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            {editingEnv && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 rounded-xl">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">상세 정보 보완 ({editingEnv.seq_number}번)</h3>
                            <button onClick={() => setEditingEnv(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">이름</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="이름 입력"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">소속 및 관계</label>
                                <input
                                    type="text"
                                    value={editRelation}
                                    onChange={(e) => setEditRelation(e.target.value)}
                                    placeholder="예: 신부친구, 회사동료"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleSaveEdit}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                                >
                                    저장
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
