"use client"
import { useContext, useState } from 'react';
import { SessionContext } from '@/app/invisibleComponents/SessionProvider';
import SmallImage from '@/app/components/SmallImage';
import Post from '@/app/interfaces/Post';



const UserPage = () => {
  const session = useContext(SessionContext);
  const [activeSection, setActiveSection] = useState('added');
  const [addedImages, setAddedImages] = useState([]);
  const [likedImages, setLikedImages] = useState([]);
  const [savedImages, setSavedImages] = useState([]);

  if (!session) {
    throw new Error('Brak dostępu do kontekstu sesji');
  }

  const fetchAddedImages = async () => {
    // fetch images added by user from database
    const response = await fetch('/api/images/added');
    const data = await response.json();
    setAddedImages(data);
  };

  const fetchLikedImages = async () => {
    // fetch images liked by user from database
    const response = await fetch('/api/images/liked');
    const data = await response.json();
    setLikedImages(data);
  };

  const fetchSavedImages = async () => {
    // fetch images saved by user from database
    const response = await fetch('/api/images/saved');
    const data = await response.json();
    setSavedImages(data);
  };

  const handleSectionChange = (section: 'added' | 'liked' | 'saved') => {
    setActiveSection(section);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-center items-center bg-light p-4 border-b border-light-main sticky top-0">
        <img src="https://via.placeholder.com/50" alt="Profilowe" className="w-12 h-12 rounded-full mr-4" />
        <h1 className="text-2xl font-bold text-main">{session.userName}</h1>
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
        <div className="flex flex-col p-4">
          {addedImages.map((image: Post) => (
            <SmallImage key={image._id} image={image} />
          ))}
        </div>
      )}
      {activeSection === 'liked' && (
        <div className="flex flex-col p-4">
          {likedImages.map((image: Post) => (
            <SmallImage key={image._id} image={image} />
          ))}
        </div>
      )}
      {activeSection === 'saved' && (
        <div className="flex flex-col p-4">
          {savedImages.map((image: Post) => (
            <SmallImage key={image._id} image={image} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPage;