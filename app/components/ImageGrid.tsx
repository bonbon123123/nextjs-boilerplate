// ImageGrid.tsx
import Post from "@/app/interfaces/Post";
import React, { useState, useEffect } from "react";
import SmallImage from "./SmallImage";
import BigImage from "./BigImage";

interface ImageGridProps {
  images: Post[];
}

const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
  const [columns, setColumns] = useState<Post[][]>([]);
  const [selectedImage, setSelectedImage] = useState<Post | null>(null);

  useEffect(() => {
    console.log("Updated images:", images); // Log the incoming images
    if (images.length > 0) {
      const newColumns: Post[][] = Array.from({ length: 4 }, () => []);
      images.forEach((image, index) => {
        newColumns[index % 4].push(image);
      });
      setColumns(newColumns);
    } else {
      setColumns([]);
    }
  }, [images]);

  const handleImageClick = (image: Post) => {
    setSelectedImage(image);
  };

  const handleCloseBigImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="flex">
      {columns.map((column, index) => (
        <div key={index} className="w-1/4">
          {column.map((image) => (
            <SmallImage
              key={image.id} // Use a unique identifier for the key
              image={image}
              onClick={() => handleImageClick(image)}
            />
          ))}
        </div>
      ))}
      {selectedImage && (
        <BigImage image={selectedImage} onClose={handleCloseBigImage} />
      )}
    </div>
  );
};

export default ImageGrid;
