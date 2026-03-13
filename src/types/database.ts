export interface Wedding {
    id: string;
    bride_name: string;
    groom_name: string;
    wedding_date: string | null;
    password: string;
    created_at: string;
}

export interface Envelope {
    id: string;
    wedding_id: string;
    side: string;
    seq_number: number;
    amount: number;
    meal_tickets: number;
    name: string | null;
    relation: string | null;
    memo: string | null;
    created_at: string;
    modified_at: string;
}

export type InsertEnvelope = Omit<Envelope, 'id' | 'created_at' | 'modified_at'>;
export type InsertWedding = Omit<Wedding, 'id' | 'created_at'>;
