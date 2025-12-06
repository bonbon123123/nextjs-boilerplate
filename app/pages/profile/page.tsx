"use client";
import { useContext, useState, useEffect } from "react";
import { SessionContext } from "@/app/invisibleComponents/SessionProvider";
import BigImage from "@/app/components/BigImage";
import Post from "@/app/interfaces/Post";
import AdvancedSearch from "@/app/components/AdvancedSearch";
import { SearchFilters } from "@/app/interfaces/tags";
import SmallImage from "@/app/components/SmallImage";

interface ImageTileProps {
  image: Post;
  onImageClick: (image: Post) => void;
  onTagClick: (tag: string) => void;
}

const ImageTile: React.FC<ImageTileProps> = ({
  image,
  onImageClick,
  onTagClick,
}) => (
  <SmallImage
    key={image._id}
    image={image}
    onClick={() => onImageClick(image)}
    onTagClick={onTagClick}
  />
);

const UserPage = () => {
  const [activeSection, setActiveSection] = useState("added");
  const [allImages, setAllImages] = useState<Post[]>([]);
  const [filteredImages, setFilteredImages] = useState<Post[]>([]);
  const [selectedImage, setSelectedImage] = useState<Post | null>(null);
  const [pendingTags, setPendingTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    tags: [],
    excludedTags: [],
    matchAll: false,
    matchExcludedAll: false,
    specialTags: {},
    sortBy: null,
    sortOrder: "desc",
  });

  const sessionContext = useContext(SessionContext);

  const applyFilters = (images: Post[], filters: SearchFilters) => {
    let result = [...images];

    // Filter by tags (if any)
    if (filters.tags.length > 0) {
      const shouldInclude = (img: Post, tag: string): boolean =>
        img.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()) ?? false;

      if (filters.matchAll) {
        result = result.filter((img) =>
          filters.tags.every((tag) => shouldInclude(img, tag))
        );
      } else {
        result = result.filter((img) =>
          filters.tags.some((tag) => shouldInclude(img, tag))
        );
      }
    }

    if (filters.excludedTags.length > 0) {
      const shouldExclude = (img: Post, tag: string): boolean =>
        !(
          img.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()) ?? false
        );

      if (filters.matchExcludedAll) {
        result = result.filter((img) =>
          filters.excludedTags.every((tag) => shouldExclude(img, tag))
        );
      } else {
        result = result.filter((img) =>
          filters.excludedTags.some((tag) => shouldExclude(img, tag))
        );
      }
    }

    if (filters.sortBy === "votes") {
      result.sort((a, b) => {
        const aVotes = (a.upvotes as any)?.length || 0;
        const bVotes = (b.upvotes as any)?.length || 0;
        return filters.sortOrder === "desc" ? bVotes - aVotes : aVotes - bVotes;
      });
    } else if (filters.sortBy === "date") {
      result.sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        return filters.sortOrder === "desc" ? bDate - aDate : aDate - bDate;
      });
    }

    setFilteredImages(result);
  };

  const fetchImages = async (type: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/mongo/postsSpecial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: sessionContext?.userId,
          type: type,
        }),
      });
      const data = await response.json();
      setAllImages(data);
      applyFilters(data, currentFilters);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionContext?.userId) return;
    const typeMap: { [key: string]: string } = {
      added: "author",
      liked: "liked",
      saved: "saved",
    };
    fetchImages(typeMap[activeSection]);
  }, [activeSection, sessionContext?.userId, currentFilters]);

  if (!sessionContext?.userId) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <p className="text-lg opacity-70">
          Zaloguj się aby zobaczyć swój profil
        </p>
      </div>
    );
  }

  const handleSearch = (filters: SearchFilters) => {
    const merged = {
      ...filters,
      tags: Array.from(new Set([...filters.tags, ...pendingTags])),
    };
    setPendingTags([]);
    setCurrentFilters(merged);
    applyFilters(allImages, merged);
  };

  const getSectionLabel = (section: string): string => {
    switch (section) {
      case "added":
        return "Dodane";
      case "liked":
        return "Polubione";
      case "saved":
        return "Zapisane";
      default:
        return "";
    }
  };

  const getEmptyStateMessage = (): string => {
    switch (activeSection) {
      case "added":
        return "Nie dodałeś jeszcze żadnych obrazów";
      case "liked":
        return "Nie polubiłeś jeszcze żadnych obrazów";
      case "saved":
        return "Nie zapisałeś jeszcze żadnych obrazów";
      default:
        return "Brak obrazów";
    }
  };

  const handleImageClick = (image: Post) => {
    setSelectedImage(image);
  };

  const handleAddTag = (tag: string) => {
    if (!pendingTags.includes(tag)) {
      setPendingTags([...pendingTags, tag]);
    }
  };

  const renderContent = () => {
    if (filteredImages.length === 0) {
      return (
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Brak obrazów</p>
            <p className="text-sm opacity-70">{getEmptyStateMessage()}</p>
          </div>
        </div>
      );
    }

    const columns: Post[][] = [[], [], [], []];
    for (let index = 0; index < filteredImages.length; index += 1) {
      columns[index % 4].push(filteredImages[index]);
    }

    return (
      <div className="w-full flex gap-2 p-4">
        {columns.map((column) => (
          <div
            key={column.map((img) => img._id).join("-") || "empty"}
            className="w-1/4"
          >
            {column.map((image) => (
              <ImageTile
                key={image._id}
                image={image}
                onImageClick={handleImageClick}
                onTagClick={handleAddTag}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-100 px-4 md:px-8 py-4">
      <main className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6 pb-6 border-b border-base-300">
            <div className="avatar">
              <div className="w-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                {sessionContext.userName?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                {sessionContext.userName}
              </h1>
              <p className="text-sm opacity-70 mt-1">Twój profil</p>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="mb-8 bg-base-200 rounded-lg p-4 shadow-md">
          <div className="flex gap-3 w-full">
            {["added", "liked", "saved"].map((section) => (
              <button
                key={section}
                className={`flex-1 px-8 py-4 rounded-lg font-semibold transition-all duration-200 text-lg ${
                  activeSection === section
                    ? "bg-primary text-primary-content shadow-lg scale-105"
                    : "bg-base-100 text-base-content hover:bg-base-300"
                }`}
                onClick={() => {
                  setActiveSection(section);
                  setPendingTags([]);
                  setCurrentFilters({
                    tags: [],
                    excludedTags: [],
                    matchAll: false,
                    matchExcludedAll: false,
                    specialTags: {},
                    sortBy: null,
                    sortOrder: "desc",
                  });
                }}
              >
                {getSectionLabel(section)}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6">
          <AdvancedSearch
            onSearch={handleSearch}
            initialFilters={currentFilters}
            extraTags={pendingTags}
          />
        </div>

        {/* Images Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          renderContent()
        )}
      </main>

      {selectedImage && (
        <BigImage
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onTagClick={handleAddTag}
        />
      )}
    </div>
  );
};

export default UserPage;
