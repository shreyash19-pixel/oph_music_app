import React,{ useEffect, useState } from "react";
import { toast, Bounce, ToastContainer } from "react-toastify";
import axiosApi from "../../conf/axios";

const RegistrationModal = ({ setIsModalOpen,id}) => {

    const [professions,setProfessions] = useState([])
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    instagram_handle: "",
    phone: "",
  });
  const fetchProfessions = async ()=>{
    try{
    const response = await axiosApi.get('/professions')
    setProfessions(response.data.data)

    }
    catch(err){
      console.log(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        instagram_handle: formData.instagram_handle,
        profession_id: formData.profession_id,
      };

      const response = await axiosApi.post(`/events/bookings/${id}`, payload);
      if (response.status === 201 || response.status === 200) {
        const bookingData = response.data.data || response.data;
        toast.success("Registration Successful", {
          position: "top-right",
          autoClose: 2000,
          theme: "dark",
          transition: Bounce,
        });
        setTimeout(()=>{
            setIsModalOpen(false);
        },3000)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
        transition: Bounce,
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
 useEffect(()=>{
  fetchProfessions();
 },[])
  return (
    <div className="fixed h-[110vh] top-[-5%] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg max-w-md w-full mx-4">
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Register for Event</h2>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Form fields */}
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                name="first_name"
                placeholder="First Name*"
                required
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                name="last_name"
                placeholder="Last Name*"
                required
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email Address*"
            required
            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="instagram_handle"
            placeholder="Instagram Handle*"
            required
            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
            value={formData.instagram_handle}
            onChange={handleChange}
          />

          <div className="flex gap-2">
            <select
              className="w-16 p-1 border border-gray-600 rounded bg-gray-700 text-white"
            >
              <option value="+91">+91</option>
            </select>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number*"
              required
              className="flex-1 p-2 border border-gray-600 rounded bg-gray-700 text-white"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div>
              <select
                name="profession_id"
                required
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"

                onChange={handleChange}
              >
                {
                 professions && professions.map((profession,ind)=>{
                    return(
                      <option key={ind} value={profession.id}>{profession.name}</option>
                    )
                  })
                }
              </select>
            </div>
          <button
            type="submit"
            className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-medium py-2 px-4 rounded"
          >
            Submit
          </button>
        </form>
      </div>
      <ToastContainer></ToastContainer>
    </div>
  );
};

export default RegistrationModal;
