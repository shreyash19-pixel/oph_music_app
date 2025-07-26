// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";

// const Events = () => {
//   const [events, setEvents] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Manually map static event data to match your table format
//     const rawEvents = [
//       {
//         id: "EVT001",
//         name: "Music Concert",
//         date: "2025-08-01",
//         location: "Mumbai",
//         organizer: "XYZ Inc"
//       },
//       {
//         id: "EVT002",
//         name: "Art Exhibition",
//         date: "2025-09-10",
//         location: "Delhi",
//         organizer: "Art House"
//       }
//     ];

//     const formatted = rawEvents.map((event, i) => ({
//       ophid: event.id,
//       full_name: event.name,
//       stage_name: event.organizer,
//       email: "event@example.com", // placeholder
//       contact_num: "0000000000",  // placeholder
//       user_pass: "N/A",
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       artist_type: "Event",
//       personal_photo: null,
//       location: event.location,
//       step_status: "scheduled",
//       reject_reason: null,
//       current_step: "/events/details"
//     }));

//     setEvents(formatted);
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50 px-4 md:px-8 py-6">
//       {/* Header Section */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">Event List</h1>
//         <button
//           onClick={() => navigate("/add-event")}
//           className="px-5 py-2.5 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition"
//         >
//           + Add Event
//         </button>
//       </div>

//       {/* Event Table */}
//       <>
//       <SearchableDynamicTable
//         data={events}
//         pageSize={5}
//         title="All Events"
//         detailsUrl="/event-details"
//         excludeColumns={["user_pass", "email", "contact_num", "personal_photo", "reject_reason", "current_step"]}
//       />
//       <SearchableDynamicTable
//         data={events}
//         pageSize={5}
//         title="All Events"
//         detailsUrl="/event-details"
//         excludeColumns={["user_pass", "email", "contact_num", "personal_photo", "reject_reason", "current_step"]}
//       />
//       </>
//     </div>

//   );
// };

// export default Events;


import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EventAdminForm = () => {
  const [formData, setFormData] = useState({
    competitionName: "",
    dateTime: null,
    location: "",
    description: "",
    hashtags: "",
    registrationFee_normal: "",
    registrationFee_offer_availableFor: "",
    registrationFee_offer_discount: "",
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

    console.log("Submitting Form:", Object.fromEntries(form.entries()));

    try {
      const res = await axios.post("http://localhost:4000/admin/events", form, {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-2xl space-y-6 border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-[#0d3c44]">Create New Event</h2>

        <input
          name="competitionName"
          type="text"
          placeholder="Competition Name"
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
          className="w-full border px-4 py-2 rounded-xl bg-[#0d3c44] text-white placeholder-white focus:ring-2 focus:ring-[#0b3239] focus:outline-none"
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
          placeholderText="Registration End"
          customInput={<CustomDateInput placeholder="Registration End" />}
          className="w-full border px-4 py-2 rounded-xl bg-[#0d3c44] text-white placeholder-white focus:ring-2 focus:ring-[#0b3239] focus:outline-none"
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

          <label className="relative w-64 h-40 mt-1 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer block">
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
  );
};

export default EventAdminForm;

