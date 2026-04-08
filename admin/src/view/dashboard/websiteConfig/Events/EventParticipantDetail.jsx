import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import WebConfigSidebar from "../../../../components/WebConfigSidebar";
import { formatDateTimeIST } from "../../../../utils/date";

function DetailRow({ label, value, isLink, isImage }) {
  const v =
    value === null || value === undefined || value === "" ? "—" : String(value);
  const isHttp = v !== "—" && /^https?:\/\//i.test(v);

  let content = v;
  if (isImage && isHttp) {
    content = (
      <div className="space-y-2">
        <img
          src={v}
          alt={label ? `${label} preview` : "Photo preview"}
          className="max-h-56 max-w-full rounded-xl border border-gray-200 object-contain bg-gray-50 shadow-sm"
        />
        <a
          href={v}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs text-cyan-700 underline break-all"
        >
          Open original
        </a>
      </div>
    );
  } else if (isLink && isHttp) {
    content = (
      <a
        href={v}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-700 underline break-all"
      >
        {v}
      </a>
    );
  }

  return (
    <div className="py-3 border-b border-gray-100 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 break-words">
        {content}
      </dd>
    </div>
  );
}

const EventParticipantDetail = () => {
  const { source, recordId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosApi.get(
          `/participant-detail/${encodeURIComponent(source || "")}/${encodeURIComponent(recordId || "")}`,
        );
        if (cancelled) return;
        if (res.data?.success && res.data?.data) {
          setData(res.data.data);
        } else {
          setError(res.data?.message || "Could not load participant");
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message ||
              e.message ||
              "Could not load participant",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source, recordId]);

  const fmt = (v) => {
    if (v == null || v === "") return "—";
    const s = formatDateTimeIST(v);
    return s || String(v);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <WebConfigSidebar />
      <div className="flex-1 ml-10 overflow-auto p-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-medium text-[#0d3c44] hover:underline"
        >
          ← Back to participation list
        </button>

        {loading && (
          <p className="text-gray-600">Loading participant details…</p>
        )}
        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}
        {!loading && !error && data && (
          <div className="max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#0d3c44] to-[#145058] px-6 py-4 text-white">
              <h1 className="text-2xl font-bold">Participant details</h1>
              <p className="text-sm text-white/90 mt-1 capitalize">
                {source === "internal" ? "Portal artist" : "External booking"}
              </p>
            </div>
            <dl className="px-6 py-2 divide-y divide-gray-100">
              {source === "internal" ? (
                <>
                  <DetailRow label="OPH ID" value={data.oph_id} />
                  <DetailRow
                    label="Participant row ID"
                    value={data.participant_row_id}
                  />
                  <DetailRow label="Full name" value={data.full_name} />
                  <DetailRow label="Stage name" value={data.stage_name} />
                  <DetailRow label="Email" value={data.email} />
                  <DetailRow label="Contact number" value={data.contact_number} />
                  <DetailRow label="Artist type" value={data.artist_type} />
                  <DetailRow label="Location" value={data.location} />
                  <DetailRow
                    label="Profession"
                    value={data.profession}
                  />
                  <DetailRow label="Bio" value={data.bio} />
                  <DetailRow
                    label="Instagram (profile)"
                    value={data.instagram_link}
                    isLink
                  />
                  <DetailRow
                    label="Spotify"
                    value={data.spotify_link}
                    isLink
                  />
                  <DetailRow
                    label="Facebook"
                    value={data.facebook_link}
                    isLink
                  />
                  <DetailRow
                    label="Apple Music"
                    value={data.apple_music_link}
                    isLink
                  />
                  <DetailRow
                    label="Personal photo"
                    value={data.personal_photo}
                    isImage
                  />
                  <DetailRow
                    label="Participation status"
                    value={data.participation_status}
                  />
                  <DetailRow
                    label="Registered at"
                    value={fmt(data.participant_created_at)}
                  />
                </>
              ) : (
                <>
                  <DetailRow label="Booking ID" value={data.booking_id} />
                  <DetailRow
                    label="Booking reference"
                    value={data.booking_reference}
                  />
                  <DetailRow label="First name" value={data.first_name} />
                  <DetailRow label="Last name" value={data.last_name} />
                  <DetailRow label="Email" value={data.email} />
                  <DetailRow label="Phone" value={data.phone} />
                  <DetailRow label="Profession" value={data.profession} />
                  <DetailRow
                    label="Instagram"
                    value={data.instagram_handle}
                  />
                  <DetailRow
                    label="Booking status"
                    value={data.booking_status}
                  />
                  <DetailRow
                    label="Payment transaction ID"
                    value={data.payment_transaction_id}
                  />
                  <DetailRow
                    label="Linked OPH ID (if any)"
                    value={data.linked_oph_id}
                  />
                  <DetailRow
                    label="Created at"
                    value={fmt(data.booking_created_at)}
                  />
                </>
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventParticipantDetail;
