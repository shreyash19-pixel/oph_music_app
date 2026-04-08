import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosApi from "../../../../../conf/axios";
import CustomVideoPlayer from "../../../../../components/CustomVideoPlayer/CustomVideoPlayer";
import {
  RESOURCE_TYPES,
  buildResourcePath,
  slugifyTitle,
  LEGACY_SLUG_WITH_TRAILING_ID,
} from "../../../../../utils/resourceSlug";

const formatViews = (views) => {
  if (!views && views !== 0) return "0 views";
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${(views / 1000).toFixed(1)}K views`;
};

const fetchByType = async (resourceType, id) => {
  const path =
    resourceType === "podcast"
      ? `/podcast/${id}`
      : resourceType === "reel"
        ? `/reel/${id}`
        : resourceType === "story"
          ? `/story/${id}`
          : resourceType === "learning"
            ? `/learning/${id}`
            : null;
  if (!path) throw new Error("Invalid resource type");
  try {
    const response = await axiosApi.get(path);
    return response.data?.data;
  } catch (e) {
    if (e.response?.status === 404) return null;
    throw e;
  }
};

const fetchBySlug = async (resourceType, slug) => {
  const enc = encodeURIComponent(slug);
  const path =
    resourceType === "podcast"
      ? `/podcast/by-slug/${enc}`
      : resourceType === "reel"
        ? `/reel/by-slug/${enc}`
        : resourceType === "story"
          ? `/story/by-slug/${enc}`
          : resourceType === "learning"
            ? `/learning/by-slug/${enc}`
            : null;
  if (!path) throw new Error("Invalid resource type");
  try {
    const response = await axiosApi.get(path);
    return response.data?.data;
  } catch (e) {
    if (e.response?.status === 404) return null;
    throw e;
  }
};

/**
 * Public detail page for podcast, reel, story, learning.
 * Routes: /resources/:resourceType/:slug (slugified title, no id)
 * Legacy: /content/:id (podcast); old /resources/.../title-id redirects to slug-only
 */
export default function ResourceDetail() {
  const navigate = useNavigate();
  const { resourceType, slug, id: legacyContentId } = useParams();
  const [content, setContent] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const type = resourceType;

      if (legacyContentId != null && String(legacyContentId).trim() !== "") {
        const numericId = String(legacyContentId).trim();
        const data = await fetchByType("podcast", numericId);
        if (!data) {
          setError("Content not found");
          setContent({});
          return;
        }
        setContent(data);
        if (data.title) {
          const canonical = buildResourcePath("podcast", numericId, data.title);
          if (window.location.pathname.startsWith("/content/")) {
            navigate(canonical, { replace: true });
          }
        }
        return;
      }

      if (!RESOURCE_TYPES.includes(String(type))) {
        setError("Invalid resource type");
        setContent({});
        return;
      }

      const rawSlug = decodeURIComponent(String(slug ?? "").trim());
      if (!rawSlug) {
        setError("Invalid link");
        setContent({});
        return;
      }

      let data = await fetchBySlug(type, rawSlug);

      if (!data && LEGACY_SLUG_WITH_TRAILING_ID.test(rawSlug)) {
        const m = rawSlug.match(LEGACY_SLUG_WITH_TRAILING_ID);
        const prefix = m[1];
        const id = m[2];
        const byId = await fetchByType(type, id);
        if (byId && slugifyTitle(byId.title) === prefix) {
          data = byId;
          navigate(buildResourcePath(type, byId.id, byId.title), {
            replace: true,
          });
        }
      }

      if (!data) {
        setError("Content not found");
        setContent({});
        return;
      }
      setContent(data);
    } catch (e) {
      console.error(e);
      setError(
        e?.response?.data?.message || e?.message || "Failed to load content",
      );
      setContent({});
    } finally {
      setLoading(false);
    }
  }, [resourceType, slug, legacyContentId, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const descriptionText =
    (typeof content.bio === "string" && content.bio.trim()) ||
    content.description;

  if (loading) {
    return (
      <div className="text-white py-40 min-h-screen container mx-auto px-6 text-center">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white py-40 min-h-screen container mx-auto px-6 text-center text-gray-400">
        {error}
      </div>
    );
  }

  return (
    <div className="text-white py-40 min-h-screen xl:px-16 lg:px-10 px-6 container mx-auto">
      <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden md:p-12">
        <CustomVideoPlayer
          ref={videoRef}
          src={content.video_url}
          poster={content.thumbnail_url}
          className="w-full h-full"
          pauseOtherVideos={true}
          showPlayButtonOverlay={true}
        />
      </div>

      <h1 className="text-2xl font-bold mb-4">{content.title}</h1>

      <div className="flex items-center gap-4 text-[#5DC9DE] text-sm mb-6">
        <span>{content.credit_name}</span>
        <span>•</span>
        <span className="font-bold">
          {content.duration_in_minutes || "--"} mins
        </span>
        <span>—</span>
        <span className="font-bold">
          {formatViews(parseInt(content.views || 0, 10))}
        </span>
      </div>

      <div className="flex gap-4 mb-6">
        {content.keywords
          ? content.keywords.split(",").map((keyword, index) => (
              <span
                key={index}
                className="bg-purple-600 px-2 md:px-4 py-1 rounded-full text-xs md:text-sm"
              >
                {keyword.trim()}
              </span>
            ))
          : null}
      </div>

      {descriptionText ? (
        <div className="text-gray-400 mb-8 whitespace-pre-wrap text-base leading-relaxed max-w-3xl">
          {descriptionText}
        </div>
      ) : null}

      <button
        type="button"
        className="bg-[#5DC9DE] hover:font-bold text-black px-6 py-3 rounded-full font-medium transition-colors mb-12"
        onClick={() => {
          navigate("/auth/signup");
        }}
      >
        Book Your Spot - Sign Up Now
      </button>
    </div>
  );
}
