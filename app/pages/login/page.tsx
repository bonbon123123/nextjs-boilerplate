"use client";
import { useState, useContext } from 'react';
import { SessionContext } from '@/app/invisibleComponents/SessionProvider';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const session = useContext(SessionContext);

    if (!session) {
        throw new Error('Brak dostępu do kontekstu sesji');
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await session.login(username, password);
        } catch (error) {
            setError('Błąd logowania');
        }
    };

    return (
        <div>
            <h1>Logowanie</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Nazwa użytkownika:
                    <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
                </label>
                <br />
                <label>
                    Hasło:
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                </label>
                <br />
                <button type="submit">Zaloguj się</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
};

export default LoginPage;