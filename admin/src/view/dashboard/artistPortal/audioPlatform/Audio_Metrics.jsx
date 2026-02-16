import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosApi from "../../../../conf/axios"; // your axios instance
import toast from "react-hot-toast";

export default function Audio_Metrics() {
  const { songId } = useParams();
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  const ReadOnlyField = ({ label, value }) => (
    <div>
      <label className="block text-gray-700 text-sm font-semibold mb-1">
        {label}
      </label>
      <input
        type="text"
        readOnly
        value={value ?? ""}
        className="w-full p-2 border rounded-md text-black bg-gray-100"
      />
    </div>
  );

  const MetricCard = ({ label, value }) => (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xl font-semibold text-[#0d3c44] mt-2">
        {value ?? "-"}
      </div>
    </div>
  );

  const initialPlatforms = ["Spotify", "Apple Music", "Jiosaavan"];

  const [loading, setLoading] = useState(false);
  const [platformsLoading, setPlatformsLoading] = useState(true);
  const [platforms, setPlatforms] = useState(initialPlatforms);
  const [selectedPlatform, setSelectedPlatform] = useState("");

  // keep full fetched records here
  const [records, setRecords] = useState([]);

  // displayed record for the selectedPlatform
  const [originalMetrics, setOriginalMetrics] = useState({
    id: null,
    song_id: "",
    OPH_ID: "",
    song_name: "",
    audio_platform_name: null,
    audio_platform_streams: 0,
    audio_platform_revenue: "0.00",
    created_at: null,
    updated_at: null,
  });

  // Refs for uncontrolled inputs
  const streamsRef = useRef(null);
  const revenueRef = useRef(null);

  // Fetch audio platforms from API
  useEffect(() => {
    async function fetchAudioPlatforms() {
      try {
        setPlatformsLoading(true);
        const res = await axiosApi.get("/get_audio_platforms");
        if (res.data && res.data.data) {
          const platformNames = res.data.data
            .map((platform) => platform.name || platform)
            .filter(Boolean);
          setPlatforms(platformNames);
          if (platformNames.length > 0 && !selectedPlatform) {
            setSelectedPlatform(platformNames[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch audio platforms:", err);
        // Fallback to initial platforms if API fails
        setPlatforms(initialPlatforms);
        if (!selectedPlatform) {
          setSelectedPlatform(initialPlatforms[0]);
        }
      } finally {
        setPlatformsLoading(false);
      }
    }

    fetchAudioPlatforms();
  }, []);

  const sanitize = (obj) => {
    const out = {};
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        out[k] = typeof obj[k] === "undefined" ? null : obj[k];
      }
    }
    return out;
  };

  // helper: choose a record from an array according to rules:
  // exact match -> unnamed (empty) -> first -> null
  const pickRecordForPlatform = (arr, platform) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const exact = arr.find(
      (r) => r && String(r.audio_platform_name) === String(platform),
    );
    if (exact) return exact;
    const unnamed = arr.find(
      (r) =>
        r &&
        (!r.audio_platform_name || String(r.audio_platform_name).trim() === ""),
    );
    if (unnamed) return unnamed;
    return arr[0] || null;
  };

  // fetch records only when songId changes
  useEffect(() => {
    if (!songId) return;
    let cancelled = false;

    async function fetchRecords() {
      try {
        setLoading(true);
        const res = await axiosApi.get(`/get_song_metrics/${songId}`);
        if (cancelled) return;
        const data = res.data.data ?? [];
        const arr = Array.isArray(data) ? data : [data];

        // Note: platforms are now fetched from /get_audio_platforms API
        // We don't override them here anymore

        // store full records
        setRecords(arr);

        // pick record for current selectedPlatform
        const picked = pickRecordForPlatform(arr, selectedPlatform);

        if (!picked) {
          setOriginalMetrics({
            id: null,
            song_id: String(songId),
            OPH_ID: "",
            song_name: "",
            audio_platform_name: null,
            audio_platform_streams: 0,
            audio_platform_revenue: "0.00",
            created_at: null,
            updated_at: null,
          });

          // clear DOM inputs
          if (streamsRef.current) streamsRef.current.value = "";
          if (revenueRef.current) revenueRef.current.value = "";
        } else {
          setOriginalMetrics({
            id: picked.id ?? null,
            song_id: picked.song_id ?? songId,
            OPH_ID: picked.OPH_ID ?? "",
            song_name: picked.song_name ?? "",
            audio_platform_name:
              typeof picked.audio_platform_name !== "undefined" &&
              picked.audio_platform_name !== ""
                ? picked.audio_platform_name
                : null,
            audio_platform_streams:
              parseInt(picked.audio_platform_streams || 0) || 0,
            audio_platform_revenue:
              typeof picked.audio_platform_revenue !== "undefined"
                ? String(picked.audio_platform_revenue)
                : "0.00",
            created_at: picked.created_at ?? null,
            updated_at: picked.updated_at ?? null,
          });

          // sync dropdown if needed
          if (
            picked.audio_platform_name &&
            picked.audio_platform_name !== selectedPlatform
          ) {
            setSelectedPlatform(picked.audio_platform_name);
          }
        }
      } catch (err) {
        console.error("Failed to fetch song_audio_metrics", err);
        toast.error("Failed to load audio metrics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRecords();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

  // whenever selectedPlatform changes, pick the corresponding record from `records`
  useEffect(() => {
    const picked = pickRecordForPlatform(records, selectedPlatform);
    if (!picked) {
      setOriginalMetrics((prev) => ({
        ...prev,
        id: null,
        song_id: String(songId || prev.song_id),
        OPH_ID: prev.OPH_ID || "",
        song_name: prev.song_name || "",
        audio_platform_name: null,
        audio_platform_streams: 0,
        audio_platform_revenue: "0.00",
        created_at: null,
        updated_at: null,
      }));
      // do not touch uncontrolled input DOM while switching platforms (unless you want to clear)
      return;
    }

    setOriginalMetrics({
      id: picked.id ?? null,
      song_id: picked.song_id ?? songId,
      OPH_ID: picked.OPH_ID ?? "",
      song_name: picked.song_name ?? "",
      audio_platform_name:
        typeof picked.audio_platform_name !== "undefined" &&
        picked.audio_platform_name !== ""
          ? picked.audio_platform_name
          : null,
      audio_platform_streams: parseInt(picked.audio_platform_streams || 0) || 0,
      audio_platform_revenue:
        typeof picked.audio_platform_revenue !== "undefined"
          ? String(picked.audio_platform_revenue)
          : "0.00",
      created_at: picked.created_at ?? null,
      updated_at: picked.updated_at ?? null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform, records]);

  // helper: update the `records` array when creating/updating
  const upsertRecordInState = (rec) => {
    setRecords((prev) => {
      const copy = Array.isArray(prev) ? [...prev] : [];
      const idx = copy.findIndex((r) => r && r.id === rec.id);
      if (idx >= 0) {
        copy[idx] = { ...copy[idx], ...rec };
      } else {
        // insert new record at front
        copy.unshift(rec);
      }
      return copy;
    });
  };

  // CREATE uses selectedPlatform from dropdown
  const createPlatformRecord = async () => {
    const platformToCreate = String(selectedPlatform || "").trim();
    if (!platformToCreate || !songId) {
      toast.error("Please select a platform name");
      return;
    }
    try {
      setLoading(true);
      const payload = sanitize({
        song_id: Number(songId),
        OPH_ID: originalMetrics.OPH_ID || "",
        song_name: originalMetrics.song_name || "",
        audio_platform_name: platformToCreate,
        audio_platform_streams: 0,
        audio_platform_revenue: "0.00",
      });

      const res = await axiosApi.post("/create_audio_metrics", payload);
      toast.success("Platform record created");
      const created = res.data?.data || res.data || {};

      // update local state
      const createdRec = {
        id: created.id ?? null,
        song_id: created.song_id ?? Number(songId),
        OPH_ID: created.OPH_ID ?? originalMetrics.OPH_ID ?? "",
        song_name: created.song_name ?? originalMetrics.song_name ?? "",
        audio_platform_name: created.audio_platform_name ?? platformToCreate,
        audio_platform_streams:
          parseInt(created.audio_platform_streams || 0) || 0,
        audio_platform_revenue:
          typeof created.audio_platform_revenue !== "undefined"
            ? String(created.audio_platform_revenue)
            : "0.00",
        created_at: created.created_at ?? new Date().toISOString(),
        updated_at: created.updated_at ?? new Date().toISOString(),
      };

      upsertRecordInState(createdRec);

      setOriginalMetrics(createdRec);

      // add to platforms and select it
      setPlatforms((p) =>
        Array.from(new Set([...(p || []), platformToCreate])),
      );
      setSelectedPlatform(platformToCreate);
    } catch (err) {
      console.error("Create failed", err);
      const msg =
        err?.response?.data?.details || "Failed to create platform record";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Save reads values from refs (uncontrolled inputs)
  const handleSave = async () => {
    try {
      const streamsVal = streamsRef.current ? streamsRef.current.value : "";
      const revenueVal = revenueRef.current ? revenueRef.current.value : "";

      const addStreams = parseInt(streamsVal || 0) || 0;
      const addRevenue = parseFloat(revenueVal || 0) || 0;

      const newStreams =
        (originalMetrics.audio_platform_streams || 0) + addStreams;
      const newRevenue =
        (parseFloat(originalMetrics.audio_platform_revenue || 0) || 0) +
        addRevenue;

      const payload = sanitize({
        id: originalMetrics.id,
        song_id: originalMetrics.song_id || Number(songId),
        OPH_ID: originalMetrics.OPH_ID || "",
        song_name: originalMetrics.song_name || "",
        audio_platform_name:
          originalMetrics.audio_platform_name || selectedPlatform,
        audio_platform_streams: newStreams,
        audio_platform_revenue: Number(newRevenue).toFixed(2),
      });

      setLoading(true);
      const res = await axiosApi.post("/update_audio_metrics", payload);
      toast.success("Audio metrics saved!");
      console.log("Saved:", res.data);

      // build updated record from response (or fallback to payload)
      const returned = res.data?.data || res.data || {};
      const updatedRec = {
        id: returned.id ?? payload.id ?? originalMetrics.id,
        song_id: returned.song_id ?? payload.song_id,
        OPH_ID: returned.OPH_ID ?? payload.OPH_ID,
        song_name: returned.song_name ?? payload.song_name,
        audio_platform_name:
          returned.audio_platform_name ?? payload.audio_platform_name,
        audio_platform_streams:
          returned.audio_platform_streams ?? payload.audio_platform_streams,
        audio_platform_revenue:
          typeof returned.audio_platform_revenue !== "undefined"
            ? String(returned.audio_platform_revenue)
            : String(payload.audio_platform_revenue),
        created_at: returned.created_at ?? originalMetrics.created_at,
        updated_at: returned.updated_at ?? new Date().toISOString(),
      };

      // update local records & displayed metrics
      upsertRecordInState(updatedRec);
      setOriginalMetrics((prev) => ({
        ...prev,
        id: updatedRec.id,
        audio_platform_streams: updatedRec.audio_platform_streams,
        audio_platform_revenue: updatedRec.audio_platform_revenue,
        updated_at: updatedRec.updated_at,
      }));

      // clear DOM input values after successful save
      if (streamsRef.current) streamsRef.current.value = "";
      if (revenueRef.current) revenueRef.current.value = "";
    } catch (err) {
      console.error("Save failed", err);
      const message =
        err?.response?.data?.details || "Failed to save audio metrics";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformSelect = (e) => {
    setSelectedPlatform(e.target.value);
  };

  const handlePageChange = (e) => {
    const page = e.target.value;
    if (page) navigate(page);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  const recordMissing = !originalMetrics.audio_platform_name;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Platform Selector / Create */}
      <div className="w-full px-8 py-8">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Select Audio Platform
          </label>

          <div className="flex gap-4 items-center">
            <select
              className="flex-1 p-4 border rounded-xl text-lg bg-white"
              value={selectedPlatform}
              onChange={handlePlatformSelect}
              disabled={platformsLoading}
            >
              {platformsLoading ? (
                <option>Loading platforms...</option>
              ) : (
                platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))
              )}
            </select>

            <button
              onClick={() => {
                // force re-evaluate selection (keeps same selectedPlatform but triggers no fetch)
                setSelectedPlatform((s) => (s ? String(s) : s));
                toast.success("Platform selected: " + selectedPlatform);
              }}
              className="bg-[#0d3c44] text-white px-6 py-3 rounded-xl hover:bg-[#0a2d33] transition"
            >
              Load Metrics
            </button>
          </div>

          {recordMissing && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <div className="text-sm text-gray-700 font-semibold mb-2">
                No platform record found — create one
              </div>

              <div className="flex gap-2 items-center">
                <select
                  className="flex-1 p-2 border rounded-md bg-white"
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  disabled={platformsLoading}
                >
                  {platformsLoading ? (
                    <option>Loading platforms...</option>
                  ) : (
                    platforms.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))
                  )}
                </select>
                <button
                  onClick={createPlatformRecord}
                  className="bg-[#0d3c44] text-white px-4 py-2 rounded-md hover:bg-[#0a2d33] transition"
                >
                  Create Platform Record
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Select a platform from the dropdown above to create a record
                for.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Form */}
      <div className="w-full px-8 pb-10">
        <div className="bg-white rounded-2xl shadow-md p-8 space-y-6 w-full">
          <div className="text-lg text-gray-600">
            <strong>OphID:</strong> {originalMetrics.OPH_ID} &nbsp; | &nbsp;{" "}
            <strong>SongID:</strong> {songId} &nbsp; | &nbsp;{" "}
            <strong>Platform:</strong>{" "}
            {originalMetrics.audio_platform_name || selectedPlatform}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReadOnlyField label="Song ID" value={originalMetrics.song_id} />
            <ReadOnlyField label="OPH ID" value={originalMetrics.OPH_ID} />
            <ReadOnlyField
              label="Song Name"
              value={originalMetrics.song_name}
            />
            <ReadOnlyField
              label="Audio Platform Name"
              value={originalMetrics.audio_platform_name ?? "-"}
            />

            {/* Uncontrolled inputs: use refs so DOM node is stable while typing */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">
                Audio Platform Streams (Add to Current)
              </label>
              <input
                ref={streamsRef}
                type="text"
                name="audio_platform_streams"
                defaultValue=""
                placeholder="e.g. 100"
                className="w-full p-2 border rounded-md text-black bg-white"
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">
                Audio Platform Revenue (Add to Current, e.g. 12.34)
              </label>
              <input
                ref={revenueRef}
                type="text"
                name="audio_platform_revenue"
                defaultValue=""
                placeholder="e.g. 12.34"
                className="w-full p-2 border rounded-md text-black bg-white"
                inputMode="decimal"
              />
            </div>
          </div>

          <div className="pt-4 text-right">
            <button
              onClick={handleSave}
              className="bg-[#0d3c44] text-white px-6 py-2 rounded-md hover:bg-[#0a2d33] transition"
            >
              Save Audio Metrics
            </button>
          </div>
        </div>

        {/* Current Stored Metrics */}
        <div className="mt-6 bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Current Stored Metrics (Selected Platform)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              label="Audio Platform Streams"
              value={originalMetrics.audio_platform_streams}
            />
            <MetricCard
              label="Audio Platform Revenue"
              value={originalMetrics.audio_platform_revenue}
            />
            <MetricCard
              label="Created At"
              value={formatDate(originalMetrics.created_at)}
            />
            <MetricCard
              label="Updated At"
              value={formatDate(originalMetrics.updated_at)}
            />
          </div>

          {/* Optionally show other platforms quick list (read-only) */}
          {records && records.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              <strong>Other platform records:</strong>{" "}
              {records
                .filter(
                  (r) =>
                    r &&
                    r.audio_platform_name &&
                    r.audio_platform_name !==
                      originalMetrics.audio_platform_name,
                )
                .map((r) => r.audio_platform_name || "Unnamed")
                .join(", ") || "-"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
