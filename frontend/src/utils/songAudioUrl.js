/** Resolve playable URL from song objects (nav + dashboard APIs vary slightly). */
export function resolveSongAudioUrl(song) {
  if (!song) return "";
  const u =
    song.audio_url ||
    song.audio_file_url ||
    song.duration_in_minutes;
  return typeof u === "string" && u.trim() ? u.trim() : "";
}

export function songKey(song) {
  if (!song) return "";
  const v = song.song_id ?? song.id;
  return v != null && String(v).trim() !== "" ? String(v) : "";
}
