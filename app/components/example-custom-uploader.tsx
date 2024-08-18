// Note: `useUploadThing` is IMPORTED FROM YOUR CODEBASE using the `generateReactHelpers` function
import { useDropzone } from "@uploadthing/react";
import { generateClientDropzoneAccept } from "uploadthing/client";

import { useUploadThing } from "@/utils/uploadthing";

export function MultiUploader() {
    const [files, setFiles] = useState<File[]>([]);
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles);
    }, []);

    const { startUpload, permittedFileInfo } = useUploadThing(
        "myUploadEndpoint",
        {
            onClientUploadComplete: () => {
                alert("uploaded successfully!");
            },
            onUploadError: () => {
                alert("error occurred while uploading");
            },
            onUploadBegin: () => {
                alert("upload has begun");
            },
        },
    );

    const fileTypes = permittedFileInfo?.config
        ? Object.keys(permittedFileInfo?.config)
        : [];

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
    });

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            <div>
                {files.length > 0 && (
                    <button onClick={() => startUpload(files)}>
                        Upload {files.length} files
                    </button>
                )}
            </div>
            Drop files here!
        </div>
    );
}