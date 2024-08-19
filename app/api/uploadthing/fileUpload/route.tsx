import { utapi } from "@/utils/uploadthing";

async function uploadFiles(formData: FormData) {
    "use server";

    // Get all files from the form data
    const files = formData.getAll("files")
        .filter((file): file is File => file instanceof File); // Filter to ensure they are File objects

    // Upload the files
    const response = await utapi.uploadFiles(files);

    return response;
}

function MyForm() {
    return (
        <form action={uploadFiles}>
            <input name="files" type="file" multiple />
            <button type="submit">Upload</button>
        </form>
    );
}

export default MyForm;
