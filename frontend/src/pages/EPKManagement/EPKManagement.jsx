import React, { useEffect, useState } from "react";

import {useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosApi from "../../conf/axios";
import { useArtist } from "../auth/API/ArtistContext";
const EPKManagement = () => {
  const navigate = useNavigate();
  const { ophid, headers } = useArtist();
  const [status, setStatus] = useState([]);
  const [formData, setFormData] = useState({
    bio: "",
    bioVideo: null,
    artistStory: "",
    artistStoryVideo: null,
    artistPhoto: null,
    updateImages: null,
    terms: false,
  });

  const location = useLocation()

  const handleUploads = (e, field) => {
    const file = e.target.files[0];

    if (file) {
      setFormData((prev) => ({
        ...prev,
        [field]: file,
      }));
    }
  };

  const getStatus = async () => {
    if (!headers || !headers.Authorization) {
      console.warn("Headers are not ready yet");
      return;
    }

    try {
      const response = await axiosApi.get("/get-special-artist-status", {
        headers: headers,
        params: { ophid },
      });

      if (response.data.success) {
        setStatus(response.data.data);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getStatus();
  }, [ophid, headers]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.terms) {
      toast.error("Please accept terms and conditions");
      return;
    }

    if (
      formData.bio !== "" ||
      formData.bioVideo !== null ||
      formData.artistStory !== null ||
      formData.artistStoryVideo !== null ||
      formData.artistPhoto !== null ||
      formData.updateImages !== null
    ) {
      const sendFormData = new FormData();
      sendFormData.append("ophid", ophid);
      if (formData.bio !== "") {
        sendFormData.append("bio", formData.bio);
      }
      if (formData.bioVideo !== null) {
        sendFormData.append("bioVideo", formData.bioVideo);
      }
      if (formData.artistStory !== "") {
        sendFormData.append("artistStory", formData.artistStory);
      }
      if (formData.artistStoryVideo !== null) {
        sendFormData.append("artistStoryVideo", formData.artistStoryVideo);
      }
      if (formData.artistPhoto !== null) {
        sendFormData.append("artistPhoto", formData.artistPhoto);
      }
      if (formData.updateImages !== null) {
        sendFormData.append("updateImages", formData.updateImages);
      }

      const response = await axiosApi.post(
        "/edit-special-artist-details",
        sendFormData,
        {
          headers: {
            ...headers,
          },
        }
      );
    } else {
      toast.error("Please edit atleast one field");
    }
  };

  return (
    <div className="ml-[63px] mr-[63px]">
      <h1 className="mt-[55px] font-extrabold text-[55px]">EPK Management</h1>

      <form className="flex flex-col gap-[42px]" onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-2 mt-[35px] gap-[54px]">
          <div className="flex flex-col">
            <div className="flex flex-col gap-[12px]">
              <p className="text-[17px] font-semibold text-white">Bio</p>

              <textarea
                className="w-full h-[150px]  w-full bg-gray-800/50 border rounded-lg border-gray-700 p-3 focus:outline-none focus:border-cyan-400"
                placeholder="Type your name  here"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bio: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-[12px] mt-[36px]">
              <p className="text-[17px] font-semibold text-white">
                Bio video :
              </p>

              <div
                className="
                w-[100%]
                w-[100%] min-h-[290px] 
               p-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors
                flex items-center justify-center 
                "
                onClick={() => document.getElementById("bioVideo").click()}
              >
                <input
                  type="file"
                  accept="video/*"
                  id="bioVideo"
                  onChange={(e) => handleUploads(e, "bioVideo")}
                  className="hidden"
                />
                {formData.bioVideo === null ? (
                  <div className="flex items-center flex-col gap-3">
                    <Plus className="w-8 h-8 text-gray-500" />
                    <p className="font-medium text-[#666B76] text-[21px]">
                      Upload Video File
                    </p>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center gap-3"
                    onClick={() => document.getElementById("bioVideo").click()}
                  >
                    <p className="font-medium text-white text-[21px]">
                      {formData.bioVideo.name}
                    </p>
                    <X className="w-4 h-4 hover:text-red-500" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-[17px] font-semibold text-white mt-[32px] mb-[12px]">
                Change Artist Story :
              </p>
              <input
                type="text"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
                placeholder="Type ypour story here"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    artistStory: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-[12px] mt-[36px]">
              <p className="text-[17px] font-semibold text-white">
                Artist Story video :
              </p>

              <div
                className="
      w-[100%] min-h-[290px] 
      p-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors
      flex items-center justify-center
    "
                onClick={() =>
                  document.getElementById("artistStoryVideo").click()
                } // trigger hidden input
              >
                <input
                  id="artistStoryVideo"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleUploads(e, "artistStoryVideo")}
                  className="hidden"
                />
                {formData.artistStoryVideo === null ? (
                  <div className="flex items-center flex-col gap-3">
                    <Plus className="w-8 h-8 text-gray-500" />
                    <p className="font-medium text-[#666B76] text-[21px]">
                      Upload Video File
                    </p>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center gap-3"
                    onClick={() =>
                      document.getElementById("artistStoryVideo").click()
                    }
                  >
                    <p className="font-medium text-white text-[21px]">
                      {formData.artistStoryVideo.name}
                    </p>
                    <X className="w-4 h-4 hover:text-red-500" />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-[50px] flex items-center">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                className="w-[20px] h-[20px]"
                checked={formData.terms}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    terms: !prev.terms,
                  }))
                }
              />
              <label
                className="ml-[33px] text-[20px] font-semibold text-white"
                for="terms"
              >
                Agree to terms and conditions{" "}
              </label>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-[43px]">
              <img
                src={location.state.photo}
                className="w-32 h-32 rounded-full border-4 border-[#5DC9DE] object-cover"
              />

              <div className="flex flex-col gap-[17px]">
                <p className="text-white font-medium text-[35px]">
                  Your Profile Photo
                </p>
                <p className="text-white font-medium text-[20px]">
                  This image wil appear on your profile Upload a high qualty
                  image{" "}
                </p>
              </div>
            </div>

            <div
              className="
                w-[100%]
                w-[100%] min-h-[130px] 
                opacity-100
                p-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors
                flex items-center justify-center 
                
                mt-[60px]
                "
              onClick={() => document.getElementById("artistPhoto").click()}
            >
              <input
                id="artistPhoto"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUploads(e, "artistPhoto")}
              />
              {formData.artistPhoto === null ? (
                <div className="flex items-center flex-col gap-3">
                  <Plus className="w-8 h-8 text-gray-500" />
                  <p className="font-medium text-[#666B76] text-[15px]">
                    Upload Your File
                  </p>
                </div>
              ) : (
                <div
                  className="flex items-center justify-center gap-3"
                  onClick={() => document.getElementById("artistPhoto").click()}
                >
                  <p className="font-medium text-white text-[21px]">
                    {formData.artistPhoto.name}
                  </p>
                  <X className="w-4 h-4 hover:text-red-500" />
                </div>
              )}
            </div>
            <p className="text-white font-medium text-[40px] mt-[35px] mb-[25px]">
              Your Profile feed
            </p>

            <div className="flex flex-col gap-[12px]">
              <p className="text-[17px] font-semibold text-white">
                Change Your Images:
              </p>

              <div
                className="
                w-[100%]
                w-[100%] min-h-[290px] 
               p-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors
                flex items-center justify-center 
                "
                onClick={() => document.getElementById("updateImages").click()}
              >
                <input
                  id="updateImages"
                  accept="images/*"
                  type="file"
                  className="hidden"
                  onChange={(e) => handleUploads(e, "updateImages")}
                />
                {formData.updateImages === null ? (
                  <div className="flex items-center flex-col gap-3">
                    <Plus className="w-8 h-8 text-gray-500" />
                    <p className="font-medium text-[#666B76] text-[21px]">
                      Upload Your File
                    </p>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center gap-3"
                    onClick={() =>
                      document.getElementById("updateImages").click()
                    }
                  >
                    <p className="font-medium text-white text-[21px]">
                      {formData.updateImages.name}
                    </p>
                    <X className="w-4 h-4 hover:text-red-500" />
                  </div>
                )}
              </div>
            </div>

            <p className="text-white font-medium text-[35px] mt-[35px]">
              Add New Song
            </p>
            <Link
              to="/dashboard/add-new-song"
              className="bg-[#6F4FA0] text-white text-center px-[36px] py-[17px] rounded-[42px] mt-[30px] max-w-[300px] 
hover:bg-[#5A3F85] "
            >
              Add Your Song
            </Link>
          </div>
        </div>
        <button className="w-[374px] mx-auto bg-cyan-400 text-gray-900 rounded-full py-3 font-semibold hover:bg-cyan-300 transition-colors mb-[20px]">
          SUBMIT
        </button>
      </form>

      {status.length > 0 &&
        (<section className="mb-[20px]">
          <h1 className="font-extrabold text-[55px] mt-[55px]">Status</h1>

          <table className="w-full border-collapse mt-[41px]">
            <thead>
              <tr className="border-b border-b-[#FFFFFF33] text-left">
                <th className="pb-[14px] text-[15px] font-semibold">DATE</th>
                <th className="pb-[14px] text-[15px] font-semibold">REQUEST</th>
                <th className="pb-[14px] text-[15px] font-semibold">STATUS</th>
                <th className="pb-[14px] text-[15px] font-semibold">REASON</th>
              </tr>
            </thead>
            <tbody>
              {
                status.map((stat, index) => (
                  <tr key={index}>
                    <td className="py-[12px] font-bold text-[16px]">
                      {new Date(stat.date).toLocaleDateString()}
                    </td>
                    <td className="py-[12px] font-bold text-[16px]">
                      {stat.field} update
                    </td>
                    <td className="py-[12px] font-bold text-[16px]">
                      {stat.status}
                    </td>
                    <td className="py-[12px] font-bold text-[16px]">
                      {stat.reason || "-"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>)
      }
    </div>
  );
};

export default EPKManagement;
