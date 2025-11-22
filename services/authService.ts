import { supabase } from './supabaseClient';
import { User } from '../types';

export const register = async (name: string, email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            }
        }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Registration failed");

    return {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.full_name || name
    };
};

export const login = async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    if (!data.user) throw new Error("Login failed");

    return {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.full_name || ''
    };
};

export const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
};

// Check for existing session
export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return null;

    return {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name || ''
    };
};
