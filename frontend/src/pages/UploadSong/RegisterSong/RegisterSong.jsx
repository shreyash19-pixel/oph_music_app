import { ChevronDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axiosApi from "../../../conf/axios";
import getToken from "../../../utils/getToken";
import { useArtist } from "../../auth/API/ArtistContext";
import React, { useEffect, useState } from "react";
import { Bounce, ToastContainer } from "react-toastify";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const REGISTER_SONG_STATE_KEY = "registerSongState";
const SONG_DATA_KEY = "songData"; // New key for storing song data in sessionStorage

export default function RegisterSongForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [blockedDates, setBlockedDates] = useState([]); // Add state for blocked dates
  const [artistBlockedDates, setArtistBlockedDates] = useState([]); // Add state for blocked dates
  const [songReg, setSongReg] = useState(true);
  const [lyricalVid, setLyricalVid] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [payableAmount, setPayableAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { headers, artist, user, ophid } = useArtist();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Add state for success message
  const [agreement, setAgreement] = useState(false);
  const artistName = user?.userData.artist.name;
  const stageName = user?.userData.artist.stage_name;

  const projectType = localStorage.getItem("projectType");
  localStorage.setItem("projectType", projectType);
  const [formData, setFormData] = useState({
    oph_id: ophid,
    name: "",
    release_date: "",
    p_line: "",
    cp_line: "",
    song_reg: songReg,
    lyricalVid: lyricalVid,
    // agreement: false,
    available_on_music_platforms: false, // Add new field for toggle button
    project_type: projectType,
  });

  useEffect(() => {
    if (ophid) {
      setFormData(prev => ({
        ...prev,
        oph_id: ophid
      }));
    }
  }, [ophid]);


  const handleTotalPayment = () => {
    if (songReg && lyricalVid) {
      setPayableAmount(799 + 399);
    } else if (songReg && !lyricalVid) {
      setPayableAmount(799);
    } else if (!songReg && lyricalVid) {
      setPayableAmount(399);
    } else {
      setPayableAmount(0);
    }
  };

  useEffect(() => {
    handleTotalPayment();
  }, [songReg, lyricalVid]);

  // Modified useEffect to include blocked dates fetch
  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const response = await axiosApi.get("/bookings", {
          headers: headers,
        });

        if (response.data.success) {
          setIsLoading(false);
          // Extract just the dates from the response
          const dates = response.data.data.map(
            (item) => item.current_booking_date?.split("T")[0]
          );

          setBlockedDates(dates);
        }
      } catch (error) {
        console.error("Error fetching blocked dates:", error);
      }
    };

    fetchBlockedDates();

  }, []);


  useEffect(() => {
    const fetchBlockedDatesByOPHID = async () => {

      try {
        if (!ophid) return

        const response = await axiosApi.get("/bookings-by-id", {
          headers: headers,
          params: { ophid }
        })

        console.log(response.data.data);

        if (response.data.success) {
          setIsLoading(false);
          // Extract just the dates from the response
          const individualDates = response.data.data.map(
            (item) => item.current_booking_date?.split("T")[0]
          );

          setArtistBlockedDates(individualDates);
        }

      }
      catch (error) {
        console.error("Error fetching blocked dates by ophid", error)
      }

    }
    fetchBlockedDatesByOPHID()
  }, [ophid])

  // Modified useEffect to handle initial payment plan selection
  // useEffect(() => {
  //   if (!paymentPlans.length) return;

  //   const updatePaymentState = () => {
  //     if (projectType === "hybrid") {
  //       // For hybrid, select all plans and disable them
  //       const plan2 = paymentPlans.find((plan) => plan.id === 2);

  //       setSelectedPlans([plan2.id]);
  //       const amount = projectType === "advance" ? 0 : plan2.amount;
  //       setPayableAmount(amount);
  //     } else {
  //       // For new and advance, only select plan 2
  //       const plan2 = paymentPlans.find((plan) => plan.id === 2);
  //       if (plan2) {
  //         setSelectedPlans([plan2.id]);
  //         // For advance projects, set payable amount to 0 for plan 2
  //         const amount = projectType === "advance" ? 0 : plan2.amount;
  //         setPayableAmount(amount);
  //       }
  //     }
  //   };

  //   updatePaymentState();
  // }, [projectType, paymentPlans]);

  // const handlePaymentSelection = (plan) => {
  //   if (plan.isRequired || (projectType === "advance" && plan.id === 2)) return;

  //   setSelectedPlans((prev) => {
  //     const newSelection = prev.includes(plan.id)
  //       ? prev.filter((id) => id !== plan.id)
  //       : [...prev, plan.id];

  //     const newAmount = paymentPlans
  //       .filter((p) => {
  //         if (projectType === "advance" && p.id === 2) return false; // Waive off plan 2 for advance
  //         return p.isRequired || newSelection.includes(p.id);
  //       })
  //       .reduce((total, p) => total + p.amount, 0);

  //     setPayableAmount(newAmount);
  //     return newSelection;
  //   });
  // };
  const agreementHandler = () => {
    setAgreement(!agreement);
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };
    setFormData(newFormData);
  };

  const isBlockedDate = (date) => {
    if (!date && blockedDates.length === 0) return false;

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return false;

    const formattedDate = parsedDate.toISOString().split("T")[0];
    console.log(formattedDate);
    // return
    return blockedDates.some(
      (blockedDate) =>
        blockedDate === formattedDate && formattedDate !== formData.oldDate
    );
  };

  const newProject = async (updatedFormData) => {

    try {
      const response = await axiosApi.post("/register-new-song",
        { oph_id: ophid, project_type: projectType, name: updatedFormData.name, release_date: updatedFormData.release_date, lyricalVid: updatedFormData.lyricalVid, next_step : updatedFormData.next_step},
        { headers: headers })
      console.log(response);
      if (response.data.success) {
        navigate(`/dashboard/upload-song/audio-metadata/${response.data.contentID}`, {
          state: {
            songName : updatedFormData.name,
          }
        });
      }
    }
    catch (error) {
      console.error("Error booking date", error)
    }

  }

  const hybridProject = async (updatedFormData) => {

    try {
      const response = await axiosApi.post("/register-hybrid-song",
        { oph_id: ophid, project_type: projectType, name: updatedFormData.name, release_date: updatedFormData.release_date, lyricalVid: updatedFormData.lyricalVid, available_on_music_platforms: updatedFormData.available_on_music_platforms, next_step : updatedFormData.next_step },
        { headers: headers })
      if (response.data.success) {
        navigate(`/dashboard/upload-song/audio-metadata/${response.data.contentID}`, {
          state: {
            songName : updatedFormData.name,
          }
        });
      }
    }
    catch (error) {
      console.error("Error booking date", error)
    }

  }

  const paidInAdvance = async (updatedFormData) => {

    try {
      const response = await axiosApi.post("/register-hybrid-song",
        { oph_id: ophid, project_type: projectType, name: updatedFormData.name, release_date: updatedFormData.release_date, lyricalVid: updatedFormData.lyricalVid, available_on_music_platforms: updatedFormData.available_on_music_platforms, next_step : updatedFormData.next_step },
        { headers: headers })
      console.log(response);
      if (response.data.success) {
        navigate(`/dashboard/upload-song/audio-metadata/${response.data.contentID}`, {
          state: {
            songName : updatedFormData.name,
          }
        });
      }
    }
    catch (error) {
      console.error("Error booking date", error)
    }

  }


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreement) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    // Correctly transform formData
    const updatedFormData = {
      ...formData,
      song_reg: songReg,
      lyricalVid: lyricalVid,
      cp_line: `${artistName} - ${stageName}`,
      p_line: `${artistName} - ${stageName}`,
      available_on_music_platforms:
        formData.available_on_music_platforms || false, // This line adds it
      next_step: '/dashboard/upload-song/audio-metadata/'
    };
    // console.log(updatedFormData, "updatedFormData");

    // Remove `c_line` and `isAvailableOnMusicPlatform`
    // const { c_line, ...payload } = updatedFormData;
    // delete updatedFormData.isAvailableOnMusicPlatform;    



    if (projectType === "paid in advance") {
      paidInAdvance(updatedFormData)
    }
    else if(projectType === "new project")
    {
      newProject(updatedFormData)
    }
    else if(projectType === "hyrbid project")
    {
      hybridProject(updatedFormData)
    }
    // if (updatedFormData.available_on_music_platforms) {
    //   toast.success("Song Registered Successfully !!!!");
    //   navigate(`/dashboard/upload-song/video-metadata/${response.data.data.id}`);
    //   return;
    // }

    // const plansNeedingPayment = selectedPlans;

    // if (payableAmount > 0 && plansNeedingPayment.length > 0) {
    //   const stateToSave = {
    //     formData: updatedFormData,
    //     selectedPlans,
    //     payableAmount,
    //   };
    //   sessionStorage.setItem(
    //     REGISTER_SONG_STATE_KEY,
    //     JSON.stringify(stateToSave)
    //   );

    //   await navigate("/dashboard/payment", {
    //     state: {
    //       artist_id: artist.id,
    //       amount: payableAmount,
    //       planIds: plansNeedingPayment,
    //       returnPath: "/dashboard/upload-song/register-song",
    //       heading: "Complete Payment",
    //     },
    //   });
    // } else {
    //   try {
    //     const response = await axiosApi.post("/content/initial", payload, {
    //       headers: headers,
    //     });
    //     if (response.data.success) {
    //       navigate(
    //         `/dashboard/upload-song/audio-metadata/${response.data.data.id}`,
    //         {
    //           state: { projectType },
    //         }
    //       );
    //       return;
    //     }
    //   } catch (error) {
    //     console.error("Error registering song:", error);
    //     toast.error("Failed to register song. Please try again.");
    //   }
    // }
  };

  // const handleContentCreation = async (paymentData) => {
  //   // Add a flag in sessionStorage to prevent double submission
  //   const isSubmitting = sessionStorage.getItem("isSubmitting");
  //   if (isSubmitting) return;

  //   try {
  //     sessionStorage.setItem("isSubmitting", "true");
  //     const token = getToken();

  //     // Get form data either from saved state or current state
  //     let contentFormData = formData;

  //     // If we're coming back from the payment screen, use saved state
  //     if (paymentData.newPaymentIds?.length > 0) {
  //       const savedState = sessionStorage.getItem(REGISTER_SONG_STATE_KEY);
  //       if (savedState) {
  //         const parsedState = JSON.parse(savedState);
  //         contentFormData = parsedState.formData;
  //       }
  //     }

  //     // Remove agreement from form data
  //     const { agreement, ...contentDataWithoutAgreement } = contentFormData;

  //     // Set payment_ids based on project type
  //     const paymentIds =
  //       projectType === "paid in advance"
  //         ? ["0"] // For "Paid in Advance", include null as a placeholder
  //         : [...(paymentData.newPaymentIds || [])];

  //     const contentData = {
  //       ...contentDataWithoutAgreement,
  //       payment_ids: paymentIds,
  //       project_type: projectType,
  //     };

  //     console.log("Submitting content data:", contentData);

  //     const response = await axiosApi.post("/content/initial", contentData, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.data.success) {
  //       // Store song data in sessionStorage instead of Redux
  //       const songData = {
  //         contentID: response.data.data.id,
  //         name: response.data.data.name,
  //       };
  //       sessionStorage.setItem(SONG_DATA_KEY, JSON.stringify(songData));

  //       // Clean up register song state
  //       sessionStorage.removeItem(REGISTER_SONG_STATE_KEY);
  //       sessionStorage.removeItem("isSubmitting");
  //       console.log(
  //         response.data.data.available_on_music_platforms,
  //         "response.data"
  //       );
  //       if (response.data.data.available_on_music_platforms) {
  //         navigate(
  //           `/dashboard/upload-song/video-metadata/${response.data.data.id}`,
  //           { state: { projectType } }
  //         );
  //       } else {
  //         navigate(
  //           `/dashboard/upload-song/audio-metadata/${response.data.data.id}`,
  //           { state: { projectType } }
  //         );
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error creating content:", error);
  //     alert("Failed to create content. Please try again.");
  //   } finally {
  //     // Clean up the submission flag in case of error
  //     sessionStorage.removeItem("isSubmitting");
  //   }
  // };

  // Modify the release date input field based on project type
  const renderReleaseDateField = () => {
    if (projectType === "paid in advance") {
      return (
        <div className="space-y-2">
          <label className="block">
            Release Date <span className="text-red-500">*</span>
          </label>
          <select
            name="release_date"
            value={formData.release_date}
            onChange={handleChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
            required
          >
            <option value="">Select a blocked date</option>
            {artistBlockedDates.map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (

      <div className="space-y-2">
        <label className="block">
          Release Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="release_date"
          value={formData.release_date}
          onChange={handleChange}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
          required
          min={new Date().toISOString().split("T")[0]}
          onKeyDown={(e) => e.preventDefault()}
          style={{
            backgroundColor: isBlockedDate(formData.release_date)
              ? "rgba(255,0,0,0.1)"
              : "transparent",
            colorScheme: "dark",
          }}
        />
        {isBlockedDate(formData.release_date) && (
          <span className="text-red-500 text-sm">
            Selected date is blocked. Please choose another date.
            <Link to={"/dashboard/time-calendar"}>
              <span className="underline ms-2">
                Click to See Available Dates
              </span>
            </Link>
          </span>
        )}
      </div>
    );
  };

  // Add loading screen
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-70px)] text-gray-100 px-8 p-6">
      {showSuccessMessage ? (
        <div className="min-h-[calc(100vh-70px)] bg-opacity-70 z-10 text-white flex flex-col items-center justify-center p-6">
          <div className="text-center flex justify-center items-center flex-col space-y-6">
            {/* Icon with animation */}
            <img src={Review} className="w-[100px]" alt="Review" />

            {/* Title */}
            <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)] tracking-wider">
              YOUR SONG HAS BEEN REGISTERED SUCCESSFULLY
            </h1>

            {/* Back to Home Button */}
            <button
              onClick={() => navigate("/dashboard/upload-song")}
              className="mt-8 z-[1000] px-16 py-3 bg-[#5DC9DE] hover:font-bold hover:cursor-pointer text-black rounded-full font-medium transition-colors duration-200"
            >
              Go to Song Registration Page
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-xl">
          <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
            REGISTER YOUR SONG
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Song Name */}
            <div className="space-y-2">
              <label className="block">
                Song Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="We Are The Best"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            {/* Toggle Button for Hybrid Projects */}
            {projectType !== "new project" && (
              <div className="space-y-2">
                <span className="text-gray-400">
                  *This song is Available on Music platform or the song is free
                  for profit beats{" "}
                </span>
                <label className="block">
                  This song is available on music platform:
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="available_on_music_platforms"
                      value="yes"
                      checked={formData.available_on_music_platforms === true}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          available_on_music_platforms: true,
                        })
                      }
                      className="text-cyan-400 bg-gray-800 border-gray-700 focus:ring-cyan-400"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="available_on_music_platforms"
                      value="no"
                      checked={formData.available_on_music_platforms === false}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          available_on_music_platforms: false,
                        })
                      }
                      className="text-cyan-400 bg-gray-800 border-gray-700 focus:ring-cyan-400"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            )}

            <>
              {/* Release Date */}
              {renderReleaseDateField()}

              {/* C-Line */}
              <div className="space-y-2">
                <label className="block">
                  CP-Line <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="cp_line"
                    placeholder="We Are The Best"
                    value={`${artistName} - ${stageName}`}
                    onChange={handleChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              {/* P-line */}
              <div className="space-y-2">
                <label className="block">
                  P-line <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="p_line"
                    placeholder="We Are The Best"
                    value={`${artistName} - ${stageName}`}
                    onChange={handleChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              {/* Payment Plans */}
              {/* <div className="space-y-2">
                <label className="block">Payment Plans:</label>
                {paymentPlans.map((plan) => {
                  const isAdvance = projectType === "advance";
                  const isPlan2 = plan.id === 2;
                  const isPaidInAdvance = isAdvance && isPlan2;

                  return (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                    >
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedPlans.includes(plan.id)}
                          onChange={() => handlePaymentSelection(plan)}
                          disabled={plan.isRequired}
                          className="text-cyan-400 bg-gray-800 border-gray-700 focus:ring-cyan-400"
                        />
                        <span>{plan.name}</span>
                        {isPaidInAdvance ? (
                          <span className="text-xs text-cyan-400">
                            (Paid in Advance)
                          </span>
                        ) : (
                          plan.isRequired && (
                            <span className="text-xs text-cyan-400">
                              (Required)
                            </span>
                          )
                        )}
                      </label>
                      <span
                        className={
                          isPaidInAdvance ? "line-through text-gray-500" : ""
                        }
                      >
                        ₹{isPaidInAdvance ? 0 : plan.amount}
                      </span>
                    </div>
                  );
                })}
              </div> */}

              <div className="space-y-2">
                <label className="block">Payment Plans:</label>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={songReg}
                      onChange={() => setSongReg(!songReg)}
                      className="text-cyan-400 bg-gray-800 border-gray-700 focus:ring-cyan-400"
                      disabled={songReg}
                    />
                    <span>799 - Song Registration fees </span>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={lyricalVid}
                      onChange={() => setLyricalVid(!lyricalVid)}
                      className="text-cyan-400 bg-gray-800 border-gray-700 focus:ring-cyan-400"
                    />
                    <span>399 - Lyrical Video </span>
                  </label>
                </div>
              </div>
            </>

            {/* Agreement */}
            <div className="space-y-2">
              <label className="block">Agreement:</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="agreement"
                  checked={formData.agreement}
                  onChange={agreementHandler}
                  className="text-cyan-400 bg-gray-800 border-gray-700 focus:ring-cyan-400 rounded"
                />
                <span>Agree with terms and conditions</span>
              </label>
            </div>

            {/* Payable Amount */}
            <div className="flex justify-between items-center pt-4">
              <span>Payable Amount</span>
              <span className="text-cyan-400 text-xl font-bold">
                ₹{payableAmount}/-
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-cyan-400 text-gray-900 rounded-full py-3 font-semibold hover:bg-cyan-300 transition-colors"
            >
              Pay & Continue
            </button>
          </form>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
