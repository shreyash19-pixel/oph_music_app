import axios from "axios";
import axiosApi from "../conf/axios";

/**
 * Upload a video file via presigned S3 PUT; returns public S3 URL.
 */
export async function uploadVideoViaPresignedPut(file, options = {}) {
  const {
    purpose,
    params = {},
    onUploadProgress,
  } = options;

  if (!file || !(file instanceof File)) {
    throw new Error("A video File is required");
  }
  if (!purpose) {
    throw new Error("presigned upload purpose is required");
  }

  const pres = await axiosApi.get("/presigned-upload/video", {
    params: {
      purpose,
      filename: file.name,
      content_type: file.type || "application/octet-stream",
      ...params,
    },
  });

  if (!pres.data?.success || !pres.data.uploadUrl || !pres.data.publicUrl) {
    throw new Error(pres.data?.message || "Could not prepare video upload");
  }

  const contentType =
    pres.data.contentType || file.type || "application/octet-stream";

  await axios.put(pres.data.uploadUrl, file, {
    headers: { "Content-Type": contentType },
    timeout: 0,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    onUploadProgress,
  });

  return pres.data.publicUrl;
}

/**
 * @param {File|string|null|undefined} fileOrUrl
 * @param {string} purpose
 * @param {object} [params]
 */
export async function resolveVideoUrlForUpload(fileOrUrl, purpose, params = {}) {
  if (!fileOrUrl) return null;
  if (typeof fileOrUrl === "string") {
    if (fileOrUrl.startsWith("blob:")) return null;
    return fileOrUrl;
  }
  if (fileOrUrl instanceof File) {
    return uploadVideoViaPresignedPut(fileOrUrl, { purpose, params });
  }
  return null;
}

/** Build multipart FormData for resource create/update (video via presigned PUT). */
export async function buildResourceFormData(
  formState,
  { videoPreview, thumbnailPreview, videoPurpose },
) {
  const videoUrl = await resolveVideoUrlForUpload(
    formState.video_url instanceof File ? formState.video_url : null,
    videoPurpose,
  );
  const finalVideoUrl =
    videoUrl ||
    (videoPreview &&
    typeof videoPreview === "string" &&
    !videoPreview.startsWith("blob:")
      ? videoPreview
      : null);

  const data = new FormData();
  for (const key in formState) {
    if (key === "video_url") {
      if (finalVideoUrl) data.append("video_url", finalVideoUrl);
      continue;
    }
    if (key === "thumbnail_url") {
      if (formState[key] instanceof File) {
        data.append(key, formState[key]);
      } else if (
        formState[key] === null &&
        thumbnailPreview &&
        !String(thumbnailPreview).startsWith("blob:")
      ) {
        data.append(key, thumbnailPreview);
      }
      continue;
    }
    if (formState[key] !== null && formState[key] !== undefined) {
      data.append(key, formState[key]);
    }
  }
  return data;
}
