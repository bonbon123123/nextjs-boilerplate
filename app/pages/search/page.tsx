"use client";

import Post from "@/app/interfaces/Post";
import React, { useState, useEffect, useRef, useCallback } from "react";
import SmallImage from "@/app/components/SmallImage";
import BigImage from "@/app/components/BigImage";
import AdvancedSearch from "@/app/components/AdvancedSearch";
import { SearchFilters } from "@/app/interfaces/tags";

const SearchPage = () => {
  const [pendingTags, setPendingTags] = useState<string[]>([]);
  const [images, setImages] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<Post[][]>([]);
  const [selectedImage, setSelectedImage] = useState<Post | null>(null);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    tags: [],
    excludedTags: [],
    matchAll: false,
    matchExcludedAll: false,
    specialTags: {},
    sortBy: null,
    sortOrder: "desc",
  });

  // Infinite scroll state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchImages = useCallback(
    async (
      filters: SearchFilters,
      pageNum: number,
      append: boolean = false
    ) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
        setImages([]);
        setPage(1);
      }

      try {
        const queryString = buildQueryString(filters, pageNum);
        const response = await fetch(`/api/mongo/posts?${queryString}`);
        const data = await response.json();

        if (append) {
          setImages((prev) => [...prev, ...data.posts]);
        } else {
          setImages(data.posts);
        }

        setHasMore(data.hasMore);
        setCurrentFilters(filters);
      } catch (error) {
        console.error("Error fetching images:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !loading
        ) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchImages(currentFilters, nextPage, true);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, loading, page, currentFilters, fetchImages]);

  useEffect(() => {
    fetchImages(currentFilters, 1, false);
  }, []);

  const buildQueryString = (
    filters: SearchFilters,
    pageNum: number
  ): string => {
    const params = new URLSearchParams();

    if (filters.tags.length > 0) {
      params.append("tags", filters.tags.join(","));
      params.append("matchAll", filters.matchAll.toString());
    }

    if (filters.excludedTags?.length > 0) {
      params.append("excludedTags", filters.excludedTags.join(","));
      params.append("matchExcludedAll", filters.matchExcludedAll.toString());
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

    params.append("page", pageNum.toString());
    params.append("limit", "40");
    params.append("rankingMode", "web");

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
    setPage(1);
    setHasMore(true);
    fetchImages(filters, 1, false);
  };

  const handleImageClick = (image: Post) => {
    setSelectedImage(image);
  };

  const handleCloseBigImage = () => {
    setSelectedImage(null);
  };

  const handleTagClick = (tag: string) => {
    if (!pendingTags.includes(tag)) {
      setPendingTags([...pendingTags, tag]);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        {/* change max width later?*/}
        <AdvancedSearch
          onSearch={(filters) => {
            const mergedFilters = {
              ...filters,
              tags: Array.from(new Set([...filters.tags, ...pendingTags])),
            };

            setPendingTags([]);
            handleSearch(mergedFilters);
          }}
          initialFilters={currentFilters}
          extraTags={pendingTags}
        />
        {/* Current filters display */}
        {(currentFilters.tags.length > 0 ||
          Object.keys(currentFilters.specialTags).length > 0) && (
          <div className="my-4 p-3 bg-base-200 rounded-lg">
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
          <>
            <div className="w-full flex gap-2 p-4">
              {columns.map((column, index) => (
                <div key={index} className="w-1/4">
                  {column.map((image) => (
                    <SmallImage
                      key={image._id}
                      image={image}
                      onClick={() => handleImageClick(image)}
                      onTagClick={handleTagClick}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div
              ref={observerTarget}
              className="flex justify-center items-center py-8"
            >
              {isLoadingMore && (
                <span className="loading loading-spinner loading-md text-primary"></span>
              )}
              {!hasMore && images.length > 0 && (
                <p className="text-sm opacity-70">No more images to load</p>
              )}
            </div>
          </>
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
