"use client";

import React, { useState } from "react";
import {
  SPECIAL_TAG_TYPES,
  DANGER_LEVELS,
  DATE_PRESETS,
  getDateRangeForPreset,
  SearchFilters,
  getTagColor,
  parseTag,
} from "../interfaces/tags";

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  extraTags?: string[];
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  initialFilters,
  extraTags,
}) => {
  const [tags, setTags] = useState<string[]>(initialFilters?.tags || []);
  const [inputValue, setInputValue] = useState("");
  const [matchAll, setMatchAll] = useState(initialFilters?.matchAll ?? false);
  const [specialTags, setSpecialTags] = useState<{ [key: string]: string }>(
    initialFilters?.specialTags || {}
  );
  const [sortBy, setSortBy] = useState<"votes" | "date" | null>(
    initialFilters?.sortBy || null
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    initialFilters?.sortOrder || "desc"
  );
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(
    initialFilters?.dateRange || {}
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [excludedTags, setExcludedTags] = useState<string[]>(
    initialFilters?.excludedTags || []
  );
  const [matchExcludedAll, setMatchExcludedAll] = useState(
    initialFilters?.matchExcludedAll ?? false
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (!trimmedTag) return;

    if (trimmedTag.startsWith("-")) {
      const t = trimmedTag.slice(1);
      if (!excludedTags.includes(t)) setExcludedTags([...excludedTags, t]);
    } else {
      if (!tags.includes(trimmedTag)) setTags([...tags, trimmedTag]);
    }
    setInputValue("");
  };

  const excludeTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (!trimmedTag) return;

    const t = trimmedTag.startsWith("-") ? trimmedTag.slice(1) : trimmedTag;
    if (!excludedTags.includes(t)) setExcludedTags([...excludedTags, t]);
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    setExcludedTags(excludedTags.filter((t) => t !== tagToRemove));
  };

  const addSpecialTag = (prefix: string, value: string) => {
    setSpecialTags({ ...specialTags, [prefix]: value });
  };
  const removeExcludedTag = (tag: string) => {
    setExcludedTags(excludedTags.filter((t) => t !== tag));
  };

  const removeSpecialTag = (prefix: string) => {
    const newSpecialTags = { ...specialTags };
    delete newSpecialTags[prefix];
    setSpecialTags(newSpecialTags);
  };

  const applyDatePreset = (preset: string) => {
    const range = getDateRangeForPreset(preset);
    setDateRange(range);
  };

  const handleSearch = () => {
    console.log(excludedTags, matchExcludedAll);
    const filters: SearchFilters = {
      tags,
      excludedTags,
      matchAll,
      matchExcludedAll,
      specialTags,
      sortBy,
      sortOrder,
      dateRange: dateRange.from || dateRange.to ? dateRange : undefined,
    };
    onSearch(filters);
  };

  const clearFilters = () => {
    setTags([]);
    setMatchAll(false);
    setSpecialTags({});
    setSortBy(null);
    setSortOrder("desc");
    setDateRange({});
    setExcludedTags([]);
    setMatchExcludedAll(false);
  };

  return (
    <div className="space-y-4 p-4 bg-base-200 rounded-lg shadow-md">
      {/* Display tags */}
      {(tags.length > 0 ||
        (excludedTags?.length ?? 0) > 0 ||
        (extraTags?.length ?? 0) > 0) && (
        <div className="flex flex-wrap gap-2 p-2 bg-base-100 rounded">
          {/* Normal tags */}
          {tags.map((tag) => (
            <div
              key={tag}
              className={`badge badge-success gap-2 px-3 py-3 cursor-pointer`}
              onClick={() => removeTag(tag)}
            >
              #{tag} <span className="text-xs opacity-70">×</span>
            </div>
          ))}

          {/* Excluded tags */}
          {excludedTags?.map((tag) => (
            <div
              key={tag}
              className={`badge badge-error gap-2 px-3 py-3 cursor-pointer`}
              onClick={() => removeExcludedTag(tag)}
            >
              #{tag} <span className="text-xs opacity-70">×</span>
            </div>
          ))}

          {/* Extra tags */}
          {extraTags?.map((tag) => (
            <div
              key={tag}
              className={`badge ${getTagColor(
                tag
              )} gap-2 px-3 py-3 cursor-pointer`}
              onClick={() => {
                if (!tags.includes(tag)) setTags([...tags, tag]);
                if (extraTags) extraTags = extraTags.filter((t) => t !== tag);
              }}
            >
              #{tag} <span className="text-xs opacity-70">×</span>
            </div>
          ))}
        </div>
      )}

      {/* Basic Search */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(inputValue);
              }
            }}
            placeholder="Add tags to search..."
            className="input input-bordered flex-1"
          />
          <button
            onClick={() => addTag(inputValue)}
            className="btn btn-primary"
          >
            Add
          </button>
          <button
            onClick={() => excludeTag(inputValue)}
            className="btn btn-error"
          >
            Exclude
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button onClick={handleSearch} className="btn btn-primary flex-1">
          Search
        </button>
        {/* Match type toggle */}

        <div className="flex items-center gap-2">
          <label className="swap swap-rotate">
            <input
              type="checkbox"
              checked={matchAll}
              onChange={(e) => setMatchAll(e.target.checked)}
            />
            {/* ANY */}
            <div className="swap-on btn btn-sm btn-primary">ALL</div>
            {/* ALL */}
            <div className="swap-off btn btn-sm btn-primary">ANY</div>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <label className="swap swap-rotate">
            <input
              type="checkbox"
              checked={matchExcludedAll}
              onChange={(e) => setMatchExcludedAll(e.target.checked)}
            />
            <div className="swap-on btn btn-sm btn-error">ALL EXCLUDED</div>
            <div className="swap-off btn btn-sm btn-error">ANY EXCLUDED</div>
          </label>
        </div>

        <button onClick={clearFilters} className="btn btn-primary">
          Clear
        </button>
      </div>
      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="btn btn-sm btn-ghost w-full"
      >
        {showAdvanced ? "▼" : "▶"} Advanced Search
      </button>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-base-100 rounded-lg">
          {/* Special tags */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Special Tags</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SPECIAL_TAG_TYPES.map((type) => {
                const currentValue = specialTags[type.prefix];

                return (
                  <div key={type.id} className="form-control">
                    <label className="label">
                      <span className="label-text text-xs">{type.label}</span>
                    </label>
                    <div className="flex gap-2">
                      {type.id === "danger" ? (
                        <select
                          value={currentValue || ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              addSpecialTag(type.prefix, e.target.value);
                            } else {
                              removeSpecialTag(type.prefix);
                            }
                          }}
                          className="select select-sm select-bordered flex-1"
                        >
                          <option value="">None</option>
                          {DANGER_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {level.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      ) : type.id === "date" ? (
                        <input
                          type="date"
                          value={currentValue || ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              addSpecialTag(type.prefix, e.target.value);
                            } else {
                              removeSpecialTag(type.prefix);
                            }
                          }}
                          className="input input-sm input-bordered flex-1"
                        />
                      ) : (
                        <input
                          type="text"
                          value={currentValue || ""}
                          onChange={(e) => {
                            if (e.target.value.trim()) {
                              addSpecialTag(type.prefix, e.target.value);
                            } else {
                              removeSpecialTag(type.prefix);
                            }
                          }}
                          placeholder={`Enter ${type.label.toLowerCase()}...`}
                          className="input input-sm input-bordered flex-1"
                        />
                      )}
                      {currentValue && (
                        <button
                          onClick={() => removeSpecialTag(type.prefix)}
                          className="btn btn-sm btn-ghost"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sort options */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Sort By</h3>
            <div className="flex gap-2 flex-wrap">
              <select
                value={sortBy || ""}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="select select-sm select-bordered"
              >
                <option value="">None</option>
                <option value="votes">Votes</option>
                <option value="date">Date Added</option>
              </select>
              {sortBy && (
                <div className="join">
                  <button
                    className={`btn btn-sm join-item ${
                      sortOrder === "desc" ? "btn-active" : ""
                    }`}
                    onClick={() => setSortOrder("desc")}
                  >
                    {sortBy === "votes" ? "↑ Most" : "↓ Newest"}
                  </button>
                  <button
                    className={`btn btn-sm join-item ${
                      sortOrder === "asc" ? "btn-active" : ""
                    }`}
                    onClick={() => setSortOrder("asc")}
                  >
                    {sortBy === "votes" ? "↓ Least" : "↑ Oldest"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Date range */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Date Range (Posted)</h3>
            <div className="flex gap-2 flex-wrap">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyDatePreset(preset.id)}
                  className="btn btn-xs btn-outline"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs">From</span>
                </label>
                <input
                  type="date"
                  value={
                    dateRange.from
                      ? dateRange.from.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      from: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                  className="input input-sm input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs">To</span>
                </label>
                <input
                  type="date"
                  value={
                    dateRange.to ? dateRange.to.toISOString().split("T")[0] : ""
                  }
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      to: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                  className="input input-sm input-bordered"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
