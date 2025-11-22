
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Bill, Participant, User } from './types';
import BillSetup from './components/BillSetup';
import BillDetails from './components/BillDetails';
import HistoryView from './components/HistoryView';
import Auth from './components/Auth';
import { calculateBill } from './services/calculationService';
import { getBills, saveBill } from './services/historyService';
import * as authService from './services/authService';
import { isSupabaseConfigured, setupSupabaseManual, clearSupabaseConfig } from './services/supabaseClient';


const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [bill, setBill] = useState<Bill | null>(null);
    const [historicalBills, setHistoricalBills] = useState<Bill[]>([]);
    const [view, setView] = useState<'bill' | 'history'>('bill');
    const [isLoading, setIsLoading] = useState(true);

    // Setup state
    const [setupUrl, setSetupUrl] = useState('');
    const [setupKey, setSetupKey] = useState('');

    useEffect(() => {
        const initAuth = async () => {
            if (!isSupabaseConfigured) {
                setIsLoading(false);
                return;
            }
            try {
                const user = await authService.getCurrentUser();
                if (user) {
                    setCurrentUser(user);
                }
            } catch (e) {
                console.error("Auth init failed:", e);
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    useEffect(() => {
        const fetchBills = async () => {
            if (currentUser && isSupabaseConfigured) {
                setIsLoading(true);
                try {
                    const loadedBills = await getBills();
                    setHistoricalBills(loadedBills);
                } catch (e) {
                    console.error("Fetch bills failed:", e);
                }
                setIsLoading(false);
            } else {
                setHistoricalBills([]);
            }
        };

        fetchBills();
    }, [currentUser]);

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
    };

    const handleLogout = async () => {
        await authService.logout();
        setCurrentUser(null);
        setBill(null);
        setView('bill');
    };
    
    const handleResetConfig = () => {
        if(confirm('Are you sure you want to disconnect from this Supabase project?')) {
            clearSupabaseConfig();
        }
    };

    const handleCreateBill = (title: string, participants: Participant[]) => {
        const newBill: Bill = {
            id: `temp_${Date.now()}`, // Temporary ID for new bills
            title,
            date: new Date().toISOString(),
            hostId: participants[0].id,
            participants,
            items: [],
            extras: [],
            currency: 'IDR'
        };
        setBill(newBill);
        setView('bill');
    };

    const handleSaveAndReset = async () => {
        if (bill && bill.items.length > 0 && currentUser) {
            try {
                const savedBill = await saveBill(bill);
                // Optimistically update history
                const existingIndex = historicalBills.findIndex(b => b.id === savedBill.id || b.id === bill.id);
                if (existingIndex > -1) {
                    const updatedHistory = [...historicalBills];
                    updatedHistory[existingIndex] = savedBill;
                    setHistoricalBills(updatedHistory);
                } else {
                    setHistoricalBills([savedBill, ...historicalBills]);
                }
            } catch (error) {
                console.error("Failed to save bill:", error);
                alert("Could not save the bill. Please try again.");
            }
        }
        setBill(null);
        setView('bill');
    };
    
    const handleLoadBill = (billId: string) => {
        const billToLoad = historicalBills.find(b => b.id === billId);
        if (billToLoad) {
            setBill(billToLoad);
            setView('bill');
        }
    };

    const handleViewHistory = () => {
        setView('history');
    }

    const handleBackToBill = () => {
        setView('bill');
    }

    const handleManualSetup = (e: React.FormEvent) => {
        e.preventDefault();
        if (setupUrl && setupKey) {
            setupSupabaseManual(setupUrl, setupKey);
        }
    };

    const updateBill = useCallback((updatedBill: Bill) => {
        setBill(updatedBill);
    }, []);

    const billCalculation = useMemo(() => {
        if (!bill) return null;
        return calculateBill(bill);
    }, [bill]);

    // --- Configuration Check Render ---
    if (!isSupabaseConfigured) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
                <div className="bg-white max-w-2xl w-full rounded-xl shadow-2xl p-8 border-t-4 border-green-500">
                    <div className="text-center mb-6">
                        <i className="fa-solid fa-database text-5xl text-green-500 mb-4"></i>
                        <h1 className="text-3xl font-bold text-gray-900">Connect Database</h1>
                        <p className="text-gray-600 mt-2">Please connect to Supabase to continue.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-bold text-blue-800 mb-2 text-sm"><i className="fas fa-info-circle mr-2"></i>Quick Setup Guide:</h3>
                            <ol className="list-decimal list-inside space-y-1 text-blue-900 text-xs">
                                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" className="underline font-bold hover:text-blue-600">Supabase Dashboard</a> & create a project.</li>
                                <li>Go to <strong>Settings (⚙️)</strong> &rarr; <strong>API</strong>.</li>
                                <li>Copy <strong>Project URL</strong> and <strong>anon public key</strong> below.</li>
                                <li>Run the SQL found in the chat history in the <strong>SQL Editor</strong>.</li>
                            </ol>
                        </div>

                        <form onSubmit={handleManualSetup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Supabase Project URL</label>
                                <input 
                                    type="text" 
                                    value={setupUrl}
                                    onChange={e => setSetupUrl(e.target.value)}
                                    placeholder="https://xyz.supabase.co"
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Supabase Anon Key</label>
                                <input 
                                    type="password" 
                                    value={setupKey}
                                    onChange={e => setSetupKey(e.target.value)}
                                    placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                                Save & Connect
                            </button>
                        </form>
                        
                        <p className="text-center text-xs text-gray-400 mt-4">
                            These keys will be stored safely in your browser's local storage.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading && !currentUser) {
         return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div></div>;
    }

    if (!currentUser) {
        return <Auth onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center space-x-3">
                        <i className="fa-solid fa-receipt text-3xl text-green-500"></i>
                        <h1 className="text-3xl font-bold text-gray-900">SplitBill Pro</h1>
                    </div>
                    <div className="flex items-center flex-wrap justify-center gap-2">
                        <span className="text-gray-600 hidden md:inline mr-2">Welcome, {currentUser.name}!</span>
                         {historicalBills.length > 0 && view === 'bill' && !bill && (
                            <button
                                onClick={handleViewHistory}
                                className="bg-white hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 border border-gray-300 text-sm"
                                title="View History"
                            >
                                <i className="fa-solid fa-calendar-days"></i>
                                <span className="hidden sm:inline">History</span>
                            </button>
                        )}
                        {bill && (
                            <button
                                onClick={handleSaveAndReset}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm"
                                title="Save and start new bill"
                            >
                                <i className="fa-solid fa-plus"></i>
                                <span className="hidden sm:inline">New Bill</span>
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm"
                            title="Logout"
                        >
                            <i className="fa-solid fa-power-off"></i>
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                         <button
                            onClick={handleResetConfig}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors"
                            title="Disconnect Database"
                        >
                            <i className="fa-solid fa-gear"></i>
                        </button>
                    </div>
                </header>
                <main>
                    {view === 'history' ? (
                        <HistoryView bills={historicalBills} onLoadBill={handleLoadBill} onBack={handleBackToBill} />
                    ) : !bill ? (
                        <BillSetup 
                            onCreateBill={handleCreateBill} 
                            onShowHistory={handleViewHistory}
                            hasHistory={historicalBills.length > 0}
                        />
                    ) : (
                        <BillDetails 
                            bill={bill} 
                            updateBill={updateBill} 
                            billCalculation={billCalculation}
                        />
                    )}
                </main>
                 <footer className="text-center mt-12 text-gray-500 text-sm">
                    <p>Powered by Gemini API & Supabase. Built with React & TypeScript.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
