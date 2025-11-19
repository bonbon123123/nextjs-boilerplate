"use client";

import React, { useState } from "react";
import {
  SPECIAL_TAG_TYPES,
  DANGER_LEVELS,
  parseTag,
  getTagColor,
  SpecialTagType,
} from "../interfaces/tags";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  showSpecialTags?: boolean;
  onEnterSubmit?: () => void;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  showSpecialTags = true,
  onEnterSubmit,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSpecialPanel, setShowSpecialPanel] = useState(false);
  const [selectedSpecialType, setSelectedSpecialType] =
    useState<SpecialTagType | null>(null);
  const [specialValue, setSpecialValue] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const addSpecialTag = () => {
    if (!selectedSpecialType || !specialValue.trim()) return;

    const newTag = `${selectedSpecialType.prefix}:${specialValue
      .trim()
      .toLowerCase()}`;

    // Usuń istniejący tag tego samego typu jeśli nie pozwalamy na wiele
    if (!selectedSpecialType.multiple) {
      const filteredTags = tags.filter((t) => {
        const parsed = parseTag(t);
        return !(
          parsed.type === "special" &&
          parsed.prefix === selectedSpecialType.prefix
        );
      });
      onChange([...filteredTags, newTag]);
    } else {
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
    }

    setSpecialValue("");
    setSelectedSpecialType(null);
    setShowSpecialPanel(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!inputValue.trim() && onEnterSubmit) {
        onEnterSubmit();
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    }
  };

  const renderSpecialTagInput = () => {
    if (!selectedSpecialType) return null;

    if (selectedSpecialType.id === "danger") {
      return (
        <div className="flex flex-wrap gap-2">
          {DANGER_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => {
                setSpecialValue(level);
                setTimeout(() => addSpecialTag(), 0);
              }}
              className="btn btn-sm btn-outline"
            >
              {level.toUpperCase()}
            </button>
          ))}
        </div>
      );
    }

    if (selectedSpecialType.id === "date") {
      return (
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={specialValue}
            onChange={(e) => setSpecialValue(e.target.value)}
            className="input input-sm input-bordered"
          />
          <button onClick={addSpecialTag} className="btn btn-sm btn-primary">
            Add
          </button>
        </div>
      );
    }

    return (
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={specialValue}
          onChange={(e) => setSpecialValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSpecialTag();
            }
          }}
          placeholder={`Enter ${selectedSpecialType.label.toLowerCase()}...`}
          className="input input-sm input-bordered flex-1"
          autoFocus
        />
        <button onClick={addSpecialTag} className="btn btn-sm btn-primary">
          Add
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Regular tag input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            onEnterSubmit
              ? "Add tags (Enter on empty = Submit)"
              : "Add regular tags..."
          }
          className="input input-bordered input-sm flex-1"
        />
        <button
          onClick={() => addTag(inputValue)}
          disabled={!inputValue.trim()}
          className="btn btn-primary btn-sm"
        >
          Add
        </button>
        {showSpecialTags && (
          <button
            onClick={() => setShowSpecialPanel(!showSpecialPanel)}
            className="btn btn-secondary btn-sm"
          >
            Special
          </button>
        )}
      </div>

      {/* tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-base-300 rounded-lg max-h-32 overflow-y-auto">
          {tags.map((tag) => {
            const color = getTagColor(tag);
            return (
              <div
                key={tag}
                className={`badge ${color} gap-2 px-2 py-2 cursor-pointer hover:opacity-80`}
                onClick={() => removeTag(tag)}
              >
                <span className="text-xs">#{tag}</span>
                <span className="text-xs opacity-70">×</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Special tags */}
      {showSpecialTags && showSpecialPanel && (
        <div className="card bg-base-300 shadow-lg">
          <div className="card-body p-3">
            <h3 className="card-title text-sm">Add Special Tag</h3>

            {!selectedSpecialType ? (
              <div className="grid grid-cols-2 gap-2">
                {SPECIAL_TAG_TYPES.map((type) => {
                  const hasTag = tags.some((t) => {
                    const parsed = parseTag(t);
                    return (
                      parsed.type === "special" && parsed.prefix === type.prefix
                    );
                  });

                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedSpecialType(type)}
                      className={`btn btn-sm ${
                        hasTag && !type.multiple
                          ? "btn-disabled"
                          : "btn-outline"
                      }`}
                      disabled={hasTag && !type.multiple}
                    >
                      {type.label}
                      {hasTag && !type.multiple && " ✓"}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">
                    {selectedSpecialType.label}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedSpecialType(null);
                      setSpecialValue("");
                    }}
                    className="btn btn-xs btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
                {renderSpecialTagInput()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagInput;
