"use client";
import { useState, useContext } from "react";
import { SessionContext } from "@/app/invisibleComponents/SessionProvider";
import { redirect, useRouter } from "next/navigation";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const session = useContext(SessionContext);
  const router = useRouter();

  if (!session) {
    throw new Error("No access to the session context");
  }
  if (session.userName) {
    redirect("/pages/profile");
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await session.login(username, password);
    } catch (error) {
      alert("Incorrect login data");
      setError("Login error");
    }
  };

  const handleRegisterClick = () => {
    router.push("/pages/register");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-base-100">
      <div className="card w-full max-w-md shadow-xl bg-base-200">
        <form onSubmit={handleSubmit} className="card-body">
          <h1 className="card-title text-2xl">Login</h1>

          <div className="form-control mt-2 flex flex-col">
            <label className="label">
              <span className="label-text">Username:</span>
            </label>

            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="input input-bordered"
              placeholder="Enter username"
            />
          </div>

          <div className="form-control mt-2 flex flex-col">
            <label className="label">
              <span className="label-text">Password:</span>
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input input-bordered"
              placeholder="Enter password"
            />
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <div className="form-control mt-4 flex items-center gap-2">
            <button type="submit" className="btn btn-primary">
              Log in
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRegisterClick}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
