import { NextResponse } from "next/server";
import Post from "../models/Post";
import User from "../models/User";
import dbConnect from "../db";

export async function GET(req: Request) {
  await dbConnect();
  console.log("hit db connect", new Date().getSeconds());

  const url = new URL(req.url);

  const tagsParam = url.searchParams.get("tags");
  const excludedTagsParam = url.searchParams.get("excludedTags");
  const matchAll = url.searchParams.get("matchAll") === "true";
  const matchExcludedAll = url.searchParams.get("matchExcludedAll") === "true";
  const specialTagsParam = url.searchParams.get("specialTags");
  const sortBy = url.searchParams.get("sortBy");
  const sortOrder = url.searchParams.get("sortOrder") || "desc";
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");

  try {
    const query: any = {};
    console.log(matchAll, tagsParam);
    console.log(matchExcludedAll, excludedTagsParam);
    // Filtrowanie tagów normalnych
    if (tagsParam) {
      const tags = tagsParam.split(",").map((t) => t.trim());
      if (tags.length > 0) {
        if (matchAll) {
          query.tags = { $all: tags };
        } else {
          query.tags = { $in: tags };
        }
      }
    }

    if (excludedTagsParam) {
      const excludedTags = excludedTagsParam.split(",").map((t) => t.trim());
      if (excludedTags.length > 0) {
        if (!query.$and) query.$and = [];

        if (matchExcludedAll) {
          query.$and.push({ tags: { $nin: excludedTags } });
        } else {
          excludedTags.forEach((tag) => {
            query.$and.push({ tags: { $ne: tag } });
          });
        }
      }
    }

    if (specialTagsParam) {
      try {
        const specialTags = JSON.parse(specialTagsParam);

        Object.entries(specialTags).forEach(([prefix, value]) => {
          const specialTag = `${prefix}:${value}`;

          if (prefix === "danger" && value === "sfw") {
            // Obsługa sfw: include sfw i brak nsfw
            if (!query.$and) query.$and = [];
            query.$and.push({
              $or: [
                { tags: { $nin: ["danger:nsfw"] } },
                { tags: { $in: ["danger:sfw"] } },
              ],
            });
          } else {
            if (!query.$and) query.$and = [];
            query.$and.push({ tags: { $all: [specialTag] } });
          }
        });
      } catch (e) {
        console.error("Error parsing specialTags:", e);
      }
    }

    // Filtrowanie  datach
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    let postsQuery = Post.find(query);

    // Sortowanie
    if (sortBy === "votes") {
      postsQuery = postsQuery.sort(
        sortOrder === "asc"
          ? { upvotes: 1, downvotes: -1 }
          : { upvotes: -1, downvotes: 1 }
      );
    } else if (sortBy === "date") {
      postsQuery = postsQuery.sort({
        createdAt: sortOrder === "asc" ? 1 : -1,
      });
    } else {
      postsQuery = postsQuery.sort({ createdAt: -1 });
    }

    postsQuery = postsQuery.limit(100).lean();

    const posts = await postsQuery;

    if (sortBy === "votes") {
      posts.sort((a, b) => {
        const scoreA = a.upvotes - a.downvotes;
        const scoreB = b.upvotes - b.downvotes;
        return sortOrder === "asc" ? scoreA - scoreB : scoreB - scoreA;
      });
    }

    return new NextResponse(JSON.stringify(posts), { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error fetching posts", error }),
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const data = await req.json();
    const newPost = new Post(data);
    await newPost.save();

    return new NextResponse(JSON.stringify(newPost), { status: 201 });
  } catch (error) {
    console.error("Error adding post:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error adding post", error }),
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  await dbConnect();
  console.log("patch1");
  try {
    const data = await req.json();
    const postId = data._id;

    if (!postId) {
      return new NextResponse(JSON.stringify({ message: "Invalid request" }), {
        status: 400,
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return new NextResponse(JSON.stringify({ message: "Post not found" }), {
        status: 404,
      });
    }

    if (data.vote !== undefined) {
      switch (data.vote) {
        case -2:
          post.downvotes += 1;
          post.upvotes -= 1;
          break;
        case -1:
          post.downvotes += 1;
          break;
        case 1:
          post.upvotes += 1;
          break;
        case 2:
          post.upvotes += 1;
          post.downvotes -= 1;
          break;
        default:
          console.log(`Invalid vote value: ${data.vote}`);
          break;
      }
    }

    if (data.tags !== undefined) {
      post.tags = data.tags;
    }

    await post.save();

    return new NextResponse(JSON.stringify(post), { status: 200 });
  } catch (error) {
    console.error("Error updating post:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error updating post", error }),
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  await dbConnect();
  try {
    const { postId, userId, imageUrl } = await req.json();

    if (!postId || !userId || !imageUrl) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin" && post.userId.toString() !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    try {
      const url = new URL("/api/uploadthing/fileUpload", req.url);
      const responseUploadthing = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageURLs: [imageUrl],
        }),
      });
      const data = await responseUploadthing.json();
      console.log(data);

      await Post.findByIdAndDelete(postId);

      return NextResponse.json(
        { message: "Post deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Error uploading files" });
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { message: "Error deleting post", error },
      { status: 500 }
    );
  }
}
