import * as xlsx from 'xlsx';
import type { Envelope } from '../types/database';

export function exportEnvelopesToExcel(envelopes: Envelope[], weddingName: string) {
    // 데이터를 엑셀 친화적인 형태로 변환
    const data = envelopes.map((env) => ({
        '수령 시각': new Date(env.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        '순번': env.seq_number,
        '접수처': env.side,
        '이름': env.name || '미입력',
        '소속/관계': env.relation || '',
        '접수 금액(원)': env.amount,
        '식권 배부(장)': env.meal_tickets,
        '최종 수정 시각': env.modified_at ? new Date(env.modified_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : '',
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook, worksheet, '축의금 접수 내역');

    const fileName = `${weddingName}_축의금접수내역_${new Date().toISOString().slice(0, 10)}.xlsx`;

    xlsx.writeFile(workbook, fileName);
}
