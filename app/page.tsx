import Image from "next/image";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import ImageUpload from "./components/image_upload";

const f = createUploadthing();


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Main</h1>
      <ImageUpload />
    </main>
  );
}
