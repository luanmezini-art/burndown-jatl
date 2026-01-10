import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, ArrowRight } from 'lucide-react';

export function Login() {
    const { login } = useApp();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = login(pin);
        if (!success) {
            setError(true);
            setPin('');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 text-monday-blue rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock size={32} />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Willkommen</h1>
                <p className="text-gray-500 mb-8">Bitte geben Sie den Zugangscode ein.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            inputMode="numeric"
                            autoFocus
                            maxLength={4}
                            value={pin}
                            onChange={(e) => {
                                setError(false);
                                setPin(e.target.value.slice(0, 4));
                            }}
                            className={`w-48 text-center text-3xl tracking-[0.5em] font-bold py-3 border-b-2 bg-transparent outline-none transition-colors
                                ${error ? 'border-red-500 text-red-500 placeholder-red-300' : 'border-gray-200 text-gray-800 focus:border-monday-blue'}
                            `}
                            placeholder="••••"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 font-medium animate-pulse">
                            Falscher Code. Bitte erneut versuchen.
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={pin.length < 4}
                        className="w-full bg-monday-blue hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Anmelden <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
