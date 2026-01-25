import React, { useState } from "react";
import axiosApi from "../../../../conf/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import WebsiteConfig from "../../../../components/WebConfigSidebar";
import toast from "react-hot-toast";

const EventAdminForm = () => {
  const [formData, setFormData] = useState({
    EventName: "",
    dateTime: null,
    location: "",
    description: "",
    long_desc: "",
    hashtags: "",
    registrationFee_normal: "",
    registrationStart: null,
    registrationEnd: null,
    winnerReward: "",
    image: null,
    payment_qr: null,
    payment_qr_discount: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const form = new FormData();
    for (let key in formData) {
      const value = formData[key];
      // Only append non-null values
      if (value !== null && value !== undefined && value !== "") {
        form.append(key, value instanceof Date ? value.toISOString() : value);
      }
    }

    try {
      const res = await axiosApi.post("/post-events", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Show success toast
      toast.success("Event created successfully!", {
        position: "top-center",
        duration: 4000,
      });
      
      console.log("Upload Success:", res.data);
      
      // Reset form after successful creation
      setFormData({
        EventName: "",
        dateTime: null,
        location: "",
        description: "",
        long_desc: "",
        hashtags: "",
        registrationFee_normal: "",
        registrationStart: null,
        registrationEnd: null,
        winnerReward: "",
        image: null,
        payment_qr: null,
        payment_qr_discount: null,
      });
      setImagePreview(null);
      
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        if (input) input.value = "";
      });
    } catch (err) {
      console.error("Upload Error:", err);
      
      // Show error toast
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to create event. Please try again.";
      toast.error(errorMessage, {
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CustomDateInput = React.forwardRef(
    ({ value, onClick, placeholder }, ref) => (
      <button
        type="button"
        onClick={onClick}
        ref={ref}
        className="w-full text-left px-4 py-2 border rounded-xl bg-white text-[#0d3c44] pr-10"
      >
        {value || placeholder}
      </button>
    ),
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      <WebsiteConfig />

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-4xl mx-auto space-y-6 border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-[#0d3c44]">
            Create New Event
          </h2>

          <input
            name="EventName"
            type="text"
            placeholder="Event Name"
            value={formData.EventName}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
            required
            disabled={isSubmitting}
          />

          <div className="w-full">
            <label className="block text-[#0d3c44] font-medium mb-1">
              Event Date & Time
            </label>
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
              disabled={isSubmitting}
              customInput={<CustomDateInput placeholder="Select Date & Time" />}
              calendarClassName="!bg-white text-[#0d3c44] p-4 rounded-xl shadow-xl flex flex-col gap-3"
              popperClassName="!z-50"
            />
          </div>

          <input
            name="location"
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
            disabled={isSubmitting}
          />

          <textarea
            name="description"
            placeholder="Event Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
            rows={2}
            disabled={isSubmitting}
          />

          <textarea
            name="long_desc"
            placeholder="Long Event Description"
            value={formData.long_desc}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
            rows={6}
            disabled={isSubmitting}
          />

          <input
            name="hashtags"
            type="text"
            placeholder='Hashtags (e.g. ["#Music", "#Competition"])'
            value={formData.hashtags}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
            disabled={isSubmitting}
          />

          <input
            name="registrationFee_normal"
            type="number"
            placeholder="Fee"
            value={formData.registrationFee_normal}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />

          <input
            name="winnerReward"
            type="text"
            placeholder="Winner Reward"
            value={formData.winnerReward}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
            disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-6 rounded-xl text-lg font-semibold transition-all duration-150 ${
              isSubmitting
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-[#0d3c44] text-white hover:bg-[#0b3239]"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Event...
              </span>
            ) : (
              "Submit Event"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventAdminForm;
