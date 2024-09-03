'use client';
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { DropImageUploader } from "./components/image_dropzone";
import { useContext, useState, useEffect } from "react";
import { SessionContext } from "./invisibleComponents/SessionProvider";
const f = createUploadthing();

export default function SpecsPage() {
  const { sessionId, user } = useContext(SessionContext) || {};
  const [votes, setVotes] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    const votesFromStorage = localStorage.getItem('votes');
    if (votesFromStorage) {
      const votes = JSON.parse(votesFromStorage);
      setVotes(votes);
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Main</h1>
      <p>Sesja ID: {sessionId}</p>
      <p>Użytkownik: {user ? JSON.stringify(user) : 'Nie zalogowany'}</p>
      <h2>Głosy:</h2>
      <ul>
        {Object.keys(votes).map((id, index) => (
          <li key={index}>
            <p>ID: {id}</p>
            <p>Głos: {votes[id]}</p>
          </li>
        ))}
      </ul>
      <DropImageUploader />
    </main>
  );
}