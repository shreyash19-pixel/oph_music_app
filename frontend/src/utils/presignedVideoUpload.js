import axios from "axios";

/**
 * Upload a video file via presigned S3 PUT, then return the public URL.
 *
 * @param {import('axios').AxiosInstance} api - axios instance (e.g. axiosApi)
 * @param {File} file
 * @param {object} options
 * @param {string} options.purpose - see backend ALLOWED_PRESIGNED_VIDEO_PURPOSES
 * @param {object} [options.headers] - extra request headers for presign GET
 * @param {object} [options.params] - song_id, page_name, ophid, etc.
 * @param {(ev: import('axios').AxiosProgressEvent) => void} [options.onUploadProgress]
 * @param {(payload: object) => void} [options.onSocketProgress] - e.g. socket.emit
 */
export async function uploadVideoViaPresignedPut(api, file, options = {}) {
  const {
    purpose,
    headers = {},
    params = {},
    onUploadProgress,
    onSocketProgress,
  } = options;

  if (!file || !(file instanceof File)) {
    throw new Error("A video File is required");
  }
  if (!purpose) {
    throw new Error("presigned upload purpose is required");
  }

  const pres = await api.get("/presigned-upload/video", {
    headers,
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
  const putStart = Date.now();
  const totalMB = file.size / (1024 * 1024);

  if (onSocketProgress) {
    onSocketProgress({
      percentage: 0,
      loadedMB: 0,
      totalMB,
      speed: 0,
      time: 0,
    });
  }

  try {
    await axios.put(pres.data.uploadUrl, file, {
      headers: { "Content-Type": contentType },
      timeout: 0,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      onUploadProgress: (ev) => {
        if (onUploadProgress) onUploadProgress(ev);
        if (!onSocketProgress || !ev.total) return;
        const loadedMB = ev.loaded / (1024 * 1024);
        const totalMBEv = ev.total / (1024 * 1024);
        const pct = Math.round((ev.loaded / ev.total) * 100);
        const elapsed = (Date.now() - putStart) / 1000;
        onSocketProgress({
          percentage: pct,
          loadedMB,
          totalMB: totalMBEv,
          speed: loadedMB / (elapsed || 1),
          time: elapsed,
        });
      },
    });
  } catch (putErr) {
    const net =
      putErr?.message === "Network Error" ||
      putErr?.code === "ERR_NETWORK" ||
      !putErr?.response;
    throw new Error(
      net
        ? "Video upload to storage failed (network/CORS). Ensure the S3 bucket allows PUT from your origin."
        : `Video upload to storage failed (${putErr?.response?.status ?? "error"}).`
    );
  }

  return pres.data.publicUrl;
}

/**
 * @param {File|string|null|undefined} fileOrUrl
 * @param {string} purpose
 * @param {object} rest - passed to uploadVideoViaPresignedPut
 */
export async function resolveVideoUrlForUpload(api, fileOrUrl, purpose, rest = {}) {
  if (!fileOrUrl) return null;
  if (typeof fileOrUrl === "string") {
    if (fileOrUrl.startsWith("blob:") || fileOrUrl.startsWith("http")) {
      return fileOrUrl.startsWith("http") ? fileOrUrl : null;
    }
    return fileOrUrl;
  }
  if (fileOrUrl instanceof File) {
    return uploadVideoViaPresignedPut(api, fileOrUrl, { purpose, ...rest });
  }
  return null;
}
