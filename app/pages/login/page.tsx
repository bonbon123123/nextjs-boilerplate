"use client";
import { useState, useContext } from "react";
import { SessionContext } from "@/app/invisibleComponents/SessionProvider";
import { redirect } from "next/navigation";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error("Brak dostępu do kontekstu sesji");
  }
  if (session.userName) {
    redirect("/pages/profile");
  }
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await session.login(username, password);
    } catch (error) {
      alert("złe dane logowania");
      setError("Błąd logowania");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-light">
      <div className="max-w-md w-full p-4 bg-white rounded shadow-md border border-light-main">
        <h1 className="text-3xl font-bold mb-4 text-main">Logowanie</h1>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="block mb-2">
            Nazwa użytkownika:
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full p-2 pl-10 text-sm text-dark border border-light-main rounded"
            />
          </label>
          <br />
          <label className="block mb-2">
            Hasło:
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full p-2 pl-10 text-sm text-dark border border-light-main rounded"
            />
          </label>
          <br />
          <button
            type="submit"
            className="bg-main hover:bg-light-main text-white font-bold py-2 px-4 rounded"
          >
            Zaloguj się
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
