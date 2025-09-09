import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  getDocumentationDetails,
  updateDocumentationDetails,
} from "../../API/profile";
import ProfileFormHeader from "../components/ProfileFormHeader";
import Loading from "../../../../components/Loading";
import { useArtist } from "../../API/ArtistContext";
import PlayBtn from "../../../../../public/assets/images/playButton.png";
import MusicBg from "../../../../../public/assets/images/music_bg.png";
import Elipse from "../../../../../public/assets/images/elipse2.png";
import axiosApi from "../../../../conf/axios";
import SignatureCanvas from "react-signature-canvas";
// import { fetchVideoForScreen } from "../../../../utils/fetchVideo";
import MembershipForm from "../MembershipFrom";
// Removed hardcoded banking array - now fetched from API

const DocumentationDetailsForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { headers, ophid } = useArtist();

  const [loading, setLoading] = useState(true);

  const [banks, setBanks] = useState([]);
  const signatureCanvasRef = useRef(null);

  // Function to fetch banks from API
  const fetchBanks = useCallback(async () => {
    try {
      const response = await axiosApi.get("/get_banks");
      if (response.data.success) {
        setBanks(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
      toast.error("Failed to load banks list");
    }
  }, []);
  const [isPlaying, setIsPlaying] = useState(false); // Track video play state
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [rejectReason, setRejectReason] = useState(""); // State to store reject reason
  // const fetchVideo = async () => {
  //   try {
  //     const response = await axiosApi.get(
  //       "artist-website-configs?param=signup_video"
  //     );
  //     setVideo(response.data.data[0]);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  // const togglePlayPause = () => {
  //   if (videoRef.current) {
  //     if (isPlaying) {
  //       videoRef.current.pause();
  //     } else {
  //       videoRef.current.play();
  //     }
  //   }
  // };
  // useEffect(() => {
  //   fetchVideo();
  // }, []);
  const [formData, setFormData] = useState({
    aadharFront: null,
    aadharBack: null,
    panFront: null,
    panBack: null,
    signature: null,
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    agreementAccepted: false,
    step_status: "",
    reject_reason: "",
  });

  const [checkSimilarData, setcheckSimilarData] = useState({
    aadharFront: null,
    aadharBack: null,
    panFront: null,
    panBack: null,
    signature: null,
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    agreementAccepted: false,
    step_status: "",
    reject_reason: "",
  });
  const [videoUrl, setVideoUrl] = useState(null);

  // useEffect(() => {
  //   const loadVideo = async () => {
  //     const url = await fetchVideoForScreen("documentation_video");
  //     setVideoUrl(url);
  //   };
  //   loadVideo();
  // }, []);

  const fetchDocumentationDetails = async () => {
    try {
      if (!headers || !headers.Authorization) {
        console.warn("Headers not ready yet");
        return;
      }

      const response = await getDocumentationDetails(headers, ophid);
      console.log(response);
      if (response.success && response.data.length > 0) {
        const doc = response.data[0];
        // BankName is now stored as string directly
        const BankName = doc.BankName;

        const aadharFrontFile = doc.AadharFrontURL
          ? await urlToFile(doc.AadharFrontURL, "aadhar-front.png")
          : null;
        const aadharBackFile = doc.AadharBackURL
          ? await urlToFile(doc.AadharBackURL, "aadhar-back.png")
          : null;
        const panFrontFile = doc.PanFrontURL
          ? await urlToFile(doc.PanFrontURL, "pan-front.png")
          : null;
        const signatureFile = doc.SignatureImageURL
          ? await urlToFile(doc.SignatureImageURL, "signature.png")
          : null;

        const baseForm = {
          aadharFront: aadharFrontFile
            ? { file: aadharFrontFile, preview: doc.AadharFrontURL }
            : null,
          aadharBack: aadharBackFile
            ? { file: aadharBackFile, preview: doc.AadharBackURL }
            : null,
          panFront: panFrontFile
            ? { file: panFrontFile, preview: doc.PanFrontURL }
            : null,
          signature: signatureFile
            ? { file: signatureFile, preview: doc.SignatureImageURL }
            : null,
          bankName: BankName || "",
          accountHolder: doc.AccountHolderName || "",
          accountNumber: doc.AccountNumber || "",
          ifscCode: doc.IFSCCode || "",
          agreementAccepted: doc.AgreementAccepted,
          step_status: doc.step_status,
          reject_reason: doc.reject_reason,
        };

        setFormData(baseForm);
        setcheckSimilarData(baseForm);

        if (response.data[0].reject_reason != null) {
          setRejectReason(response.data[0].reject_reason);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch documentation details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ophid) {
      fetchDocumentationDetails();
    }
  }, [ophid]);

  // Fetch banks when component mounts
  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const parseString = (accept) => {
    if (accept === "false") {
      return 0;
    } else {
      return 1;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileUpload = (name, file) => {
    if (file) {
      // Check file type and size
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, JPEG, and PNG files are allowed");
        return;
      }

      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          [name]: {
            file: file,
            preview: e.target.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = signatureCanvasRef.current;
    setFormData((prev) => ({
      ...prev,
      signature: canvas.toDataURL(),
    }));
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    canvas.clear();
    setFormData((prev) => ({
      ...prev,
      signature: null,
    }));
  };
  const urlToFile = async (url, filename) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const checkSimilarity = () => {
    let isSimilarity = false;

    if (
      formData.aadharFront?.file === checkSimilarData.aadharFront?.file &&
      formData.aadharFront?.preview === checkSimilarData.aadharFront?.preview &&
      formData.aadharBack?.file === checkSimilarData.aadharBack?.file &&
      formData.aadharBack?.preview === checkSimilarData.aadharBack?.preview &&
      formData.panFront?.file === checkSimilarData.panFront?.file &&
      formData.panFront?.preview === checkSimilarData.panFront?.preview &&
      formData.signature?.file === checkSimilarData.signature?.file &&
      formData.signature?.preview === checkSimilarData.signature?.preview &&
      formData.bankName === checkSimilarData.bankName &&
      formData.accountHolder === checkSimilarData.accountHolder &&
      formData.accountNumber === checkSimilarData.accountNumber &&
      formData.ifscCode === checkSimilarData.ifscCode &&
      formData.agreementAccepted === checkSimilarData.agreementAccepted
    ) {
      toast.error("Please check rejection reason and make update");
      isSimilarity = true;
    }
    return isSimilarity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Validation checks
    if (!formData.aadharFront) {
      toast.error("Please upload Aadhar Front");
      setLoading(false);
      return;
    }
    if (!formData.aadharBack) {
      toast.error("Please upload Aadhar Back");
      setLoading(false);
      return;
    }

    if (!formData.signature) {
      toast.error("Please provide your signature");
      setLoading(false);
      return;
    }

    if (!formData.bankName) {
      toast.error("Please select your bank");
      setLoading(false);
      return;
    }

    if (!formData.accountHolder) {
      toast.error("Please enter account holder name");
      setLoading(false);
      return;
    }

    if (!formData.accountNumber) {
      toast.error("Please enter account number");
      setLoading(false);
      return;
    }

    if (!formData.ifscCode) {
      toast.error("Please enter IFSC code");
      setLoading(false);
      return;
    }

    if (!formData.agreementAccepted) {
      toast.error("Please accept the agreement");
      setLoading(false);
      return;
    }

    if (formData.step_status === "rejected") {
      const result = checkSimilarity();
      if (result) {
        setLoading(false);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();

      // Handle signature separately
      if (formData.signature) {
        try {
          if (typeof formData.signature === "string") {
            const blob = await fetch(formData.signature).then((res) =>
              res.blob()
            );

            const randomString = Math.random().toString(36).substring(2, 10);
            const fileName = `signature_${randomString}.png`;

            formDataToSend.append("SignatureImageURL", blob, fileName);
          } else if (formData.signature?.file instanceof File) {
            formDataToSend.append("SignatureImageURL", formData.signature.file);
          } else if (typeof formData.signature?.preview === "string") {
            formDataToSend.append(
              "SignatureImageURL",
              formData.signature.preview
            );
          }
        } catch (error) {
          console.error("Error appending signature to FormData:", error);
        }
      }

      // Handle other document files
      const documentFields = {
        AadharFrontURL: formData.aadharFront,
        AadharBackURL: formData.aadharBack,
        PanFrontURL: formData.panFront,
        PanBackURL: formData.panBack,
      };

      for (const [field, data] of Object.entries(documentFields)) {
        if (data?.file) {
          formDataToSend.append(field, data.file);
        } else if (
          data?.preview &&
          typeof data.preview === "string" &&
          data.preview.startsWith("http")
        ) {
          const response = await fetch(data.preview);
          const blob = await response.blob();
          formDataToSend.append(field, blob, `${field}.png`);
        }
      }

      // Validate bank name
      if (!formData.bankName) {
        toast.error("Please select a bank");
        return;
      }

      // Append bank details
      formDataToSend.append("OPH_ID", ophid);
      formDataToSend.append("BankName", formData.bankName);
      formDataToSend.append("AccountHolderName", formData.accountHolder);
      formDataToSend.append("AccountNumber", formData.accountNumber);
      formDataToSend.append("IFSCCode", formData.ifscCode);
      formDataToSend.append("AgreementAccepted", formData.agreementAccepted);
      formDataToSend.append("step", "/auth/membership-form");

      const formDataObj = {};
      formDataToSend.forEach((value, key) => {
        formDataObj[key] = value;
      });

      const response = await updateDocumentationDetails(
        formDataToSend,
        headers
      );
      const res = await axiosApi.post(`/increment-count/${ophid}`);

      if (response.success) {
        toast.success("Documentation details updated successfully");
        navigate("/auth/membership-form");
        // setShowMembershipForm(true); // Show MembershipForm
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update documentation details"
      );
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains the same, but add ProfileFormHeader:
  return (
    <div className="relative bg-cover bg-center">
      {loading && <Loading />}

      <img
        src={MusicBg}
        className="absolute top-[50%] -z-10 inset-0 md:top-[20%]"
        alt=""
        srcSet=""
      />
      <img
        src={Elipse}
        className="absolute top-[50%] -z-10 inset-0 w-[30%] md:top-[20%]"
        alt=""
        srcSet=""
      />
      <div className="min-h-screen z-10  bg-opacity-70 text-white p-6">
        <ProfileFormHeader title="DOCUMENTATION DETAILS" />
        <div className="min-h-[calc(100vh-70px)] mt-20  text-white p-6 flex flex-col items-center mx-auto">
          {/* <div className="relative flex justify-center">
            {video && (
              <video
                ref={videoRef}
                src={video.value}
                onPlay={handlePlay}
                onPause={handlePause}
                onClick={togglePlayPause}
                className="w-[800px] h-[50vh]  object-cover "
                controls={false} // Disable default controls
              />
            )}
            {!isPlaying && (
              <button
                onClick={togglePlayPause}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-transparent focus:outline-none"
              >
                <img src={PlayBtn} alt="Play" className="w-32 h-32" />
              </button>
            )}
          </div> */}

          <h2 className="text-cyan-400 uppercase text-2xl mt-4 font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)] text-center">
            Documentation Details
          </h2>
          {rejectReason && (
            <div className="text-red-500">
              <strong>Reject Reason:</strong> {rejectReason}
            </div>
          )}

          {/* Aadhar Card Upload */}
          <div className="flex flex-col lg:px-[300px] md:px-[300px] sm:px-[50px] xl:px-[300px]">
            <div className="space-y-4  mb-4">
              <p className="text-sm text-white">
                Upload Aadhar Card <span className="text-red-500">*</span>
              </p>

              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileUpload("aadharFront", e.target.files[0])
                    }
                    className="hidden"
                    id="aadhar-front"
                    accept="image/*"
                  />
                  <label
                    htmlFor="aadhar-front"
                    className="w-full h-24 border-2 border-dashed border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-cyan-400"
                  >
                    {formData.aadharFront?.preview ? (
                      <img
                        src={formData.aadharFront.preview}
                        alt="Aadhar Front"
                        className="h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">Front View</span>
                    )}
                  </label>
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileUpload("aadharBack", e.target.files[0])
                    }
                    className="hidden"
                    id="aadhar-back"
                    accept="image/*"
                  />
                  <label
                    htmlFor="aadhar-back"
                    className="w-full h-24 border-2 border-dashed border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-cyan-400"
                  >
                    {formData.aadharBack?.preview ? (
                      <img
                        src={formData.aadharBack.preview}
                        alt="Aadhar Back"
                        className="h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">Back View</span>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* PAN Card Upload */}
            <div className="space-y-4  mb-4">
              <p className="text-sm text-white">Upload PAN Card</p>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileUpload("panFront", e.target.files[0])
                    }
                    className="hidden"
                    id="pan-front"
                    accept="image/*"
                  />
                  <label
                    htmlFor="pan-front"
                    className="w-full h-24 border-2 border-dashed border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-cyan-400"
                  >
                    {formData.panFront?.preview ? (
                      <img
                        src={formData.panFront.preview}
                        alt="PAN Front"
                        className="h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">Front View</span>
                    )}
                  </label>
                </div>
                {/* <div className="flex-1">
              <input
                type="file"
                onChange={(e) => handleFileUpload("panBack", e.target.files[0])}
                className="hidden"
                id="pan-back"
                accept="image/*"
              />
              <label
                htmlFor="pan-back"
                className="w-full h-24 border-2 border-dashed border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-cyan-400"
              >
                {formData.panBack?.preview ? (
                  <img
                    src={formData.panBack.preview}
                    alt="PAN Back"
                    className="h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">Back View</span>
                )}
              </label>
            </div> */}
              </div>
            </div>

            {/* Signature Pad */}
            <div className="space-y-4  mb-4">
              <p className="text-sm text-gray-400">
                Your Signature <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-4">
                {/* Show previous signature if it exists */}
                {formData.signature?.preview && (
                  <div className="relative">
                    <img
                      src={
                        typeof formData.signature.preview === "string"
                          ? formData.signature.preview
                          : URL.createObjectURL(formData.signature.preview)
                      }
                      alt="Previous Signature"
                      className="w-full h-32 border border-gray-600 rounded bg-white"
                    />
                    <button
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, signature: null }))
                      }
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Signature Canvas */}
                {!formData.signature?.preview && (
                  <div className="relative flex-1">
                    <SignatureCanvas
                      ref={signatureCanvasRef}
                      canvasProps={{
                        height: 150,
                        className:
                          "block w-full bg-white rounded border border-gray-600",
                      }}
                      onEnd={stopDrawing}
                    />
                    <button
                      onClick={clearSignature}
                      className="absolute top-2 right-2 text-sm text-gray-600 hover:text-cyan-400"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4  mb-4">
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="w-full bg-gray-800 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                required
              >
                <option value="">Select Bank</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.name}>
                    {bank.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="accountHolder"
                placeholder="Account Holder Name *"
                value={formData.accountHolder}
                onChange={handleInputChange}
                className="w-full bg-gray-800 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                required
              />
              <input
                type="text"
                name="accountNumber"
                placeholder="Account Number *"
                value={formData.accountNumber}
                onChange={handleInputChange}
                className="w-full bg-gray-800 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                required
              />
              <input
                type="text"
                name="ifscCode"
                placeholder="IFSC Code *"
                value={formData.ifscCode}
                onChange={handleInputChange}
                className="w-full bg-gray-800 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                required
              />
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="agreement"
                name="agreementAccepted"
                checked={
                  formData.agreementAccepted
                    ? parseString(formData.agreementAccepted)
                    : false
                }
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-gray-600 text-cyan-400 focus:ring-cyan-400"
                required
              />
              <label htmlFor="agreement" className="ml-2 text-sm text-gray-400">
                I agree to all the Terms & Conditions{" "}
                <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              type="submit"
              className="w-full  my-4 bg-cyan-400 text-black rounded py-3 font-medium hover:bg-cyan-300 transition-colors duration-200"
            >
              Submit
            </button>
            {/* {showMembershipForm && (
              <>
                <MembershipForm />
                <button
                  onClick={() => {
                    toast.success("Documentation details updated successfully");
                    navigate(`/auth/profile-status?ophid=${ophid}`);
                  }}
                  className="w-full my-4 bg-cyan-400 text-black rounded py-3 font-medium hover:bg-cyan-300 transition-colors duration-200"
                >
                  Submit
                </button>
              </>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationDetailsForm;
