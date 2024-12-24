"use client";
import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import ImageDisplay from '../../components/ImageDisplay';
import Button from '../../components/Button';


const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  interface ImageDisplayProps {
    image: File;
  }

  const handleImageSubmit = (image: File) => {
    setFiles(files.filter((file) => file !== image));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
    },
    accept: { mimeTypes: ['image/*'] },
    multiple: true,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {

        if (currentIndex === 0) {
          setCurrentIndex(files.length - 1);
        } else {
          setCurrentIndex(Math.max(0, currentIndex - 1));
        }
      } else if (event.key === 'ArrowRight') {
        if (currentIndex === files.length - 1) {
          setCurrentIndex(0);
        } else {
          setCurrentIndex(Math.min(files.length - 1, currentIndex + 1));
        }
      } 
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, files.length]);

  return (
    <div className="mx-auto p-4">
      <h1 className="containerds text-3xl font-bold">Upload Images</h1>
      <div {...getRootProps()} className="bg-gray-100 p-4 rounded-md">
        <input {...getInputProps()} />
        {
          isDragActive ? <p>Drop the files here ...</p> : <p>Drag and drop files here, or click to select files</p>
        }
      </div>
      {files.length > 0 && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => {
              if (currentIndex === 0) {
                setCurrentIndex(files.length - 1);
              } else {
                setCurrentIndex(currentIndex - 1);
              }
            }}
          >
            Previous
          </Button>
          <ImageDisplay image={files[currentIndex]} onImageSubmit={handleImageSubmit} />
          <Button
            onClick={() => {
              if (currentIndex === files.length - 1) {
                setCurrentIndex(0);
              } else {
                setCurrentIndex(Math.min(files.length - 1, currentIndex + 1));
              }
            }}

          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadPage;