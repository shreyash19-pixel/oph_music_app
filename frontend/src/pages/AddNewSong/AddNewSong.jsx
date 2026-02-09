import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import axiosApi from "../../conf/axios";
import { useArtist } from "../auth/API/ArtistContext";
import { useNavigate } from "react-router-dom";

const AddNewSong = () => {
  const [formData, setFormData] = useState({
    songName: "",
    views: "",
    credits: "",
    time: "",
    proof: "",
    audioFile: null,
    terms: false,
  });
  const [status, setStatus] = useState([]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { headers, ophid } = useArtist();
  const [loading, setLoading] = useState(false);
  const [songCount, setSongCount] = useState(0);

  // handle input change
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  // validation
  const validate = () => {
    let newErrors = {};

    if (!formData.songName.trim()) newErrors.songName = "Song name is required";
    if (!formData.views || isNaN(formData.views))
      newErrors.views = "Views must be a number";
    if (!formData.credits.trim())
      newErrors.credits = "Credits field is required";

    // simple mm:ss or hh:mm:ss validation for time
    const timeRegex = /^(\d{1,2}:)?[0-5]?\d:[0-5]\d$/;
    if (!formData.time.trim())
      newErrors.time = "Time is required (mm:ss or hh:mm:ss)";
    else if (!timeRegex.test(formData.time))
      newErrors.time = "Invalid time format (use mm:ss or hh:mm:ss)";

    // simple URL validatio
    if (!formData.audioFile) newErrors.audioFile = "Audio file is required";
    if (!formData.terms)
      newErrors.terms = "You must agree to terms and conditions";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const getSongStatus = async () => {
    if (!headers || !headers.Authorization) {
      console.warn("Headers are not ready yet");
      return;
    }

    try {
      const response = await axiosApi.get("/get-special-artist-song-status", {
        headers: headers,
        params: { ophid },
      });

      if (response.data.success) {
        setStatus(response.data.data);

        setSongCount(response.data.songCnt);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getSongStatus();
  }, [ophid, headers]);

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (validate()) {
      const sendFormData = new FormData();
      sendFormData.append("ophid", ophid);
      sendFormData.append("songName", formData.songName);
      sendFormData.append("views", formData.views);
      sendFormData.append("credits", formData.credits);
      sendFormData.append("time", formData.time);
      sendFormData.append("proof", formData.proof);
      sendFormData.append("songCount", songCount);
      sendFormData.append("audioFile", formData.audioFile);

      try {
        const response = await axiosApi.post(
          "/insert-special-artist-song",
          sendFormData,
          {
            headers: {
              ...headers,
            },
          }
        );

        if (response.data.success) {
          console.log(response);
          
          const data = Object.values(response.data.data);
          // console.log(response.data.songCnt);
          console.log(data[0].song_id);
          setLoading(false);

          if (songCount < 2) {
            navigate("/dashboard/pending", {
              state: {
                heading: "Your request is under review",
                btnText: "Back to Home",
                redirectTo: "/dashboard",
              },
            });
          } else {
            navigate("/auth/payment", {
              state: {
                from: "Special artist song registration",
                song_id: data[0].song_id,
              },
            });
          }
        }
      } catch (err) {
        console.error(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
        Loading artist data...
      </div>
    );
  }

  return (
    <div className="ml-[63px] mr-[63px]">
      <h1 className="mt-[55px] font-extrabold text-[55px]">Add New Song </h1>
      <form
        className="mt-[40px] flex items-center justify-center flex-col w-full"
        onSubmit={handleSubmit}
      >
        {/* Song Name */}
        <div className="w-full max-w-[764px]">
          <p className="text-[17px] font-semibold text-white mt-[32px] mb-[12px]">
            Song name :
          </p>
          <input
            type="text"
            name="songName"
            value={formData.songName}
            onChange={handleChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
            placeholder="Type your song name here"
          />
          {errors.songName && (
            <p className="text-red-500 text-sm">{errors.songName}</p>
          )}
        </div>

        {/* Views */}
        <div className="w-full max-w-[764px]">
          <p className="text-[17px] font-semibold text-white mt-[32px] mb-[12px]">
            Views :
          </p>
          <input
            type="text"
            name="views"
            value={formData.views}
            onChange={handleChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
            placeholder="Enter number of views"
          />
          {errors.views && (
            <p className="text-red-500 text-sm">{errors.views}</p>
          )}
        </div>

        {/* Credits */}
        <div className="w-full max-w-[764px]">
          <p className="text-[17px] font-semibold text-white mt-[32px] mb-[12px]">
            Credits :
          </p>
          <input
            type="text"
            name="credits"
            value={formData.credits}
            onChange={handleChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
            placeholder="Type credits here"
          />
          {errors.credits && (
            <p className="text-red-500 text-sm">{errors.credits}</p>
          )}
        </div>

        {/* Time */}
        <div className="w-full max-w-[764px]">
          <p className="text-[17px] font-semibold text-white mt-[32px] mb-[12px]">
            Time :
          </p>
          <input
            type="text"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
            placeholder="mm:ss or hh:mm:ss"
          />
          {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
        </div>

        {/* Proof */}
        <div className="w-full max-w-[764px]">
          <p className="text-[17px] font-semibold text-white mt-[32px] mb-[12px]">
            Proof :
          </p>
          <input
            type="text"
            name="proof"
            value={formData.proof}
            onChange={handleChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
            placeholder="Add your link here"
            required
          />
        </div>

        {/* Audio File */}
        <div className="flex flex-col gap-[12px] mt-[36px] w-full max-w-[764px]">
          <p className="text-[17px] font-semibold text-white">Audio file :</p>
          <input
            type="file"
            accept="audio/*"
            name="audioFile"
            onChange={handleChange}
            className="hidden"
            id="audioUpload"
          />
          <label
            htmlFor="audioUpload"
            className="w-full min-h-[150px] p-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors flex items-center justify-center"
          >
            {formData.audioFile === null ? (
              <div className="flex items-center flex-col gap-3">
                <Plus className="w-8 h-8 text-gray-500" />
                <p className="font-medium text-white text-[21px]">
                  {formData.audioFile
                    ? formData.audioFile.name
                    : "Upload Audio File"}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className="font-medium text-white text-[21px]">
                  {formData.audioFile
                    ? formData.audioFile.name
                    : "Upload Audio File"}
                </p>
                <X className="w-4 h-4 hover:text-red-500" />
              </div>
            )}
          </label>
          {errors.audioFile && (
            <p className="text-red-500 text-sm">{errors.audioFile}</p>
          )}
        </div>

        {/* Terms */}
        <div className="mt-[50px] flex items-center">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
            className="w-[20px] h-[20px]"
          />
          <p className="ml-[33px] text-[20px] font-semibold text-white">
            Agree to terms and conditions
          </p>
        </div>
        {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

        <button
          type="submit"
          className="w-[374px] mx-auto mt-[60px] bg-cyan-400 text-gray-900 rounded-full py-3 font-semibold hover:bg-cyan-300 transition-colors mb-[20px]"
        >
          SUBMIT
        </button>
      </form>

      {status.length > 0 && (
        <section className="mb-[20px]">
          <h1 className="font-extrabold text-[55px] mt-[55px]">Status</h1>

          <table className="w-full border-collapse mt-[41px]">
            <thead>
              <tr className="border-b border-b-[#FFFFFF33] text-left">
                <th className="pb-[14px] text-[15px] font-semibold">DATE</th>
                <th className="pb-[14px] text-[15px] font-semibold">
                  SONG NAME
                </th>
                <th className="pb-[14px] text-[15px] font-semibold">STATUS</th>
                <th className="pb-[14px] text-[15px] font-semibold">REASON</th>
              </tr>
            </thead>
            <tbody>
              {status.map((stat) => (
                <tr>
                  <td className="py-[12px] font-bold text-[16px]">
                    {new Date(stat.created_at).toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" })}
                  </td>
                  <td className="py-[12px] font-bold text-[16px]">
                    {stat.song_name}
                  </td>
                  <td className="py-[12px] font-bold text-[16px]">
                    {stat.status}
                  </td>
                  <td className="py-[12px] font-bold text-[16px]">
                    {stat.reject_reason ? stat.reject_reason : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

export default AddNewSong;
