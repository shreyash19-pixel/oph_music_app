/** Keep in sync with frontend/src/utils/resourceSlug.js (slugifyTitle). */
function slugifyTitle(str) {
  return (
    String(str ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
      .slice(0, 96) || "item"
  );
}

module.exports = { slugifyTitle };
