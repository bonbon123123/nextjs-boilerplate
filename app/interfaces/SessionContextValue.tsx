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

export default SessionContextValue;