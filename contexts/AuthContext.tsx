import React, { useState, createContext, useContext, useMemo, useEffect } from 'react';
import { User } from '../types.ts';
import { api } from '../services/api.real';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = api.onAuthStateChanged(firebaseUser => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async (identifier: string, pass: string) => {
        const loggedInUser = await api.login(identifier, pass);
        setUser(loggedInUser);
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
    };

    const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};