import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const ArtistNew = () => {
  const { ophid } = useParams();
  const [artist, setArtist] = useState({});
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [personalReason, setPersonalReason] = useState("");
  const [professionalReason, setProfessionalReason] = useState("");
  const [documentReason, setDocumentReason] = useState("");

  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [statuses, setStatuses] = useState({
    Personal: null,
    Professional: null,
    Documentation: null,
  });
  const [reasons, setReasons] = useState({
    Personal: "",
    Professional: "",
    Documentation: "",
  });

  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true);
      try {
        const res = await axiosApi.get(`/under-review/${ophid}`);
        const { userDetails = {}, professionalDetails = {}, documentationDetails = {} } = res.data;

        let parsedPhotos = [];
        if (professionalDetails.PhotoURLs) {
          try {
            parsedPhotos = JSON.parse(professionalDetails.PhotoURLs);
          } catch (e) {
            console.error("Error parsing PhotoURLs:", e);
          }
        }

        const experienceMonths = (professionalDetails.ExperienceMonthly % 12) || 0;
        const experienceYears = Math.floor(professionalDetails.ExperienceMonthly / 12);

        const getValue = (val, fallback = "Not Provided") =>
          val && val.toString().trim() !== "" ? val : fallback;

        const newArtist = {
          ophid: getValue(userDetails.ophid),
          full_name: getValue(userDetails.full_name),
          stage_name: getValue(userDetails.stage_name),
          email: getValue(userDetails.email),
          contact_number: getValue(userDetails.contact_num),
          artist_type: getValue(userDetails.artist_type),
          personal_photo: getValue(userDetails.personal_photo, "https://avatars.githubusercontent.com/u/49544693?v=4"),
          location: getValue(userDetails.location),
          profession: getValue(professionalDetails.Profession),
          bio: getValue(professionalDetails.Bio),
          video: getValue(professionalDetails.VideoURL, "https://www.w3schools.com/html/mov_bbb.mp4"),
          spotify: getValue(professionalDetails.SpotifyLink),
          instagram: getValue(professionalDetails.InstagramLink),
          facebook: getValue(professionalDetails.FacebookLink),
          apple_music: getValue(professionalDetails.AppleMusicLink),
          experience_yearly: getValue(experienceYears),
          experience_monthly: getValue(experienceMonths),
          songs_planning_count: getValue(professionalDetails.SongsPlanningCount),
          songs_planning_type: getValue(professionalDetails.SongsPlanningType),
          aadhar_front: getValue(documentationDetails.AadharFrontURL, "https://avatars.githubusercontent.com/u/49544693?v=4"),
          aadhar_back: getValue(documentationDetails.AadharBackURL, "https://avatars.githubusercontent.com/u/49544693?v=4"),
          pan_front: getValue(documentationDetails.PanFrontURL, "https://avatars.githubusercontent.com/u/49544693?v=4"),
          signature: getValue(documentationDetails.SignatureImageURL, "https://avatars.githubusercontent.com/u/49544693?v=4"),
          bank_name: getValue(documentationDetails.BankName),
          account_holder: getValue(documentationDetails.AccountHolderName),
          account_number: getValue(documentationDetails.AccountNumber),
          ifsc_code: getValue(documentationDetails.IFSCCode),
        };

        setArtist(newArtist);
        setPhotos(parsedPhotos);
      } catch (err) {
        console.error("Error fetching artist data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (ophid) {
      fetchArtist();
    }
  }, [ophid]);

  const handleAction = (section, type) => {
    setConfirmAction({ section, type });
  };

  const confirmAndHandle = (section, type, reason) => {
    setStatuses((prev) => ({
      ...prev,
      [section]: type === "Reject" ? "Rejected" : "Accepted",
    }));

    setReasons((prev) => ({
      ...prev,
      [section]: type === "Reject" ? reason : "",
    }));

    if (type === "Reject") {
      toast.error(`Rejected ${section} with reason: ${reason || "No reason provided"}`);
    } else if (type === "Accept") {
      toast.success(`Accepted ${section} successfully!`);
    }

    if (section === "Personal") setPersonalReason("");
    else if (section === "Professional") setProfessionalReason("");
    else if (section === "Documentation") setDocumentReason("");

    setConfirmAction(null);
  };

  const allSectionsDone = Object.values(statuses).every((s) => s !== null);

  const submitFinalDecision = () => {
    setConfirmSubmit(true);
  };

  const confirmFinalSubmit = async () => {
    const result = { ophid: ophid };

    Object.entries(statuses).forEach(([section, status]) => {
      if (status === "Rejected") {
        result[section] = {
          status: "Rejected",
          reason: reasons[section],
        };
      } else {
        result[section] = {
          status: "Accepted",
        };
      }
    });

    console.log("Final Decision Body:", result);
    const res = await axiosApi.post("/update-status", result);

    console.log(res);

    if (res.status === 200) {
      toast.success("Submitted!");
    }

    setConfirmSubmit(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
        Loading artist data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-8 space-y-10">

        <div className="bg-gray-50 rounded-xl shadow-md p-6">
          <SectionBlock
            section="Personal"
            artist={{
              full_name: artist.full_name,
              stage_name: artist.stage_name,
              email: artist.email,
              contact_number: artist.contact_number,
              personal_photo: artist.personal_photo,
              location: artist.location,
            }}
            reason={personalReason}
            setReason={setPersonalReason}
            confirmAction={confirmAction}
            handleAction={handleAction}
            confirmAndHandle={confirmAndHandle}
            status={statuses.Personal}
            setConfirmAction={setConfirmAction}
          />
        </div>

        <div className="bg-gray-50 rounded-xl shadow-md p-6">
          <SectionBlock
            section="Professional"
            artist={{
              profession: artist.profession,
              bio: artist.bio,
              spotify: artist.spotify,
              instagram: artist.instagram,
              facebook: artist.facebook,
              apple_music: artist.apple_music,
              video: artist.video,
              experience_yearly: artist.experience_yearly,
              experience_monthly: artist.experience_monthly,
              photos,
            }}
            reason={professionalReason}
            setReason={setProfessionalReason}
            confirmAction={confirmAction}
            handleAction={handleAction}
            confirmAndHandle={confirmAndHandle}
            status={statuses.Professional}
            setConfirmAction={setConfirmAction}
          />
        </div>

        <div className="bg-gray-50 rounded-xl shadow-md p-6">
          <SectionBlock
            section="Documentation"
            artist={{
              aadhar_front: artist.aadhar_front,
              aadhar_back: artist.aadhar_back,
              pan_front: artist.pan_front,
              signature: artist.signature,
              bank_name: artist.bank_name,
              account_holder: artist.account_holder,
              account_number: artist.account_number,
              ifsc_code: artist.ifsc_code,
            }}
            reason={documentReason}
            setReason={setDocumentReason}
            confirmAction={confirmAction}
            handleAction={handleAction}
            confirmAndHandle={confirmAndHandle}
            status={statuses.Documentation}
            setConfirmAction={setConfirmAction}
          />
        </div>

        <div className="pt-8">
          <button
            disabled={!allSectionsDone}
            onClick={submitFinalDecision}
            className={`w-full py-4 text-lg font-bold rounded-xl shadow ${allSectionsDone
                ? "bg-[#0d3c44] text-white hover:bg-[#14565f]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            Submit Final Decision
          </button>
        </div>

        {confirmSubmit && (
          <ConfirmBlock
            section="Final Decision"
            type="Submit"
            reason=""
            onConfirm={confirmFinalSubmit}
            onCancel={() => setConfirmSubmit(false)}
          />
        )}
      </div>
    </div>
  );
};

const SectionBlock = ({
  section,
  artist,
  reason,
  setReason,
  confirmAction,
  handleAction,
  confirmAndHandle,
  status,
  setConfirmAction,
}) => {
  const isProfessional = section === "Professional";
  const isDocumentation = section === "Documentation";
  const isPersonal = section === "Personal";

  const professionalPhotos = artist.photos || [];
  const documentImages = [
    artist.aadhar_front,
    artist.aadhar_back,
    artist.pan_front,
    artist.signature,
  ].filter(Boolean);

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#0d3c44] mb-2 border-b pb-1">{section} Details</h2>
      <div className="text-sm italic mb-2">Status: {status || "Pending"}</div>

      <div className="border p-4 rounded-xl mb-4 space-y-2">

        {isPersonal && artist.personal_photo && (
          <div className="grid grid-cols-2 gap-4">
            <img
              src={artist.personal_photo}
              alt="Personal"
              className="w-full h-64 rounded-lg object-cover border"
            />
          </div>
        )}

        {isProfessional && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 5 }).map((_, idx) => {
                const url = professionalPhotos[idx] || "https://avatars.githubusercontent.com/u/49544693?v=4";
                return (
                  <img
                    key={idx}
                    src={url}
                    alt={`Professional ${idx + 1}`}
                    className="w-full h-64 rounded-lg object-cover border"
                  />
                );
              })}
            </div>
          </>
        )}

        {isDocumentation && documentImages.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {documentImages.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Document ${idx + 1}`}
                className="w-full h-64 rounded-lg object-cover border"
              />
            ))}
          </div>
        )}

        {isProfessional && artist.video && (
          <video controls className="w-full h-80 mt-4 rounded-lg border">
            <source src={artist.video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        <div className="space-y-4 mt-4">
          {Object.entries(artist).map(([key, value]) => {
            if (
              key === "personal_photo" ||
              key === "video" ||
              key === "aadhar_front" ||
              key === "aadhar_back" ||
              key === "pan_front" ||
              key === "signature" ||
              key === "photos"
            ) {
              return null;
            }
            return (
              <div key={key}>
                <strong>{key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}: </strong>
                {value}
              </div>
            );
          })}
        </div>
      </div>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Enter reason (required if reject)..."
        className="w-full h-24 text-black p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d3c44]"
      />
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => handleAction(section, "Reject")}
          disabled={status !== null}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl shadow hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          Reject
        </button>
        <button
          onClick={() => handleAction(section, "Accept")}
          disabled={status !== null}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          Accept
        </button>
      </div>

      {confirmAction && confirmAction.section === section && (
        <ConfirmBlock
          section={section}
          type={confirmAction.type}
          reason={reason}
          onConfirm={confirmAndHandle}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

const ConfirmBlock = ({ section, type, reason, onConfirm, onCancel }) => (
  <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between mt-4">
    <span className="text-gray-800">Are you sure you want to {type.toLowerCase()} {section} details?</span>
    <div className="space-x-2">
      <button
        onClick={() => onConfirm(section, type, reason)}
        className={`px-4 py-2 ${type === "Reject" ? "bg-red-600" : "bg-green-600"
          } text-white rounded-lg shadow hover:opacity-90 transition-colors`}
      >
        Yes, {type}
      </button>
      <button
        onClick={onCancel}
        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 transition-colors"
      >
        Cancel
      </button>
    </div>
  </div>
);

export default ArtistNew;
