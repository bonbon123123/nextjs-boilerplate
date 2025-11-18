"use client";
import { useContext, useState, useEffect } from "react";
import { SessionContext } from "@/app/invisibleComponents/SessionProvider";
import SmallImage from "@/app/components/SmallImage";
import Post from "@/app/interfaces/Post";
import ImageGrid from "@/app/components/ImageGrid";

const UserPage = () => {
  const [activeSection, setActiveSection] = useState("added");
  const [addedImages, setAddedImages] = useState([]);
  const [likedImages, setLikedImages] = useState([]);
  const [savedImages, setSavedImages] = useState([]);
  const sessionContext = useContext(SessionContext);
  if (!sessionContext) {
    throw new Error("Brak dostępu do kontekstu sesji");
  }

  const fetchImages = async (type: string) => {
    console.log({
      userId: sessionContext.userId,
      type: type,
    });
    const response = await fetch("/api/mongo/postsSpecial", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: sessionContext.userId,
        type: type,
      }),
    });
    const data = await response.json();
    return data;
  };

  useEffect(() => {
    if (
      activeSection === "added" ||
      activeSection === "liked" ||
      activeSection === "saved"
    ) {
      handleSectionChange(activeSection);
    }
  }, [activeSection]); // Re-fetch images when active section changes

  useEffect(() => {
    if (
      activeSection === "added" ||
      activeSection === "liked" ||
      activeSection === "saved"
    ) {
      handleSectionChange(activeSection);
    }
  }, [sessionContext.savedPosts, sessionContext.votes]);

  const clickAddedImages = async () => {
    const data = await fetchImages("author");
    setAddedImages(data);
  };

  const clickLikedImages = async () => {
    const data = await fetchImages("liked");
    setLikedImages(data);
  };

  const clickSavedImages = async () => {
    const data = await fetchImages("saved");
    setSavedImages(data);
  };

  const handleSectionChange = (section: "added" | "liked" | "saved") => {
    setActiveSection(section);
    if (section === "added") {
      clickAddedImages();
    } else if (section === "liked") {
      clickLikedImages();
    } else if (section === "saved") {
      clickSavedImages();
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <main className="px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center p-4 border-b border-base-300">
            <div className="avatar">
              <div className="w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {sessionContext.userName?.charAt(0).toUpperCase()}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-base-content ml-4">
              {sessionContext.userName}
            </h1>
          </div>

          <div className="tabs tabs-bordered">
            <button
              className={`tab ${activeSection === "added" ? "tab-active" : ""}`}
              onClick={() => handleSectionChange("added")}
            >
              Dodane
            </button>
            <button
              className={`tab ${activeSection === "liked" ? "tab-active" : ""}`}
              onClick={() => handleSectionChange("liked")}
            >
              Polubione
            </button>
            <button
              className={`tab ${activeSection === "saved" ? "tab-active" : ""}`}
              onClick={() => handleSectionChange("saved")}
            >
              Zapisane
            </button>
          </div>

          <div className="mt-4">
            {activeSection === "added" && <ImageGrid images={addedImages} />}
            {activeSection === "liked" && <ImageGrid images={likedImages} />}
            {activeSection === "saved" && <ImageGrid images={savedImages} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserPage;
