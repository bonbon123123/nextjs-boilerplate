"use server";
import { utapi } from "@/utils/uploadthing";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        console.log(formData);
        if (!formData) {
            throw new Error("FormData is required");
        }
        const tags = formData.getAll("tags").map(tag => {
            if (typeof tag === "string") {
                return JSON.parse(tag);
            } else {
                throw new Error("Invalid tag type");
            }
        });

        const files = formData.getAll("files").filter((value): value is File => value instanceof File);
        const response = await utapi.uploadFiles(files);
        console.log(tags)
        console.log(tags[0])

        const post = {
            url: response[0].data?.url,
            tags: tags[0],
            upvotes: 0,
            downvotes: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            Locked: false,
            Name: response[0].data?.name,
            Size: response[0].data?.size,
            Type: response[0].data?.type,
        };
        try {
            const url = new URL('/api/mongo/posts', req.url);
            const responseMongo = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(post),
            });
            const data = await responseMongo.json();
            console.log(data);
        } catch (error) {
            console.error(error);
            return NextResponse.json({ error: "Error uploading files" });
        }
        return NextResponse.json({ message: "Files uploaded successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error uploading files" });
    }
}

export async function GET() {

    return NextResponse.json({ message: "GET request received" });

}