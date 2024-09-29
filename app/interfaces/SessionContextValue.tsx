interface SessionContextValue {
    sessionId: string | null;
    userId: string | null;
    userName: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    votes: { [id: string]: number };
    addVote: (id: string, vote: number) => void;
    getVote: (id: string) => number | null;
    addSave: (id: string) => void;
    getSave: (id: string) => boolean | null;
    savedPosts: Set<string>;
}

export default SessionContextValue;