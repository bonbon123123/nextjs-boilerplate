export interface SpecialTagType {
  id: string;
  label: string;
  prefix: string;
  color: string;
  multiple: boolean;
}

export const SPECIAL_TAG_TYPES: SpecialTagType[] = [
  {
    id: "danger",
    label: "Danger Level",
    prefix: "danger",
    color: "badge-error",
    multiple: false,
  },
  {
    id: "author",
    label: "Author",
    prefix: "author",
    color: "badge-secondary",
    multiple: false,
  },
  {
    id: "date",
    label: "Photo Date",
    prefix: "date",
    color: "badge-info",
    multiple: false,
  },
  {
    id: "op",
    label: "Original Poster",
    prefix: "op",
    color: "badge-accent",
    multiple: false,
  },
];

export const DANGER_LEVELS = ["sfw", "nsfw"];

export interface ParsedTag {
  type: "normal" | "special";
  fullTag: string;
  prefix?: string;
  value: string;
  specialType?: SpecialTagType;
}

export function parseTag(tag: string): ParsedTag {
  const colonIndex = tag.indexOf(":");

  if (colonIndex === -1) {
    return {
      type: "normal",
      fullTag: tag,
      value: tag,
    };
  }

  const prefix = tag.substring(0, colonIndex);
  const value = tag.substring(colonIndex + 1);
  const specialType = SPECIAL_TAG_TYPES.find((t) => t.prefix === prefix);

  if (specialType) {
    return {
      type: "special",
      fullTag: tag,
      prefix,
      value,
      specialType,
    };
  }

  return {
    type: "normal",
    fullTag: tag,
    value: tag,
  };
}

export function getTagColor(tag: string): string {
  const parsed = parseTag(tag);
  if (parsed.type === "special" && parsed.specialType) {
    return parsed.specialType.color;
  }
  return "badge-primary";
}

export interface SearchFilters {
  tags: string[];
  excludedTags: string[];
  matchAll: boolean; // true = AND, false = OR
  matchExcludedAll: boolean;
  specialTags: { [key: string]: string };
  sortBy: "votes" | "date" | null;
  sortOrder: "asc" | "desc";
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

export const DATE_PRESETS = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
];

export function getDateRangeForPreset(preset: string): {
  from: Date;
  to: Date;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return {
        from: today,
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      };

    case "week": {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return {
        from: weekStart,
        to: now,
      };
    }

    case "month": {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        from: monthStart,
        to: now,
      };
    }

    case "year": {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return {
        from: yearStart,
        to: now,
      };
    }

    default:
      return { from: new Date(0), to: now };
  }
}
