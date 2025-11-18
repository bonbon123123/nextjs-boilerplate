"use client";
import Post from "@/app/interfaces/Post";
import React, { useState, useEffect } from "react";
import SmallImage from "../../components/SmallImage";
import BigImage from "../../components/BigImage";

const SearchPage = () => {
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<Post[][]>([]);
  const [selectedImage, setSelectedImage] = useState<Post | null>(null);
  const [showBigImage, setIsBigImageVisible] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const response = await fetch(`/api/mongo/posts?tags=${tags}`);
    const data = await response.json();
    setImages(data);
    setLoading(false);
  };

  useEffect(() => {
    if (images.length > 0) {
      const columns: Post[][] = [];
      for (let i = 0; i < 4; i++) {
        columns.push([]);
      }
      images.forEach((image, index) => {
        columns[index % 4].push(image);
      });
      setColumns(columns);
    }
  }, [images]);

  const handleSearch = () => {
    fetchImages();
  };

  const handleImageClick = (image: Post) => {
    handleCloseBigImage;
    setSelectedImage(image);
  };

  const handleCloseBigImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-base-100 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 p-4 bg-base-200 rounded-lg shadow-md mb-6">
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Search for tags..."
            className="input input-bordered flex-1"
          />
          <button onClick={handleSearch} className="btn btn-primary">
            Search
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <div className="w-full flex gap-4">
            {columns.map((column, index) => (
              <div key={index} className="w-1/4">
                {column.map((image, index) => (
                  <SmallImage
                    key={index}
                    image={image}
                    onClick={() => handleImageClick(image)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedImage && (
        <BigImage image={selectedImage} onClose={handleCloseBigImage} />
      )}
    </div>
  );
};

export default SearchPage;
