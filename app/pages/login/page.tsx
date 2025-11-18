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
    <div className="min-h-screen flex justify-center items-center bg-base-100">
      <div className="card w-full max-w-md shadow-xl bg-base-200">
        <form onSubmit={handleSubmit} className="card-body">
          <h1 className="card-title text-2xl mb-4">Logowanie</h1>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Nazwa użytkownika:</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="input input-bordered"
              placeholder="Wpisz nazwę użytkownika"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Hasło:</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input input-bordered"
              placeholder="Wpisz hasło"
            />
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary">
              Zaloguj się
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
