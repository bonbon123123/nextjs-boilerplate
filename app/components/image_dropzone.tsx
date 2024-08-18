"use client";
import { UploadDropzone } from "@uploadthing/react";

import { OurFileRouter } from "../api/uploadthing/core";

export const UploadZone = () => (
    <UploadDropzone<OurFileRouter, "imageUploader">
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
            // Do something with the response
            console.log("Files: ", res);
            alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`);
        }}
        onUploadBegin={(name) => {
            // Do something once upload begins
            console.log("Uploading: ", name);
        }}
        onDrop={(acceptedFiles) => {
            // Do something with the accepted files
            console.log("Accepted files: ", acceptedFiles);
        }}
    />
);