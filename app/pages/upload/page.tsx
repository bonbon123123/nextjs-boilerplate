"use client";
import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import ImageDisplay from "../../components/ImageDisplay";
import Button from "../../components/Button";

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
    accept: { mimeTypes: ["image/*"] },
    multiple: true,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        if (currentIndex === 0) {
          setCurrentIndex(files.length - 1);
        } else {
          setCurrentIndex(Math.max(0, currentIndex - 1));
        }
      } else if (event.key === "ArrowRight") {
        if (currentIndex === files.length - 1) {
          setCurrentIndex(0);
        } else {
          setCurrentIndex(Math.min(files.length - 1, currentIndex + 1));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, files.length]);

  return (
    <div className="min-h-screen bg-base-100 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-base-content">
          Upload Images
        </h1>

        <div
          {...getRootProps()}
          className={`card shadow-lg p-8 border-2 border-dashed mb-6 cursor-pointer transition-all ${
            isDragActive
              ? "border-primary bg-primary bg-opacity-10"
              : "border-base-300 bg-base-200"
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            {isDragActive ? (
              <p className="text-lg text-primary font-semibold">
                Drop the files here ...
              </p>
            ) : (
              <>
                <p className="text-lg font-semibold mb-2">
                  Drag and drop files here
                </p>
                <p className="text-sm text-base-content opacity-60">
                  or click to select files
                </p>
              </>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <div className="card shadow-lg bg-base-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold">
                File {currentIndex + 1} of {files.length}
              </span>
              <progress
                value={currentIndex + 1}
                max={files.length}
                className="progress progress-primary flex-1 mx-4"
              ></progress>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  if (currentIndex === 0) {
                    setCurrentIndex(files.length - 1);
                  } else {
                    setCurrentIndex(currentIndex - 1);
                  }
                }}
              >
                ← Previous
              </Button>

              <div className="flex-1">
                <ImageDisplay
                  image={files[currentIndex]}
                  onImageSubmit={handleImageSubmit}
                />
              </div>

              <Button
                onClick={() => {
                  if (currentIndex === files.length - 1) {
                    setCurrentIndex(0);
                  } else {
                    setCurrentIndex(
                      Math.min(files.length - 1, currentIndex + 1)
                    );
                  }
                }}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
