import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useEnvelopes } from '../hooks/useEnvelopes';
import { Trash2, Edit2, Search, X, ArrowDownAZ, ArrowUpZA, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Envelope } from '../types/database';

interface RecentEnvelopesListProps {
    isExpanded?: boolean;
    onToggle?: () => void;
}

export function RecentEnvelopesList({ isExpanded = true, onToggle }: RecentEnvelopesListProps) {
    const { envelopes, isLoading, deleteEnvelope, updateEnvelope } = useEnvelopes();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingEnv, setEditingEnv] = useState<Envelope | null>(null);
    const [editName, setEditName] = useState('');
    const [editRelation, setEditRelation] = useState('');
    const [editMemo, setEditMemo] = useState('');

    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [showOnlyEmptyName, setShowOnlyEmptyName] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const processedEnvelopes = useMemo(() => {
        let result = envelopes;

        if (showOnlyEmptyName) {
            result = result.filter(env => !env.name || env.name.trim() === '');
        }

        if (searchQuery) {
            result = result.filter(env =>
                env.seq_number.toString().includes(searchQuery) ||
                (env.name && env.name.includes(searchQuery)) ||
                (env.relation && env.relation.includes(searchQuery))
            );
        }

        if (sortOrder === 'asc') {
            result = [...result].sort((a, b) => a.seq_number - b.seq_number);
        } else {
            result = [...result].sort((a, b) => b.seq_number - a.seq_number);
        }

        return result;
    }, [envelopes, searchQuery, showOnlyEmptyName, sortOrder]);

    const totalPages = Math.max(1, Math.ceil(processedEnvelopes.length / itemsPerPage));

    // Adjust current page if results get filtered and page is out of bounds
    let validCurrentPage = currentPage;
    if (currentPage > totalPages) validCurrentPage = totalPages;

    const currentEnvelopes = processedEnvelopes.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage);

    const currentPageTotalAmount = currentEnvelopes.reduce((sum, env) => sum + env.amount, 0);

    if (isLoading) {
        return <div className="text-gray-500 text-center py-10 flex-1 bg-white rounded-xl shadow-sm border border-gray-200">로딩 중...</div>;
    }

    const handleEditClick = (env: Envelope) => {
        setEditingEnv(env);
        setEditName(env.name || '');
        setEditRelation(env.relation || '');
        setEditMemo(env.memo || '');
    };

    const handleSaveEdit = () => {
        if (!editingEnv) return;
        updateEnvelope.mutate(
            { id: editingEnv.id, updates: { name: editName, relation: editRelation, memo: editMemo } },
            {
                onSuccess: () => {
                    toast.success('상세 정보가 수정되었습니다!', {
                        duration: 2500,
                        style: {
                            background: '#10b981',
                            color: '#fff',
                            fontWeight: 'bold',
                        },
                    });
                    setEditingEnv(null);
                },
                onError: () => {
                    toast.error('저장 중 오류가 발생했습니다.');
                }
            }
        );
    };

    if (!isExpanded) {
        return (
            <div 
                className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center py-4 h-125 lg:h-[calc(100vh-160px)] w-full cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={onToggle}
                title="최근 내역 펼치기"
            >
                <button className="p-2 text-gray-500 hover:text-blue-600 mb-6 lg:mb-10">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div 
                    className="text-gray-500 font-bold tracking-[0.2em] text-sm whitespace-nowrap" 
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                    최근 접수 내역
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-125 lg:h-[calc(100vh-160px)] relative opacity-100 transition-opacity duration-300">
            <div className="p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10 space-y-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {onToggle && (
                            <button
                                onClick={onToggle}
                                className="p-1.5 -ml-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                                title="목록 접기"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                        <h2 className="font-bold text-gray-800 shrink-0">
                            접수 내역 <span className="text-blue-600 text-sm ml-1 font-normal hidden sm:inline">{processedEnvelopes.length}건</span>
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setShowOnlyEmptyName(!showOnlyEmptyName);
                                setCurrentPage(1);
                            }}
                            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${showOnlyEmptyName ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'}`}
                            title="미기입 내역"
                        >
                            <UserX className="w-4 h-4" />
                            <span className="hidden sm:inline">미기입</span>
                        </button>
                        <button
                            onClick={() => {
                                setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                                setCurrentPage(1);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 font-medium transition-colors"
                            title="정렬"
                        >
                            {sortOrder === 'desc' ? <ArrowDownAZ className="w-4 h-4" /> : <ArrowUpZA className="w-4 h-4" />}
                            <span className="hidden sm:inline">{sortOrder === 'desc' ? '최신순' : '오래된순'}</span>
                        </button>
                    </div>
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
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
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
                {currentEnvelopes.length === 0 ? (
                    <div className="text-gray-500 text-center py-10">검색 결과가 없거나 내역이 없습니다.</div>
                ) : (
                    currentEnvelopes.map((env) => (
                        <div
                            key={env.id}
                            className={`p-2 px-3 rounded-lg border flex justify-between items-center group transition-all cursor-pointer ${env.id.startsWith('temp') ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 shadow-sm hover:border-blue-300'}`}
                            onClick={() => handleEditClick(env)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-700 text-sm border border-white shadow-sm">
                                    {env.seq_number}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`font-bold ${env.name ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                            {env.name || '이름 미상'}
                                        </span>
                                        {env.relation && <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">{env.relation}</span>}
                                    </div>
                                    <div className="text-xs text-gray-600 flex gap-x-3 gap-y-1 mt-0.5 items-center flex-wrap">
                                        <span className="font-semibold text-blue-700 text-sm">{env.amount.toLocaleString()}원</span>
                                        <span className="text-gray-500 whitespace-nowrap">식권 {env.meal_tickets}장</span>
                                        <span className="text-gray-400 hidden sm:flex items-center gap-1 whitespace-nowrap">
                                            <span>{new Date(env.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            {env.modified_at && new Date(env.modified_at).getTime() - new Date(env.created_at).getTime() > 1000 && (
                                                <span className="text-gray-300 italic" title={new Date(env.modified_at).toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' })}>(수정됨)</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 모바일에서는 버튼이 항상 보이게 하고, 데스크탑에서는 호버 시에만 보이게 설정 */}
                            <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity flex-col sm:flex-row">
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

            {/* Pagination & Stats Controls */}
            {processedEnvelopes.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center rounded-b-xl shrink-0 gap-3">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-start shrink-0">
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 cursor-pointer outline-none"
                        >
                            <option value={10}>10개씩</option>
                            <option value={20}>20개씩</option>
                            <option value={50}>50개씩</option>
                            <option value={100}>100개씩</option>
                            <option value={10000}>전체보기</option>
                        </select>
                        <div className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                            페이지 합계: <span className="text-blue-700 font-bold">{currentPageTotalAmount.toLocaleString()}원</span>
                        </div>
                    </div>

                    {processedEnvelopes.length > itemsPerPage && (
                        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 w-full md:w-auto mt-2 md:mt-0">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={validCurrentPage === 1}
                                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-1 shrink-0"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <span className="hidden sm:inline text-sm font-medium">이전</span>
                            </button>
                            
                            <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shrink-0">
                                {validCurrentPage} / {totalPages}
                            </span>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={validCurrentPage === totalPages}
                                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-1 shrink-0"
                            >
                                <span className="hidden sm:inline text-sm font-medium">다음</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {editingEnv && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 rounded-xl">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">상세 정보 입력 ({editingEnv.seq_number}번)</h3>
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
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">메모</label>
                                <input
                                    type="text"
                                    value={editMemo}
                                    onChange={(e) => setEditMemo(e.target.value)}
                                    placeholder="메모 입력"
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
