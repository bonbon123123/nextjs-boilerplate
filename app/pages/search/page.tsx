"use client";

import Post from "@/app/interfaces/Post";
import React, { useState, useEffect } from "react";
import SmallImage from "@/app/components/SmallImage";
import BigImage from "@/app/components/BigImage";
import AdvancedSearch from "@/app/components/AdvancedSearch";
import { SearchFilters, getTagColor } from "@/app/interfaces/tags";

const SearchPage = () => {
  const [images, setImages] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<Post[][]>([]);
  const [selectedImage, setSelectedImage] = useState<Post | null>(null);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    tags: [],
    matchAll: false,
    specialTags: {},
    sortBy: null,
    sortOrder: "desc",
  });
  const fetchImages = React.useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    try {
      const queryString = buildQueryString(filters);
      const response = await fetch(`/api/mongo/posts?${queryString}`);
      const data = await response.json();
      setImages(data);
      setCurrentFilters(filters);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchImages(currentFilters);
  }, [fetchImages, currentFilters]);

  const buildQueryString = (filters: SearchFilters): string => {
    const params = new URLSearchParams();

    if (filters.tags.length > 0) {
      params.append("tags", filters.tags.join(","));
      params.append("matchAll", filters.matchAll.toString());
    }

    if (Object.keys(filters.specialTags).length > 0) {
      params.append("specialTags", JSON.stringify(filters.specialTags));
    }

    if (filters.sortBy) {
      params.append("sortBy", filters.sortBy);
      params.append("sortOrder", filters.sortOrder);
    }

    if (filters.dateRange?.from) {
      params.append("dateFrom", filters.dateRange.from.toISOString());
    }

    if (filters.dateRange?.to) {
      params.append("dateTo", filters.dateRange.to.toISOString());
    }

    return params.toString();
  };

  useEffect(() => {
    if (images.length > 0) {
      const newColumns: Post[][] = [];
      for (let i = 0; i < 4; i++) {
        newColumns.push([]);
      }
      images.forEach((image, index) => {
        newColumns[index % 4].push(image);
      });
      setColumns(newColumns);
    } else {
      setColumns([[], [], [], []]);
    }
  }, [images]);

  const handleSearch = (filters: SearchFilters) => {
    fetchImages(filters);
  };

  const handleImageClick = (image: Post) => {
    setSelectedImage(image);
  };

  const handleCloseBigImage = () => {
    setSelectedImage(null);
  };

  const handleTagClick = (tag: string) => {
    // Dodaj tag do wyszukiwania jeśli jeszcze go nie ma
    if (!currentFilters.tags.includes(tag)) {
      const newFilters = {
        ...currentFilters,
        tags: [...currentFilters.tags, tag],
      };
      setCurrentFilters(newFilters);
      fetchImages(newFilters);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <AdvancedSearch
          onSearch={handleSearch}
          initialFilters={currentFilters}
        />

        {/* Current filters display */}
        {(currentFilters.tags.length > 0 ||
          Object.keys(currentFilters.specialTags).length > 0) && (
          <div className="my-4 p-3 bg-base-200 rounded-lg">
            <div className="text-sm font-semibold mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {currentFilters.tags.map((tag) => (
                <div
                  key={tag}
                  className={`badge ${getTagColor(tag)} gap-2 px-3 py-3`}
                >
                  #{tag}
                </div>
              ))}
              {Object.entries(currentFilters.specialTags).map(
                ([prefix, value]) => (
                  <div
                    key={prefix}
                    className={`badge ${getTagColor(
                      `${prefix}:${value}`
                    )} gap-2 px-3 py-3`}
                  >
                    #{prefix}:{value}
                  </div>
                )
              )}
            </div>
            {currentFilters.sortBy && (
              <div className="text-xs mt-2 opacity-70">
                Sorted by: {currentFilters.sortBy} (
                {currentFilters.sortOrder === "asc"
                  ? "ascending"
                  : "descending"}
                )
              </div>
            )}
            {currentFilters.dateRange && (
              <div className="text-xs mt-1 opacity-70">
                Date range:{" "}
                {currentFilters.dateRange.from?.toLocaleDateString()} -{" "}
                {currentFilters.dateRange.to?.toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : images.length === 0 ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">No images found</p>
              <p className="text-sm opacity-70">
                Try adjusting your search filters
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full flex gap-4">
            {columns.map((column, index) => (
              <div key={index} className="w-1/4">
                {column.map((image) => (
                  <SmallImage
                    key={image._id}
                    image={image}
                    onClick={() => handleImageClick(image)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <BigImage
          image={selectedImage}
          onClose={handleCloseBigImage}
          onTagClick={handleTagClick}
        />
      )}
    </div>
  );
};

export default SearchPage;
