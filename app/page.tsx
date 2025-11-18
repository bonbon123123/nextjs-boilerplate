"use client";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { DropImageUploader } from "./components/image_dropzone";
import { useContext, useState, useEffect } from "react";
import { SessionContext } from "./invisibleComponents/SessionProvider";
const f = createUploadthing();

export default function MainPage() {
  const { sessionId, userName, userId } = useContext(SessionContext) || {};
  const [votes, setVotes] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    const votesFromStorage = localStorage.getItem("votes");
    if (votesFromStorage) {
      const votes = JSON.parse(votesFromStorage);
      setVotes(votes);
    }
  }, []);

  return (
    <main className="min-h-screen bg-base-100 px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-base-content">
          Welcome to Specs
        </h1>

        <div className="card bg-base-200 shadow-lg mb-8 p-6">
          <h2 className="text-2xl font-semibold mb-4">Session Information</h2>
          <div className="space-y-2 text-base-content">
            <p>
              <span className="font-semibold">Session ID:</span>{" "}
              {sessionId || "Not available"}
            </p>
            <p>
              <span className="font-semibold">User:</span>{" "}
              {userName ? userName : "Not logged in"}
            </p>
            <p>
              <span className="font-semibold">User ID:</span>{" "}
              {userId ? userId : "Not logged in"}
            </p>
          </div>
        </div>

        {Object.keys(votes).length > 0 && (
          <div className="card bg-base-200 shadow-lg mb-8 p-6">
            <h2 className="text-2xl font-semibold mb-4">Your Votes</h2>
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-b border-base-300">
                    <th className="text-base-content">Post ID</th>
                    <th className="text-base-content">Vote</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(votes).map((id, index) => (
                    <tr
                      key={index}
                      className="border-b border-base-300 hover:bg-base-300"
                    >
                      <td className="text-sm">{id}</td>
                      <td>
                        <span
                          className={`badge ${
                            votes[id] === 1
                              ? "badge-success"
                              : votes[id] === -1
                              ? "badge-error"
                              : "badge-neutral"
                          }`}
                        >
                          {votes[id] === 1
                            ? "👍"
                            : votes[id] === -1
                            ? "👎"
                            : "○"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="card bg-base-200 shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Upload Images</h2>
          <DropImageUploader />
        </div>
      </div>
    </main>
  );
}
