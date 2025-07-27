import React, { useState } from "react";
import axiosApi from "../../../../../../frontend/src/conf/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import WebsiteConfig from "../../../../components/WebConfigSidebar";

const EventAdminForm = () => {
  const [formData, setFormData] = useState({
    EventName: "",
    dateTime: null,
    location: "",
    description: "",
    hashtags: "",
    registrationFee_normal: "",
    registrationStart: null,
    registrationEnd: null,
    winnerReward: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    for (let key in formData) {
      const value = formData[key];
      form.append(key, value instanceof Date ? value.toISOString() : value);
    }

    try {
      const res = await axiosApi.post("/post-events", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Upload Success:", res.data);
    } catch (err) {
      console.error("Upload Error:", err);
    }
  };

  const CustomDateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <button
      onClick={onClick}
      ref={ref}
      className="w-full text-left px-4 py-2 border rounded-xl bg-white text-[#0d3c44] pr-10"
    >
      {value || placeholder}
    </button>
  ));

  return (
    <div className="min-h-screen flex bg-gray-100">
      
      
        <WebsiteConfig />


      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-4xl mx-auto space-y-6 border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-[#0d3c44]">Create New Event</h2>

          <input
            name="EventName"
            type="text"
            placeholder="Event Name"
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
            required
          />

          <div className="w-full">
            <label className="block text-[#0d3c44] font-medium mb-1">Event Date & Time</label>
            <DatePicker
              selected={formData.dateTime}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, dateTime: date }))
              }
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy h:mm aa"
              placeholderText="Select Date & Time"
              todayButton="Today"
              isClearable
              customInput={<CustomDateInput placeholder="Select Date & Time" />}
              calendarClassName="!bg-white text-[#0d3c44] p-4 rounded-xl shadow-xl flex flex-col gap-3"
              popperClassName="!z-50"
            />
          </div>

          <input
            name="location"
            type="text"
            placeholder="Location"
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
          />

          <textarea
            name="description"
            placeholder="Event Description"
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
            rows={3}
          />

          <input
            name="hashtags"
            type="text"
            placeholder='Hashtags (e.g. ["#Music", "#Competition"])'
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
          />

          <input
            name="registrationFee_normal"
            type="number"
            placeholder="Fee"
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
          />

          <DatePicker
            selected={formData.registrationStart}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, registrationStart: date }))
            }
            dateFormat="dd/MM/yyyy"
            placeholderText="Registration Start"
            customInput={<CustomDateInput placeholder="Registration Start" />}
            todayButton="Today"
            isClearable
          />
          <br />
          <DatePicker
            selected={formData.registrationEnd}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, registrationEnd: date }))
            }
            dateFormat="dd/MM/yyyy"
            placeholderText="Registration Ends"
            customInput={<CustomDateInput placeholder="Registration End" />}
            todayButton="Today"
            isClearable
          />

          <input
            name="winnerReward"
            type="text"
            placeholder="Winner Reward"
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
          />

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <label className="relative w-full h-64 mt-1 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer block">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                    Click to replace
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  Click to upload image
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0d3c44] text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-[#0b3239] transition-all duration-150"
          >
            Submit Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventAdminForm;
