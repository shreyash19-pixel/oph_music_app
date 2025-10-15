import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import WebsiteConfig from "../../../../components/WebConfigSidebar";
import toast from "react-hot-toast";

const EventManagement = () => {
  const { event_id } = useParams();
  const navigate = useNavigate();
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
  const [paymentQrPreview, setPaymentQrPreview] = useState(null);
  const [paymentQrDiscountPreview, setPaymentQrDiscountPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch existing event data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        console.log("Fetching event with ID:", event_id);
        const response = await axiosApi.get(`/event_management/${event_id}`);
        console.log("API Response:", response.data);
        const eventData = response.data.data; // Access the data property from the API response
        
        setFormData({
          EventName: eventData.EventName || "",
          dateTime: eventData.dateTime ? new Date(eventData.dateTime) : null,
          location: eventData.location || "",
          description: eventData.description || "",
          long_desc: eventData.long_desc || "",
          hashtags: eventData.hashtags || "",
          registrationFee_normal: eventData.registrationFee_normal || "",
          registrationStart: eventData.registrationStart ? new Date(eventData.registrationStart) : null,
          registrationEnd: eventData.registrationEnd ? new Date(eventData.registrationEnd) : null,
          winnerReward: eventData.winnerReward || "",
          image: null,
          payment_qr: null,
          payment_qr_discount: null,
        });
        
        if (eventData.image) {
          setImagePreview(eventData.image);
        }
        if (eventData.payment_qr) {
          setPaymentQrPreview(eventData.payment_qr);
        }
        if (eventData.payment_qr_discount) {
          setPaymentQrDiscountPreview(eventData.payment_qr_discount);
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
        toast.error("Failed to load event data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (event_id) {
      console.log("Event ID found:", event_id);
      fetchEventData();
    } else {
      console.log("No event ID found in URL parameters");
      setLoading(false);
    }
  }, [event_id]);

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

  const handlePaymentQrChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, payment_qr: file }));
      setPaymentQrPreview(URL.createObjectURL(file));
    }
  };

  const handlePaymentQrDiscountChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, payment_qr_discount: file }));
      setPaymentQrDiscountPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    for (let key in formData) {
      const value = formData[key];
      // Only append image files if they are new files, not null
      if ((key === 'image' || key === 'payment_qr' || key === 'payment_qr_discount') && value === null) {
        continue; // Skip null image values
      }
      form.append(key, value instanceof Date ? value.toISOString() : value);
    }

    try {
      const res = await axiosApi.put(`/update-event/${event_id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Update Success:", res.data);
      toast.success("Event updated successfully!");
    } catch (err) {
      console.error("Update Error:", err);
      toast.error("Failed to update event. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axiosApi.delete(`/delete-event/${event_id}`);
      console.log("Delete Success:", res.data);
      toast.success("Event deleted successfully!");
      navigate("/AllEvents"); // Navigate back to events list
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to delete event. Please try again.");
    }
    setShowDeleteConfirm(false);
  };

  const CustomDateInput = React.forwardRef(
    ({ value, onClick, placeholder }, ref) => (
      <button
        onClick={onClick}
        ref={ref}
        className="w-full text-left px-4 py-2 border rounded-xl bg-white text-[#0d3c44] pr-10"
      >
        {value || placeholder}
      </button>
    ),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-100">
        <WebsiteConfig />
        <div className="flex-1 p-10 flex items-center justify-center">
          <div className="text-xl text-[#0d3c44]">Loading event data...</div>
        </div>
      </div>
    );
  }

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
            Edit Event - {formData.EventName}
          </h2>

          <input
            name="EventName"
            type="text"
            placeholder="Event Name"
            value={formData.EventName}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
            required
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
          />

          <textarea
            name="description"
            placeholder="Event Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
            rows={2}
          />

          <textarea
            name="long_desc"
            placeholder="Long Event Description"
            value={formData.long_desc}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
            rows={6}
          />

          <input
            name="hashtags"
            type="text"
            placeholder='Hashtags (e.g. ["#Music", "#Competition"])'
            value={formData.hashtags}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
          />

          <input
            name="registrationFee_normal"
            type="number"
            placeholder="Fee"
            value={formData.registrationFee_normal}
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
            value={formData.winnerReward}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0d3c44] focus:outline-none"
          />

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Upload Event Image
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
                  Click to upload event image
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

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Upload Payment QR Code
            </label>
            <label className="relative w-full h-64 mt-1 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer block">
              {paymentQrPreview ? (
                <>
                  <img
                    src={paymentQrPreview}
                    alt="Payment QR Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                    Click to replace
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  Click to upload payment QR code
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePaymentQrChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Upload Payment QR Discount Image
            </label>
            <label className="relative w-full h-64 mt-1 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer block">
              {paymentQrDiscountPreview ? (
                <>
                  <img
                    src={paymentQrDiscountPreview}
                    alt="Payment QR Discount Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                    Click to replace
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  Click to upload payment QR discount image
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePaymentQrDiscountChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-[#0d3c44] text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-[#0b3239] transition-all duration-150"
            >
              Update Event
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-red-700 transition-all duration-150"
            >
              Delete Event
            </button>
          </div>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-[#0d3c44] mb-4">
                  Confirm Delete
                </h3>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete "{formData.EventName}"? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-all duration-150"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-all duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EventManagement;
