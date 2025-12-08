import { NextResponse } from "next/server";
import Post from "../models/Post";
import User from "../models/User";
import dbConnect from "../db";

// TypeScript potrzebuje znać strukturę - Mongoose schema tego nie zapewnia
interface PostDocument {
  _id: string;
  userId: string;
  url: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
  width: number;
  height: number;
  locked: boolean;
  name: string;
  size: number;
  type: string;
  commentsCount?: number;
}

interface PostWithRanking extends PostDocument {
  rankingScore: number;
}

function getFreshnessMultiplier(createdAt: Date): number {
  const now = Date.now();
  const postTime = new Date(createdAt).getTime();
  const ageInMs = now - postTime;

  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const oneMonth = 30 * 24 * 60 * 60 * 1000;

  if (ageInMs < oneWeek) {
    return 1.0;
  } else if (ageInMs < oneMonth) {
    return 0.9;
  } else {
    const monthsOld = Math.floor(ageInMs / oneMonth);
    const multiplier = 0.8 - (monthsOld - 1) * 0.1;
    return Math.max(0.1, multiplier);
  }
}

function calculateRanking(
  post: PostDocument,
  mode: "web" | "api" = "web"
): number {
  const upvotes = post.upvotes || 0;
  const downvotes = post.downvotes || 0;
  const comments = post.commentsCount || 0;

  const netVotes = upvotes - downvotes;
  const totalVotes = upvotes + downvotes;
  const voteRatio = totalVotes > 0 ? upvotes / totalVotes : 0;

  const freshnessMultiplier = getFreshnessMultiplier(post.createdAt);

  if (mode === "web") {
    const engagementScore = netVotes * 1.0 + comments * 0.5;
    const qualityScore = voteRatio * 100;
    const controversyBonus =
      totalVotes > 10 && voteRatio > 0.4 && voteRatio < 0.6 ? 10 : 0;

    const baseScore =
      engagementScore * 0.5 + qualityScore * 0.3 + controversyBonus;
    return baseScore * freshnessMultiplier;
  } else {
    const qualityScore = netVotes * voteRatio;
    const popularityBonus = totalVotes > 50 ? Math.log(totalVotes) * 5 : 0;

    const baseScore = qualityScore * 0.7 + popularityBonus;
    return baseScore * freshnessMultiplier;
  }
}

// Pomocnicza funkcja do sprawdzania, czy żądanie pochodzi z wewnątrz aplikacji
function isInternalRequest(req: Request): boolean {
  const url = new URL(req.url);
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  const sameDomain = origin && origin.includes(url.hostname);
  const sameReferer = referer && referer.includes(url.hostname);

  return !!(sameDomain || sameReferer);
}

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
  const excludeId = url.searchParams.get("excludeId");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "40");
  const rankingMode = url.searchParams.get("rankingMode") as
    | "web"
    | "api"
    | null;

  // Parametry dla publicznego API
  const apiMode = url.searchParams.get("api") === "true";
  const redirect = url.searchParams.get("redirect") === "true";
  const index = parseInt(url.searchParams.get("index") || "0"); // Który obrazek (0-based)

  try {
    const query: any = {};

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

    if (excludeId) {
      query._id = { $ne: excludeId };
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

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    // SORTOWANIE ZWYKŁE (votes lub date)
    if (sortBy === "votes" || sortBy === "date") {
      let postsQuery = Post.find(query);

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
      }

      const skip = (page - 1) * limit;
      postsQuery = postsQuery.skip(skip).limit(limit).lean();

      const posts = (await postsQuery) as PostDocument[];

      if (sortBy === "votes") {
        posts.sort((a, b) => {
          const scoreA = a.upvotes - a.downvotes;
          const scoreB = b.upvotes - b.downvotes;
          return sortOrder === "asc" ? scoreA - scoreB : scoreB - scoreA;
        });
      }

      const total = await Post.countDocuments(query);

      // Jeśli api=true i redirect=true, przekieruj do obrazka o podanym indeksie
      if (apiMode && redirect) {
        if (index >= 0 && index < posts.length) {
          return NextResponse.redirect(posts[index].url);
        } else {
          return new NextResponse(
            JSON.stringify({
              error: "Index out of range",
              message: `Requested index ${index} but only ${posts.length} posts found`,
              availableRange: `0-${posts.length - 1}`,
            }),
            { status: 404 }
          );
        }
      }

      if (apiMode) {
        const urls = posts.map((post) => post.url);
        return new NextResponse(JSON.stringify(urls), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new NextResponse(
        JSON.stringify({
          posts,
          page,
          limit,
          total,
          hasMore: skip + limit < total,
        }),
        { status: 200 }
      );
    } else {
      // SORTOWANIE PO RANKINGU (domyślne)
      const mode = rankingMode || "web";

      let postsQuery = Post.find(query).limit(1000).lean();
      const allPosts = (await postsQuery) as PostDocument[];

      const postsWithRanking: PostWithRanking[] = allPosts.map((post) => ({
        ...post,
        rankingScore: calculateRanking(post, mode),
      }));

      postsWithRanking.sort((a, b) => b.rankingScore - a.rankingScore);

      const skip = (page - 1) * limit;
      const paginatedPosts = postsWithRanking.slice(skip, skip + limit);

      const posts = paginatedPosts.map(({ rankingScore, ...post }) => post);

      // Jeśli api=true i redirect=true, przekieruj do obrazka o podanym indeksie
      if (apiMode && redirect) {
        if (index >= 0 && index < posts.length) {
          return NextResponse.redirect(posts[index].url);
        } else {
          return new NextResponse(
            JSON.stringify({
              error: "Index out of range",
              message: `Requested index ${index} but only ${posts.length} posts found`,
              availableRange: `0-${posts.length - 1}`,
            }),
            { status: 404 }
          );
        }
      }

      if (apiMode) {
        const urls = posts.map((post) => post.url);
        return new NextResponse(JSON.stringify(urls), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new NextResponse(
        JSON.stringify({
          posts,
          page,
          limit,
          total: postsWithRanking.length,
          hasMore: skip + limit < postsWithRanking.length,
        }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error fetching posts", error }),
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!isInternalRequest(req)) {
    return new NextResponse(
      JSON.stringify({
        error: "Unauthorized",
        message: "POST requests are only allowed from the application itself",
      }),
      { status: 403 }
    );
  }

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
