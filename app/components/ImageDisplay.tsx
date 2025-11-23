import React, { useContext, useState, useEffect } from "react";
import Button from "./Button";
import Image from "next/image";
import { SessionContext } from "../invisibleComponents/SessionProvider";
import TagInput from "./TagInput";

interface ImageDisplayProps {
  image: File;
  onImageSubmit: (image: File) => void;
  tags: string[];
  onTagsChange: (image: File, newTags: string[]) => void;
}

interface PredictedTag {
  tag: string;
  confidence: number;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  image,
  onImageSubmit,
  tags,
  onTagsChange,
}) => {
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiTagging, setAiTagging] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<PredictedTag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { userId } = useContext(SessionContext) || {};

  const ML_SERVICE_URL =
    process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://localhost:8000";

  useEffect(() => {
    const img = document.createElement("img");
    img.onload = () => {
      setImageWidth(img.width);
      setImageHeight(img.height);
    };
    img.src = URL.createObjectURL(image);

    return () => URL.revokeObjectURL(img.src);
  }, [image]);

  const handleAITagging = async () => {
    setAiTagging(true);
    setSuggestedTags([]);
    setShowSuggestions(false);

    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("threshold", "0.3"); // Próg pewności
      formData.append("top_k", "20"); // Top 20 sugestii

      const response = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`ML Service error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const allSuggestions = [
          ...data.confident_tags,
          ...data.suggested_tags.filter(
            (st: PredictedTag) =>
              !data.confident_tags.find((ct: PredictedTag) => ct.tag === st.tag)
          ),
        ];

        setSuggestedTags(allSuggestions);
        setShowSuggestions(true);

        // Automatycznie dodaj tagi z wysoką pewnością (>0.7)
        const autoTags = data.confident_tags
          .filter((t: PredictedTag) => t.confidence > 0.7)
          .map((t: PredictedTag) => t.tag);

        if (autoTags.length > 0) {
          const newTags = [...new Set([...tags, ...autoTags])];
          onTagsChange(image, newTags);
        }
      }
    } catch (error) {
      console.error("AI tagging error:", error);
      alert(
        "Failed to get AI suggestions. Please check if ML service is running."
      );
    } finally {
      setAiTagging(false);
    }
  };

  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      onTagsChange(image, [...tags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (tags.length === 0) {
      alert("Please add at least one tag before uploading");
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append("files", image);
    formData.append("width", imageWidth.toString());
    formData.append("height", imageHeight.toString());
    if (userId) formData.append("userId", userId.toString());
    formData.append("tags", JSON.stringify(tags));

    try {
      setUploadProgress(30);

      const response = await fetch("/api/uploadthing/fileUpload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(80);

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      console.log(data);

      setUploadProgress(100);
      onImageSubmit(image);
    } catch (error) {
      console.error(error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-base-200 w-full flex flex-col items-center card shadow-lg">
      {/* Image */}
      <div className="w-full h-[50%] flex justify-center items-center p-4">
        <Image
          src={URL.createObjectURL(image)}
          width={imageWidth || 500}
          height={imageHeight || 500}
          alt={image.name}
          className="max-w-full max-h-full object-contain"
          unoptimized
        />
      </div>

      {/* Info */}
      <div className="w-full px-4 py-2">
        <div className="flex justify-center gap-2  opacity-70">
          <div>
            <span>Size:</span> {(image.size * 0.000000125).toFixed(2)} MB
          </div>
          <div>
            <span>Dimensions:</span> {imageWidth} × {imageHeight}
          </div>
        </div>
      </div>

      {/* AI Tagging Button */}
      <div className="w-full px-4 py-2">
        <Button
          onClick={handleAITagging}
          disabled={aiTagging || uploading}
          className="btn-secondary w-full"
        >
          {aiTagging ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              AI Analyzing...
            </>
          ) : (
            <>🤖 Get AI Tag Suggestions</>
          )}
        </Button>
      </div>

      {/* AI Suggestions */}
      {showSuggestions && suggestedTags.length > 0 && (
        <div className="w-full px-4 py-2 max-h-32 overflow-y-auto border border-primary rounded-lg bg-base-300">
          <p className="text-xs font-semibold mb-2 opacity-70">
            AI Suggestions (click to add):
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((predicted, idx) => {
              const isAdded = tags.includes(predicted.tag);
              const confidenceColor =
                predicted.confidence > 0.7
                  ? "badge-success"
                  : predicted.confidence > 0.5
                  ? "badge-warning"
                  : "badge-ghost";

              return (
                <button
                  key={idx}
                  onClick={() => addSuggestedTag(predicted.tag)}
                  disabled={isAdded}
                  className={`badge ${confidenceColor} ${
                    isAdded ? "opacity-50" : "cursor-pointer hover:scale-110"
                  } transition-transform`}
                  title={`Confidence: ${(predicted.confidence * 100).toFixed(
                    1
                  )}%`}
                >
                  {predicted.tag} {isAdded && "✓"}
                  <span className="ml-1 text-xs opacity-70">
                    {(predicted.confidence * 100).toFixed(0)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="w-full flex-1 px-4 py-2 overflow-y-auto">
        <TagInput
          tags={tags}
          onChange={(newTags) => onTagsChange(image, newTags)}
          showSpecialTags={true}
        />
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="w-full px-4 py-2">
          <progress
            className="progress progress-primary w-full"
            value={uploadProgress}
            max={100}
          ></progress>
          <p className="text-xs text-center opacity-70 mt-1">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="w-full flex items-center gap-2 px-4 py-3 border-t border-base-300">
        <Button
          onClick={handleSubmit}
          disabled={uploading || tags.length === 0}
          className="btn-primary flex-1"
        >
          {uploading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Uploading...
            </>
          ) : (
            "Upload & Next"
          )}
        </Button>
        <Button
          onClick={() => onImageSubmit(image)}
          disabled={uploading}
          className="btn-ghost"
        >
          Skip
        </Button>
      </div>

      {tags.length === 0 && !uploading && (
        <p className="text-xs text-center opacity-70 pb-2">
          Add at least one tag to enable upload
        </p>
      )}
    </div>
  );
};

export default ImageDisplay;
