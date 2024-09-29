"use client";
import { createContext, useState, useEffect } from 'react';
import { ReactNode } from 'react';
import SessionContextValue from '../interfaces/SessionContextValue';

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
    const [votes, setVotes] = useState<{ [id: string]: number }>(() => {
        const votesFromStorage = localStorage.getItem('votes');
        return votesFromStorage ? JSON.parse(votesFromStorage) : {};
    });

    const [savedPosts, setSavedPosts] = useState<Set<string>>(() => {
        const savedPostsFromStorage = localStorage.getItem('savedPosts');
        return savedPostsFromStorage ? JSON.parse(savedPostsFromStorage) : {};
    });

    useEffect(() => {
        console.log(localStorage.getItem('savedPosts'));
        console.log(localStorage.getItem('savedPosts'));
        localStorage.setItem('savedPosts', serializeSavedPosts(savedPosts));
    }, [savedPosts]);


    useEffect(() => {
        localStorage.setItem('votes', JSON.stringify(votes));
    }, [votes]);
    
    const serializeSavedPosts = (savedPosts: Set<string> | string[]) => {
        if (savedPosts instanceof Set) {
            return JSON.stringify(Array.from(savedPosts));
        } else {
            return JSON.stringify(savedPosts);
        }
    };

    const setAll = () => {
        const sessionIdFromStorage = localStorage.getItem('sessionId');
        setSessionId(sessionIdFromStorage);

        const user = localStorage.getItem('userId');
        setUserId(user);

        const userName = localStorage.getItem('userName');
        setUserName(userName);


        const votesFromStorage = localStorage.getItem('votes');
        if (votesFromStorage) {
            try {
                const votes = JSON.parse(votesFromStorage);
                setVotes(votes);
            } catch (error) {
                console.error('Błąd parsowania danych głosów:', error);
            }
        }

        const savedPostsFromStorage = localStorage.getItem('savedPosts');
        if (savedPostsFromStorage) {
            try {
                const parsedSavedPosts = JSON.parse(savedPostsFromStorage);

                // Sprawdzamy, czy dane są tablicą
                if (Array.isArray(parsedSavedPosts)) {
                    setSavedPosts(new Set<string>(parsedSavedPosts));
                } else {
                    // Jeżeli dane są błędne (nie są tablicą), czyścimy je
                    console.error("Dane w localStorage pod 'savedPosts' nie są tablicą:", parsedSavedPosts);
                    localStorage.removeItem('savedPosts');
                    setSavedPosts(new Set<string>());  // Resetujemy do pustego zestawu
                }
            } catch (error) {
                console.error("Błąd parsowania savedPosts:", error);
                localStorage.removeItem('savedPosts');  // Usuwamy uszkodzone dane
                setSavedPosts(new Set<string>());  // Resetujemy do pustego zestawu
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



    const login = async (username: string, password: string) => {
        const user = await authenticate(username, password, false);
        if (user) {
            const votesMap: { [key: string]: number } = {};
            user.votes.forEach((vote: any) => {
                votesMap[vote.postId] = vote.voteValue;
            });
            setSavedPosts(new Set(user.savedPosts));
            setSessionId(user.sessionId);
            setUserId(user.userId);
            setUserName(user.username);
            setVotes(votesMap);
            localStorage.setItem('savedPosts', JSON.stringify(user.savedPosts))
            localStorage.setItem('userId', user.userId);
            localStorage.setItem('userName', user.username);
            localStorage.setItem('sessionId', user.sessionId);
            localStorage.setItem('votes', JSON.stringify(votesMap));
        }
    };

    const logout = () => {
        setSessionId(null);
        setUserId(null);
        setUserName(null);
        setVotes({});
        setSavedPosts(new Set<string>());
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('votes');
        localStorage.removeItem('comments');
        localStorage.removeItem('savedPosts');
    };

    const addSave = (id: string) => {
        setSavedPosts((prevSavedPosts) => {
            const updatedPosts = new Set(prevSavedPosts);
            if (updatedPosts.has(id)) {
                updatedPosts.delete(id);  // Usunięcie id, jeśli już istnieje w savedPosts
            } else {
                updatedPosts.add(id);     // Dodanie id, jeśli jeszcze nie istnieje
            }
            localStorage.setItem('savedPosts', JSON.stringify([...updatedPosts]));  // Konwersja do tablicy przed zapisaniem
            return updatedPosts;
        });
        fetch('/api/mongo/saves', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                postId: id,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                //console.log('Usunięto save:', data);
            })
            .catch((error) => {
                console.error('Błąd usuwania save:', error);
            });
    };

    const getSave = (id: string): boolean => {
        return savedPosts.has(id);  // Sprawdzenie, czy post został zapisany
    };

    const addVote = (id: string, voteValue: number) => {
        const currentVote = getVote(id);
        let newVote = 0;
        if (!currentVote || currentVote == 0) {
            newVote = voteValue
        } else if (currentVote == -voteValue) {
            newVote = -currentVote * 2;
        } else if (currentVote == 1 || currentVote == -1 && voteValue == 0) {
            newVote = (-currentVote);
        }

        setVotes((prevVotes) => {
            const updatedVotes = { ...prevVotes, [id]: voteValue };
            localStorage.setItem('votes', JSON.stringify(updatedVotes));  // Aktualizacja localStorage
            return updatedVotes;
        });



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
        console.log("oddaje taki głos: voteValue")
        console.log(voteValue)
        if (userId != null) {
            let targetId = id
            fetch('/api/mongo/voting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    targetId,
                    voteValue,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    //console.log('Nie error:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);

                });
        }

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
            addVote,
            getVote,
            addSave,
            getSave,
            savedPosts,
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export { SessionProvider, SessionContext };