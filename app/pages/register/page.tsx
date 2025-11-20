"use client";
import { useState, useContext } from "react";
import { SessionContext } from "@/app/invisibleComponents/SessionProvider";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("No access to session context");
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/mongo/userOperations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error creating account");
        return;
      }

      // AUTO LOGIN
      session.login(username, password);
    } catch (err) {
      setError("Error creating account");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-base-100">
      <div className="card w-full max-w-md shadow-xl bg-base-200">
        <form onSubmit={handleSubmit} className="card-body">
          <h1 className="card-title text-2xl mb-4">Create Account</h1>

          <div className="form-control mt-2 flex flex-col">
            <label className="label">
              <span className="label-text">Username:</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-control mt-2 flex flex-col">
            <label className="label">
              <span className="label-text">Email:</span>
            </label>
            <input
              type="email"
              className="input input-bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-control mt-2 flex flex-col">
            <label className="label">
              <span className="label-text">Password:</span>
            </label>
            <input
              type="password"
              className="input input-bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <p className="text-error mt-2">{error}</p>}

          <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary">
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
