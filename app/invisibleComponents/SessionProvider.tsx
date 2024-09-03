"use client";
import { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ReactNode } from 'react';

interface SessionContextValue {
    sessionId: string | null;
    user: any; // do dodania
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    votes: { [id: string]: number };
    addVote: (id: string, vote: number) => void;
    getVote: (id: string) => number | null;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const authenticate = async (username: string, password: string) => {

    const response = await fetch('/api/authenticate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const userData = await response.json();
        return userData;
    } else {
        return null;
    }
};

const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [user, setUser] = useState(null);
    const [votes, setVotes] = useState<{ [id: string]: number }>({});

    useEffect(() => {
        const sessionIdFromStorage = localStorage.getItem('sessionId');
        if (sessionIdFromStorage) {
            setSessionId(sessionIdFromStorage);
        } else {
            const newSessionId = uuidv4();
            setSessionId(newSessionId);
            localStorage.setItem('sessionId', newSessionId);
        }
        const votesFromStorage = localStorage.getItem('votes');
        if (votesFromStorage) {
            const votes = JSON.parse(votesFromStorage);
            if (Object.keys(votes).length > 0) {
                setVotes(votes);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('votes', JSON.stringify(votes));
    }, [votes]);

    const login = async (username: string, password: string) => {
        // Implementation of login
        const user = await authenticate(username, password);
        if (user) {
            const sessionId = uuidv4();
            setSessionId(sessionId);
            setUser(user);
            localStorage.setItem('sessionId', sessionId);
            localStorage.setItem('user', JSON.stringify(user));
        }
    };

    const logout = () => {
        setSessionId(null);
        setUser(null);
        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
    };

    const addVote = (id: string, vote: number) => {
        setVotes((prevVotes) => ({ ...prevVotes, [id]: vote }));
        localStorage.setItem('votes', JSON.stringify(votes));
    };

    const getVote = (id: string) => {
        console.log(votes)
        if (Object.keys(votes).length === 0) {
            return null;
        }
        return votes[id];
    };

    return (
        <SessionContext.Provider value={{
            sessionId,
            user,
            login,
            logout,
            votes,
            addVote,
            getVote,
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export { SessionProvider, SessionContext };