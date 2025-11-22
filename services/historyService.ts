import { supabase } from './supabaseClient';
import { Bill } from '../types';

export const getBills = async (): Promise<Bill[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Select bills from Supabase where user_id matches current user (handled by RLS policy usually, but good to be explicit)
    const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error("Error fetching bills:", error);
        return [];
    }

    // Map Supabase columns back to frontend Bill type
    // Note: We store complex objects (participants, items, extras) as JSONB in Supabase
    return data.map((row: any) => ({
        id: row.id,
        title: row.title,
        date: row.date,
        hostId: row.host_id,
        currency: row.currency,
        participants: row.participants,
        items: row.items,
        extras: row.extras
    })) as Bill[];
};

export const saveBill = async (bill: Bill): Promise<Bill> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Prepare payload for Supabase
    const isNew = bill.id.startsWith('temp_');
    const billId = isNew ? crypto.randomUUID() : bill.id;

    const payload = {
        id: billId,
        user_id: user.id,
        title: bill.title,
        date: bill.date,
        host_id: bill.hostId,
        currency: bill.currency,
        participants: bill.participants, // Supabase will store this as JSONB
        items: bill.items,               // Supabase will store this as JSONB
        extras: bill.extras              // Supabase will store this as JSONB
    };

    const { data, error } = await supabase
        .from('bills')
        .upsert(payload)
        .select()
        .single();

    if (error) {
        console.error("Error saving bill to Supabase:", error);
        throw error;
    }

    // Return the saved bill in the frontend format
    return {
        id: data.id,
        title: data.title,
        date: data.date,
        hostId: data.host_id,
        currency: data.currency,
        participants: data.participants,
        items: data.items,
        extras: data.extras
    };
};
