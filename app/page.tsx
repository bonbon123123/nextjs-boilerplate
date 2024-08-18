import Image from "next/image";
import Link from "next/link";
import ImageUpload from "./components/image_upload";
import './globals.css';
import { UploadZone } from "./components/image_dropzone";
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">


      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold underline mb-8">Hello world!</h1>
        <UploadZone />
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 p-4 text-center text-white">
        <p>&copy; {new Date().getFullYear()} MySite. All rights reserved.</p>
      </footer>
    </div>
  );
}
