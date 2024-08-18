"use client";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "../api/uploadthing/core";

const ImageUpload = () => {
    return (
        <UploadButton<OurFileRouter, "imageUploader">
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
                // Do something with the response
                console.log("Files: ", res);
                alert("Upload Completed");
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
    );
};

export default ImageUpload;
