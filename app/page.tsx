"use client";
import React, { useState, useEffect } from "react";

export default function MainPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [baseUrl, setBaseUrl] = useState(
    "https://nextjs-boilerplate-eight-psi-91.vercel.app"
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const examples = [
    {
      title: "Get top-rated image",
      url: `${baseUrl}/api/mongo/posts?api=true&redirect=true`,
      description: "Redirects to the highest-ranked image",
    },
    {
      title: "Get second best image",
      url: `${baseUrl}/api/mongo/posts?api=true&redirect=true&index=1`,
      description: "Get a specific position in the ranking",
    },
    {
      title: "Images with tags",
      url: `${baseUrl}/api/mongo/posts?api=true&tags=landscape,nature&limit=5`,
      description: "Filter by tags and get JSON response",
    },
    {
      title: "Exclude certain tags",
      url: `${baseUrl}/api/mongo/posts?api=true&tags=nature&excludedTags=sunset`,
      description: "Get images with 'nature' but not 'sunset'",
    },
    {
      title: "Recent images only",
      url: `${baseUrl}/api/mongo/posts?api=true&dateFrom=2024-11-01T00:00:00Z&limit=10`,
      description: "Filter by upload date",
    },
  ];

  const parameters = [
    { name: "api", type: "boolean", default: "false", desc: "Enable API mode" },
    {
      name: "redirect",
      type: "boolean",
      default: "false",
      desc: "Redirect to image URL",
    },
    {
      name: "index",
      type: "integer",
      default: "0",
      desc: "Which image to return (0-based)",
    },
    {
      name: "tags",
      type: "string",
      default: "-",
      desc: "Comma-separated tags to filter",
    },
    {
      name: "excludedTags",
      type: "string",
      default: "-",
      desc: "Comma-separated tags to exclude",
    },
    {
      name: "matchAll",
      type: "boolean",
      default: "false",
      desc: "Require ALL tags (AND logic)",
    },
    {
      name: "matchExcludedAll",
      type: "boolean",
      default: "false",
      desc: "Exclude posts with ALL excluded tags",
    },
    {
      name: "specialTags",
      type: "JSON",
      default: "-",
      desc: 'Special tag filters (e.g. {"danger":"sfw"})',
    },
    {
      name: "sortBy",
      type: "string",
      default: "ranking",
      desc: "Sort: ranking, votes, or date",
    },
    {
      name: "sortOrder",
      type: "string",
      default: "desc",
      desc: "Sort order: desc or asc",
    },
    {
      name: "dateFrom",
      type: "ISO date",
      default: "-",
      desc: "Filter posts after this date",
    },
    {
      name: "dateTo",
      type: "ISO date",
      default: "-",
      desc: "Filter posts before this date",
    },
    {
      name: "excludeId",
      type: "string",
      default: "-",
      desc: "Exclude specific post by ID",
    },
    {
      name: "page",
      type: "integer",
      default: "1",
      desc: "Page number for pagination",
    },
    {
      name: "limit",
      type: "integer",
      default: "40",
      desc: "Results per page (max 40 recommended)",
    },
    {
      name: "rankingMode",
      type: "string",
      default: "web",
      desc: "Ranking algorithm: web or api",
    },
  ];

  const useCases = [
    {
      title: "HTML Embed",
      code: ` <img src="${baseUrl}/api/mongo/posts?api=true&redirect=true&tags=landscape" alt="Random landscape">`,
    },
    {
      title: "JavaScript",
      code: `const response = await fetch('${baseUrl}/api/mongo/posts?api=true&tags=nature&limit=5');
  const data = await response.json();
  const images = data.posts.map(p => p.url);`,
    },
  ];

  return (
    <main className="min-h-screen bg-base-100 px-4 md:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="badge badge-primary badge-lg mb-4">
            Free & Open API
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-base-content">
            Image API
          </h1>
          <p className="text-xl text-base-content opacity-70 max-w-2xl mx-auto">
            Simple API for retrieving images with advanced filtering and ranking
          </p>
        </div>

        {/* Quick Start */}
        <div className="card bg-base-200 shadow-lg mb-8">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-4">Quick Start</h2>
            <div className="space-y-4">
              <div>
                <p className="text-base-content opacity-70 mb-2">
                  Try it now - click to open:
                </p>
                <a
                  href={`${baseUrl}/api/mongo/posts?api=true&redirect=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-block"
                >
                  Get Top-Rated Image
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>

              <div className="divider">OR</div>

              <div>
                <p className="text-base-content opacity-70 mb-2">
                  Base endpoint:
                </p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-base-300 p-3 rounded text-sm overflow-x-auto">
                    {baseUrl}/api/mongo/posts
                  </code>
                  <button
                    className="btn btn-square"
                    onClick={() =>
                      copyToClipboard(`${baseUrl}/api/mongo/posts`, -1)
                    }
                  >
                    {copiedIndex === -1 ? "✓" : "📋"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="card bg-base-200 shadow-lg mb-8">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-4">Examples</h2>
            <div className="space-y-4">
              {examples.map((example, index) => (
                <div key={index} className="card bg-base-300">
                  <div className="card-body p-4">
                    <h3 className="font-bold text-lg">{example.title}</h3>
                    <p className="text-sm opacity-70 mb-2">
                      {example.description}
                    </p>
                    <div className="flex gap-2">
                      <code className="flex-1 bg-base-100 p-2 rounded text-xs overflow-x-auto">
                        {example.url}
                      </code>
                      <button
                        className="btn btn-sm btn-square"
                        onClick={() => copyToClipboard(example.url, index)}
                      >
                        {copiedIndex === index ? "✓" : "📋"}
                      </button>
                      <a
                        href={example.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-square btn-primary"
                      >
                        →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="card bg-base-200 shadow-lg mb-8">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-4">Parameters</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Default</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.map((param, index) => (
                    <tr key={index}>
                      <td>
                        <code className="badge badge-sm">{param.name}</code>
                      </td>
                      <td>
                        <span className="badge badge-ghost badge-sm">
                          {param.type}
                        </span>
                      </td>
                      <td>
                        <code className="text-xs">{param.default}</code>
                      </td>
                      <td className="text-sm">{param.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="card bg-base-200 shadow-lg mb-8">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-4">Code Examples</h2>
            <div className="space-y-4">
              {useCases.map((useCase, index) => (
                <div key={index}>
                  <h3 className="font-bold mb-2">{useCase.title}</h3>
                  <div className="mockup-code">
                    <pre>
                      <code>{useCase.code}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Response Format */}
        <div className="card bg-base-200 shadow-lg mb-8">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-4">Response Format</h2>

            <h3 className="font-bold mb-2">API Mode (api=true)</h3>
            <p className="text-sm opacity-70 mb-2">
              Returns array of image URLs:
            </p>
            <div className="mockup-code mb-6">
              <pre>
                <code>{`[
    "https://utfs.io/f/abc123.jpg",
    "https://utfs.io/f/def456.jpg",
    "https://utfs.io/f/ghi789.jpg"
  ]`}</code>
              </pre>
            </div>

            <h3 className="font-bold mb-2">
              Redirect Mode (api=true&redirect=true)
            </h3>
            <div className="alert alert-info mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>
                Returns HTTP 302 redirect directly to the image URL. Your
                browser will display the image.
              </span>
            </div>

            <h3 className="font-bold mb-2">Standard Mode (no api parameter)</h3>
            <p className="text-sm opacity-70 mb-2">
              Full JSON response with metadata:
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-primary">🚀 No Auth Required</h3>
              <p className="text-sm">Free and open access for GET requests</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-secondary">🎯 Smart Ranking</h3>
              <p className="text-sm">
                Intelligent algorithm considering votes, engagement, and
                freshness
              </p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-accent">🔍 Advanced Filtering</h3>
              <p className="text-sm">Filter by tags, dates, votes, and more</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
