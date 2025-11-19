"use client";
import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import ImageDisplay from "../../components/ImageDisplay";
import Button from "../../components/Button";

interface FileWithTags {
  file: File;
  tags: string[];
}

const UploadPage = () => {
  const [files, setFiles] = useState<FileWithTags[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageSubmit = (fileToRemove: File) => {
    const newFiles = files.filter((f) => f.file !== fileToRemove);
    setFiles(newFiles);
    if (currentIndex >= newFiles.length && newFiles.length > 0) {
      setCurrentIndex(newFiles.length - 1);
    } else if (newFiles.length === 0) {
      setCurrentIndex(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((f) => ({ file: f, tags: [] }));
      setFiles((prev) => [...prev, ...newFiles]);
    },
    accept: { "image/*": [] },
    multiple: true,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (files.length === 0) return;
      const activeElement = document.activeElement;
      if (
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA"
      )
        return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setCurrentIndex(
          currentIndex === 0 ? files.length - 1 : currentIndex - 1
        );
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setCurrentIndex(
          currentIndex === files.length - 1 ? 0 : currentIndex + 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, files.length]);

  const updateTags = (file: File, newTags: string[]) => {
    setFiles((prev) =>
      prev.map((f) => (f.file === file ? { ...f, tags: newTags } : f))
    );
  };

  const clearAllFiles = () => {
    if (confirm(`Remove all ${files.length} files?`)) {
      setFiles([]);
      setCurrentIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-base-content">
            Upload Images
          </h1>
          {files.length > 0 && (
            <button onClick={clearAllFiles} className="btn btn-error btn-sm">
              Clear All ({files.length})
            </button>
          )}
        </div>

        {/* Dropzone */}
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
                  Drag and drop images here
                </p>
                <p className="text-sm text-base-content opacity-60">
                  or click to select files
                </p>
              </>
            )}
          </div>
        </div>

        {/* Image Display */}
        {files.length > 0 && (
          <div className="card shadow-lg bg-base-200 p-4">
            {/* Progress */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold">
                Image {currentIndex + 1} of {files.length}
              </span>
              <progress
                value={currentIndex + 1}
                max={files.length}
                className="progress progress-primary flex-1 mx-4"
              ></progress>
              <span className="text-xs opacity-70">
                {files.length - currentIndex - 1} remaining
              </span>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() =>
                  setCurrentIndex(
                    currentIndex === 0 ? files.length - 1 : currentIndex - 1
                  )
                }
              >
                ← Previous
              </Button>

              <div className="flex-1">
                <ImageDisplay
                  key={`${files[currentIndex].file.name}-${currentIndex}`}
                  image={files[currentIndex].file}
                  tags={files[currentIndex].tags}
                  onTagsChange={(file, newTags) => {
                    setFiles((prev) =>
                      prev.map((f) =>
                        f.file === file ? { ...f, tags: newTags } : f
                      )
                    );
                  }}
                  onImageSubmit={handleImageSubmit}
                />
              </div>

              <Button
                onClick={() =>
                  setCurrentIndex(
                    currentIndex === files.length - 1 ? 0 : currentIndex + 1
                  )
                }
              >
                Next →
              </Button>
            </div>
          </div>
        )}

        {files.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg opacity-70">
              No images selected. Drag and drop above to start.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
