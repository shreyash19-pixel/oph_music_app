import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import { uploadVideoViaPresignedPut } from "../../../../utils/presignedVideoUpload";
import { Lock, Unlock, Download } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../../../auth/AuthProvider";
import { ROLES } from "../../../../utils/roles";
import { canDownloadMembershipPdf } from "../../../../utils/allDataPermissions";
import { normalizeExperienceFromProfessionalDetails } from "../../../../utils/experienceDisplay";

/** Roles that land with every field unlocked for editing. Sales members are view-only (see `isSalesMemberViewOnly`). */
const ARTIST_ALL_DETAIL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.ADMINISTRATIVE_MEMBER,
  ROLES.SALES_HEAD,
];

const isSalesMemberViewOnly = (role) => role === ROLES.SALES_MEMBER;

const ArtistAll = () => {
  const { user } = useAuth();
  const viewOnlyNoEdit = isSalesMemberViewOnly(user?.role);
  const { ophid } = useParams();
  const [personal, setPersonal] = useState({});
  const [professional, setProfessional] = useState({});
  const [document, setDocument] = useState({});
  const [professions, setProfessions] = useState([]);
  const [professionsLoading, setProfessionsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [locks, setLocks] = useState({});
  const fileInputRefs = useRef({});
  const signatureCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    // Set browser flag
    setIsBrowser(true);

    // Initialize signature canvas
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch artist data and professions in parallel
        const [artistRes, professionsRes] = await Promise.all([
          axiosApi.get(`/completed/${ophid}`),
          axiosApi.get("/get_professions"),
        ]);

        console.log(artistRes);
        console.log(professionsRes);

        const { userDetails, professionalDetails, documentationDetails } =
          artistRes.data;

        // Debug: Log professional details to see the structure
        console.log("Professional Details:", professionalDetails);

        // Set professions data
        if (professionsRes.data.success) {
          setProfessions(professionsRes.data.data);
          console.log("Professions loaded:", professionsRes.data.data);
        }
        setProfessionsLoading(false);

        const personalData = {
          full_name: userDetails.full_name || "",
          stage_name: userDetails.stage_name || "",
          email: userDetails.email || "",
          contact_number: userDetails.contact_number || "",
          artist_type: userDetails.artist_type || "",
          location: userDetails.location || "",
          personal_photo: userDetails.personal_photo || "",
        };

        const {
          years: expYears,
          months: expMonths,
          totalMonths: expTotalMonths,
        } = normalizeExperienceFromProfessionalDetails(professionalDetails);

        const professionalData = {
          profession:
            professionalDetails.Profession ||
            professionalDetails.profession ||
            "",
          bio: professionalDetails.bio || "",
          video: professionalDetails.video_url || "",
          photos: JSON.parse(professionalDetails.photo_urls || "[]"),
          spotify: professionalDetails.spotify_link || "",
          instagram: professionalDetails.instagram_link || "",
          facebook: professionalDetails.facebook_link || "",
          apple_music: professionalDetails.apple_music_link || "",
          experience_monthly: expMonths,
          experience_yearly: expYears,
          songs_planning_count: professionalDetails.songs_planning_count || "",
          songs_planning_type: professionalDetails.songs_planning_type || "",
        };

        professionalData._totalMonths = expTotalMonths;

        const documentData = {
          aadhar_front_url: documentationDetails.aadhar_front_url || "",
          aadhar_back_url: documentationDetails.aadhar_back_url || "",
          pan_front_url: documentationDetails.pan_front_url || "",
          signature_image_url: documentationDetails.signature_image_url || "",
          bank_name: documentationDetails.bank_name || "",
          account_holder_name: documentationDetails.account_holder_name || "",
          account_number: documentationDetails.account_number || "",
          ifsc_code: documentationDetails.ifsc_code || "",
        };

        // Initialize locks (locked=true). Roles that use this page start unlocked for usability.
        const newLocks = {};
        const initiallyLocked = !ARTIST_ALL_DETAIL_ROLES.includes(
          user?.role || "",
        );
        [personalData, professionalData, documentData].forEach(
          (sectionData, sectionIdx) => {
            Object.keys(sectionData).forEach((key) => {
              if (key === "photos" && Array.isArray(sectionData[key])) {
                sectionData[key].forEach((_, idx) => {
                  newLocks[`${sectionIdx}_${key}_${idx}`] = initiallyLocked;
                });
              } else {
                newLocks[`${sectionIdx}_${key}`] = initiallyLocked;
              }
            });
          },
        );

        setPersonal(personalData);
        setProfessional(professionalData);
        setDocument(documentData);
        setLocks(newLocks);
      } catch (error) {
        console.error("Error fetching artist data:", error);
        setProfessionsLoading(false);
      }
    };

    fetchData();
  }, [ophid, user?.role]);

  const handleChange = (sectionSetter) => (field, value) => {
    sectionSetter((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e, key, onChange, index = null) => {
    const file = e.target.files[0];

    if (file) {
      const url = URL.createObjectURL(file);

      if (index !== null) {
        onChange("photos", (prevPhotos) => {
          if (prevPhotos.length >= 5) {
            toast.error(
              "Maximum 5 images allowed. Please delete some images before adding new ones.",
            );
            return prevPhotos;
          }

          const updated = [...prevPhotos];
          updated[index] = { url, file };
          return updated;
        });
      } else {
        // Store both preview and file for ALL uploads
        onChange(key, { url, file });
      }
    }
  };

  // Signature drawing functions
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = (onChange) => {
    const canvas = signatureCanvasRef.current;
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "signature.png", { type: "image/png" });
        const url = URL.createObjectURL(blob);
        onChange("signature", { url, file });
        toast.success("Signature saved successfully!");
      }
    }, "image/png");
  };

  const toggleLock = (lockKey) => {
    if (viewOnlyNoEdit) return;
    setLocks((prev) => ({ ...prev, [lockKey]: !prev[lockKey] }));
  };

  const showConfirmationToast = (onConfirm) => {
    toast(
      (t) => (
        <span>
          Are you sure you want to save?
          <div className="mt-2 flex justify-center gap-4">
            <button
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={() => {
                onConfirm();
                toast.dismiss(t.id);
              }}
            >
              Yes
            </button>
            <button
              className="bg-gray-300 px-3 py-1 rounded"
              onClick={() => toast.dismiss(t.id)}
            >
              No
            </button>
          </div>
        </span>
      ),
      { duration: 5000 },
    );
  };

  const handleSaveSection = async (sectionName, currentData) => {
    if (viewOnlyNoEdit) {
      toast.error("You have view-only access. You cannot save changes.");
      return;
    }
    showConfirmationToast(async () => {
      try {
        setLoading(true);
        if (sectionName === "Personal Details") {
          await updatePersonalDetails(currentData);
        } else if (sectionName === "Professional Details") {
          await updateProfessionalDetails(currentData);
        } else if (sectionName === "Document Details") {
          await updateDocumentationDetails(currentData);
        } else {
          console.log(`${sectionName} final data:`, currentData);
        }
      } catch (error) {
        console.error(`Error saving ${sectionName}:`, error);
        toast.error(`Failed to save ${sectionName}`);
      } finally {
        setLoading(false);
      }
    });
  };

  const updatePersonalDetails = async (personalData) => {
    try {
      const formData = new FormData();

      // Prepare the data object for the API
      const userData = {
        full_name: personalData.full_name || "",
        stage_name: personalData.stage_name || "",
        contact_number: personalData.contact_number || "",
        location: personalData.location || "",
        email: personalData.email || "",
        artist_type: personalData.artist_type || "",
      };

      // Append the data object as JSON string
      formData.append("ophid", ophid);
      formData.append("data", JSON.stringify(userData));

      // Handle profile image upload
      let hasNewImage = false;
      if (personalData.personal_photo) {
        if (
          typeof personalData.personal_photo === "object" &&
          personalData.personal_photo.file
        ) {
          // New file uploaded
          formData.append("profile_image", personalData.personal_photo.file);
          hasNewImage = true;
        } else if (personalData.personal_photo instanceof File) {
          // Direct file object
          formData.append("profile_image", personalData.personal_photo);
          hasNewImage = true;
        } else if (
          typeof personalData.personal_photo === "string" &&
          personalData.personal_photo.startsWith("blob:")
        ) {
          // Convert blob URL to file if needed
          const response = await fetch(personalData.personal_photo);
          const blob = await response.blob();
          const file = new File([blob], "profile_image.jpg", {
            type: blob.type,
          });
          formData.append("profile_image", file);
          hasNewImage = true;
        }
      }

      // If no new image is provided, we need to get the existing image from the database
      if (!hasNewImage) {
        try {
          // Fetch existing user data to get current personal_photo
          const existingDataResponse = await axiosApi.get(
            `/auth/personal-details?ophid=${ophid}`,
          );
          if (
            existingDataResponse.data.success &&
            existingDataResponse.data.data.profile_pic
          ) {
            // Add existing image URL to the data object
            userData.existing_image_url =
              existingDataResponse.data.data.profile_pic;
            // Update the data in formData
            formData.set("data", JSON.stringify(userData));
          }
        } catch (fetchError) {
          console.warn("Could not fetch existing image data:", fetchError);
          // Continue without existing image - the backend will handle this case
        }
      }

      const response = await axiosApi.put("/update-user-details", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Personal details updated successfully!");
        // Optionally refresh the data
        // await fetchData();
      } else {
        toast.error(
          response.data.message || "Failed to update personal details",
        );
      }
    } catch (error) {
      console.error("Error updating personal details:", error);
      toast.error("Failed to update personal details. Please try again.");
    }
  };

  const updateProfessionalDetails = async (professionalData) => {
    try {
      const formData = new FormData();

      // Prepare the data object for the API
      const userData = {
        profession: professionalData.profession || "",
        bio: professionalData.bio || "",
        video:
          typeof professionalData.video === "object"
            ? professionalData.video.url
            : professionalData.video || "",
        photos: professionalData.photos || [],
        spotify: professionalData.spotify || "",
        instagram: professionalData.instagram || "",
        facebook: professionalData.facebook || "",
        apple_music: professionalData.apple_music || "",
        experience_yearly: professionalData.experience_yearly || 0,
        experience_monthly: professionalData.experience_monthly || 0,
        songs_planning_count: professionalData.songs_planning_count || 0,
        songs_planning_type: professionalData.songs_planning_type || "",
      };

      // Append the data object as JSON string
      formData.append("ophid", ophid);
      formData.append("data", JSON.stringify(userData));

      // Handle photo uploads - convert blob URLs to files and upload
      let fileCount = 0;
      if (professionalData.photos && Array.isArray(professionalData.photos)) {
        console.log("Processing photos for upload:", professionalData.photos);
        for (const photo of professionalData.photos) {
          if (photo && typeof photo === "object" && photo.url && photo.file) {
            // This is a new file upload with file object
            console.log("Adding file object:", photo.file);
            formData.append("photos", photo.file);
            fileCount++;
          } else if (typeof photo === "string" && photo.startsWith("blob:")) {
            // This is a blob URL that needs to be converted to file
            try {
              console.log("Converting blob URL to file:", photo);
              const response = await fetch(photo);
              const blob = await response.blob();
              const file = new File([blob], `photo_${Date.now()}.jpg`, {
                type: blob.type || "image/jpeg",
              });
              console.log("Converted blob to file:", file);
              formData.append("photos", file);
              fileCount++;
            } catch (error) {
              console.error("Error converting blob to file:", error);
            }
          }
        }
      }

      if (professionalData.video) {
        const videoRef =
          typeof professionalData.video === "object"
            ? professionalData.video.url
            : professionalData.video;
        if (videoRef && videoRef.startsWith("blob:")) {
          try {
            const response = await fetch(videoRef);
            const blob = await response.blob();
            const file = new File([blob], `video_${Date.now()}.mp4`, {
              type: blob.type || "video/mp4",
            });
            userData.video = await uploadVideoViaPresignedPut(file, {
              purpose: "admin-professional",
              params: { ophid },
            });
            formData.set("data", JSON.stringify(userData));
          } catch (error) {
            console.error("Error uploading video via presigned PUT:", error);
          }
        } else if (videoRef && !videoRef.startsWith("blob:")) {
          userData.video = videoRef;
          formData.set("data", JSON.stringify(userData));
        }
      }

      console.log(`Total files to upload: ${fileCount}`);

      console.log("Sending professional data:", {
        ophid,
        userData,
        photoCount: professionalData.photos
          ? professionalData.photos.length
          : 0,
      });

      const response = await axiosApi.put(
        "/update-professional-details",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        toast.success("Professional details updated successfully!");
      } else {
        toast.error(
          response.data.message || "Failed to update professional details",
        );
      }
    } catch (error) {
      console.error("Error updating professional details:", error);
      toast.error("Failed to update professional details. Please try again.");
    }
  };

  const updateDocumentationDetails = async (documentData) => {
    try {
      console.log(documentData.aadhar_front_url);

      const formData = new FormData();
      formData.append("ophid", ophid);
      formData.append("bank_name", documentData.bank_name);
      formData.append("account_holder_name", documentData.account_holder_name);
      formData.append("account_number", documentData.account_number);
      formData.append("ifsc_code", documentData.ifsc_code);

      const fileFields = [
        "aadhar_front_url",
        "aadhar_back_url",
        "pan_front_url",
        "signature_image_url",
      ];

      for (const field of fileFields) {
        const value = documentData[field];

        if (!value) continue;

        // case 1: {url, file}
        if (typeof value === "object" && value.file) {
          formData.append(field, value.file);
        }

        // case 2: blob preview URL
        else if (typeof value === "string" && value.startsWith("blob:")) {
          const response = await fetch(value);
          const blob = await response.blob();

          const file = new File([blob], `${field}_${Date.now()}.png`, {
            type: blob.type || "image/png",
          });

          formData.append(field, file);
        }

        // case 3: existing AWS URL
        else if (typeof value === "string") {
          formData.append(field, value);
        }
      }

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // return;

      const response = await axiosApi.post(
        "/update-documentation-details",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        toast.success("Documentation details updated successfully!");
      } else {
        toast.error(
          response.data.message || "Failed to update documentation details",
        );
      }
    } catch (error) {
      console.error("Error updating documentation details:", error);
      toast.error("Failed to update documentation details. Please try again.");
    }
  };
}
const downloadPDF = async () => {
  let loadingToast;

  try {
    // Check browser environment
    if (
      typeof window === "undefined" ||
      typeof window.document === "undefined"
    ) {
      console.error("Not in browser environment");
      toast.error("Download feature is not available in this environment");
      return;
    }

    if (!ophid) {
      toast.error("No artist ID available for PDF download");
      return;
    }

    loadingToast = toast.loading("Downloading PDF...");

    const response = await axiosApi.get("/auth/membership/pdf", {
      params: { ophid },
      responseType: "blob",
      validateStatus: () => true,
    });

    const pdfFileName = `${(personal.full_name || "membership")
      .replace(/\s+/g, "_")
      .trim()}.pdf`;

    // Handle API errors
    if (response.status !== 200) {
      let msg = "Failed to download PDF";

      try {
        const text = await response.data.text();
        const json = JSON.parse(text);

        if (json?.message) {
          msg = json.message;
        }
      } catch {
        // Ignore parsing errors
      }

      throw new Error(msg);
    }

    // Create downloadable blob
    const downloadBlob = new Blob([response.data], {
      type: "application/pdf",
    });

    const objectUrl = URL.createObjectURL(downloadBlob);

    // Create temporary link
    const tempLink = document.createElement("a");
    tempLink.href = objectUrl;
    tempLink.download = pdfFileName;

    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 100);

    toast.dismiss(loadingToast);
    toast.success("PDF downloaded successfully!");
  } catch (error) {
    console.error("Error downloading PDF:", error);

    if (loadingToast) {
      toast.dismiss(loadingToast);
    }

    const raw =
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error";

    const networkHint = /failed to fetch|network error|load failed/i.test(
      String(raw)
    )
      ? " Ensure VITE_API_URL points to your API (use HTTPS when the admin app is served over HTTPS)."
      : "";

    toast.error(`Failed to download PDF: ${raw}${networkHint}`);
  }
};

const Section = ({
  title,
  data,
  onChange,
  onSave,
  renderInput,
  sectionIdx,
  locks,
  toggleLock,
  onDownloadPDF,
  showDownloadButton = false,
  isBrowser = false,
  viewOnlyNoEdit = false,
  loading,
  setLoading,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-[#0d3c44]" />
        <p className="mt-3 text-gray-600 font-medium">Loading section...</p>
      </div>
    );
  }
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#0d3c44] mb-6 border-b pb-2">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.entries(data)
          .filter(([key]) => !key.startsWith("_")) // Filter out internal fields like _totalMonths
          .map(([key, value]) => {
            const lockKey = `${sectionIdx}_${key}`;
            return (
              <div key={key}>
                <label className="block text-gray-700 text-sm font-semibold mb-1 capitalize">
                  {key.replace(/_/g, " ")}
                </label>
                <div className="relative">
                  {renderInput(key, value, onChange, data, lockKey, sectionIdx)}
                  {key !== "photos" && !viewOnlyNoEdit && (
                    <button
                      type="button"
                      onClick={() => toggleLock(lockKey)}
                      className="absolute top-1 right-1 p-1 bg-white rounded-full border shadow hover:bg-gray-100 transition"
                    >
                      {locks[lockKey] ? (
                        <Lock size={16} className="text-gray-600" />
                      ) : (
                        <Unlock size={16} className="text-green-600" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
      <div className="mt-6 flex justify-between items-center">
        {showDownloadButton && onDownloadPDF && isBrowser && (
          <button
            onClick={(e) => {
              e.preventDefault();
              if (
                typeof window !== "undefined" &&
                typeof window.document !== "undefined"
              ) {
                onDownloadPDF();
              } else {
                console.error("Not in browser environment when button clicked");
              }
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            Download PDF
          </button>
        )}
        {!viewOnlyNoEdit && (
          <button
            type="button"
            onClick={onSave}
            className="bg-[#0d3c44] text-white px-6 py-2 rounded-md hover:bg-[#0a2d33]"
          >
            Save {title}
          </button>
        )}
      </div>
    </div>
  );
};

export default ArtistAll;
