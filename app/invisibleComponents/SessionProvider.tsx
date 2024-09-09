"use client";
import { createContext, useState, useEffect } from 'react';
import { ReactNode } from 'react';

interface SessionContextValue {
    sessionId: string | null;
    userId: string | null;
    userName: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    votes: { [id: string]: number };
    comments: { [id: string]: number };
    addVote: (id: string, vote: number) => void;
    getVote: (id: string) => number | null;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const authenticate = async (username: string, password: string, isAnonymous: boolean) => {
    const response = await fetch('/api/mongo/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, isAnonymous }),
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
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [votes, setVotes] = useState<{ [id: string]: number }>({});
    const [comments, commentsVotes] = useState<{ [id: string]: number }>({});


    const setAll = () => {
        const sessionIdFromStorage = localStorage.getItem('sessionId');
        setSessionId(sessionIdFromStorage);
        const user = localStorage.getItem('userId');
        setUserId(user);
        const userName = localStorage.getItem('userName');
        setUserName(userName);

        const commentsFromStorage = localStorage.getItem('comments');
        if (commentsFromStorage) {
            const comments = JSON.parse(commentsFromStorage);
            if (Object.keys(comments).length > 0) {
                commentsVotes(comments);
            }
        }
        const votesFromStorage = localStorage.getItem('votes');
        if (votesFromStorage) {
            try {
                const votes = JSON.parse(votesFromStorage);
                if (Object.keys(votes).length > 0) {
                    setVotes(votes);
                }
            } catch (error) {
                console.error('Błąd parsowania danych:', error);
            }
        }
    };


    useEffect(() => {
        const sessionIdFromStorage = localStorage.getItem('sessionId');
        if (sessionIdFromStorage && sessionIdFromStorage != "null" && sessionIdFromStorage != "[object Object]") {

            setAll()
        } else {

            authenticate("anon", "anon", true).then((body) => {
                setSessionId(body.sessionId);
                localStorage.setItem('sessionId', body.sessionId);
            });
        }

    }, []);

    useEffect(() => {
        localStorage.setItem('votes', JSON.stringify(votes));
    }, [votes]);

    const login = async (username: string, password: string) => {
        const user = await authenticate(username, password, false);
        if (user) {
            console.log(user)
            setSessionId(user.sessionId);
            setUserId(user.userId);
            setUserName(user.username);
            setVotes(user.votes);
            commentsVotes(user.comments);
            localStorage.setItem('userId', user.userId);
            localStorage.setItem('userName', user.username);
            localStorage.setItem('sessionId', user.sessionId);
            localStorage.setItem('votes', user.votes);
            localStorage.setItem('comments', user.comments);
        }
    };

    const logout = () => {
        setSessionId(null);
        setUserId(null);
        setUserName(null);
        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
    };


    const addVoteInDb = async (targetType: string, imageId: string, commentId: string, vote: number) => {
        await fetch('/api/mongo/voting', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                targetType,
                commentId,
                imageId,
                vote,
            }),
        });
    };

    const addVote = (id: string, vote: number) => {
        setVotes((prevVotes) => ({ ...prevVotes, [id]: vote }));
        localStorage.setItem('votes', JSON.stringify(votes));

    };

    const addVote2 = (id: string, voteValue: number) => {
        const currentVote = getVote(id);
        let newVote = 0;

        if (currentVote !== null && currentVote !== undefined && typeof currentVote === 'number') {
            newVote = currentVote + voteValue;
        } else {
            newVote = voteValue;
        }

        setVotes((prevVotes) => ({ ...prevVotes, [id]: newVote }));
        localStorage.setItem('votes', JSON.stringify(votes));

        // Update the vote count in the database
        fetch('/api/mongo/posts', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: id, vote: newVote }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error updating vote: ${response.status}`);
                }
            })
            .catch(error => console.error(error));
    };

    const getVote = (id: string) => {

        if (Object.keys(votes).length > 0) {
            return votes[id];
        } else {
            return null;
        }
    };

    return (
        <SessionContext.Provider value={{
            sessionId,
            userId,
            userName,
            login,
            logout,
            votes,
            comments,
            addVote,
            getVote,
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export { SessionProvider, SessionContext };