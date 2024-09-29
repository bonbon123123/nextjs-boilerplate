"use client"
import { useContext, useState, useEffect } from 'react';
import { SessionContext } from '@/app/invisibleComponents/SessionProvider';
import SmallImage from '@/app/components/SmallImage';
import Post from '@/app/interfaces/Post';
import ImageGrid from '@/app/components/ImageGrid';


const UserPage = () => {
  const [activeSection, setActiveSection] = useState('added');
  const [addedImages, setAddedImages] = useState([]);
  const [likedImages, setLikedImages] = useState([]);
  const [savedImages, setSavedImages] = useState([]);
  const sessionContext = useContext(SessionContext);
  if (!sessionContext) {
    throw new Error('Brak dostępu do kontekstu sesji');
  }

  const fetchImages = async (type: string) => {
    console.log({
      userId: sessionContext.userId,
      type: type,
    })
    const response = await fetch('/api/mongo/postsSpecial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    if (activeSection === "added" || activeSection === "liked" || activeSection === "saved") {
      handleSectionChange(activeSection);
    }
  }, [activeSection]); // Re-fetch images when active section changes


  useEffect(() => {
    if (activeSection === "added" || activeSection === "liked" || activeSection === "saved") {
      handleSectionChange(activeSection);
    }
  }, [sessionContext.savedPosts, sessionContext.votes]);

  const clickAddedImages = async () => {
    const data = await fetchImages('author');
    setAddedImages(data);
  };

  const clickLikedImages = async () => {
    const data = await fetchImages('liked');
    setLikedImages(data);
  };

  const clickSavedImages = async () => {
    const data = await fetchImages('saved');
    setSavedImages(data);
  };

  const handleSectionChange = (section: 'added' | 'liked' | 'saved') => {
    setActiveSection(section);
    if (section === 'added') {
      clickAddedImages();
    } else if (section === 'liked') {
      clickLikedImages();
    } else if (section === 'saved') {
      clickSavedImages();
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-center items-center bg-light p-4 border-b border-light-main sticky top-0">
        <img src="https://via.placeholder.com/50" alt="Profilowe" className="w-12 h-12 rounded-full mr-4" />
        <h1 className="text-2xl font-bold text-main">{sessionContext.userName}</h1>
      </div>
      <div className="flex justify-center items-center bg-light p-4 border-b border-light-main sticky top-14">
        <button
          className={`w-1/3 py-2 text-sm text-dark ${activeSection === 'added' ? 'bg-main text-white' : 'bg-white border border-light-main'}`}
          onClick={() => handleSectionChange('added')}
        >
          Dodane
        </button>
        <button
          className={`w-1/3 py-2 text-sm text-dark ${activeSection === 'liked' ? 'bg-main text-white' : 'bg-white border border-light-main'}`}
          onClick={() => handleSectionChange('liked')}
        >
          Polubione
        </button>
        <button
          className={`w-1/3 py-2 text-sm text-dark ${activeSection === 'saved' ? 'bg-main text-white' : 'bg-white border border-light-main'}`}
          onClick={() => handleSectionChange('saved')}
        >
          Zapisane
        </button>
      </div>
      {activeSection === 'added' && (
        <ImageGrid
          images={addedImages}
        />
      )}
      {activeSection === 'liked' && (
        <ImageGrid
          images={likedImages}
        />
      )}
      {activeSection === 'saved' && (
        <ImageGrid
          images={savedImages}
        />
      )}
    </div>
  );
};

export default UserPage;