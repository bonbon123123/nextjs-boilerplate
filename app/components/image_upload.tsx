"use client";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "../api/uploadthing/core";
import { useState } from "react";
import Image from "next/image";

const ImageUpload = () => {
  const [imageUrl, setImageUrl] = useState<string>("");
  return (
    <div>
      <UploadButton<OurFileRouter, "imageUploader">
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          setImageUrl(res[0].url);
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
        onBeforeUploadBegin={(files) => {
          // Preprocess files before uploading (e.g. rename them)
          return files.map(
            (f) => new File([f], "renamed-" + f.name, { type: f.type }),
          );
        }}
        onUploadBegin={(name) => {
          // Do something once upload begins
          console.log("Uploading: ", name);
        }}
      />
      {imageUrl.length ? (
        <div>
          <Image src={imageUrl} alt="myImage" width={500} height={500} />
        </div>
      ) : null}
    </div>
  );
};

export default ImageUpload;
