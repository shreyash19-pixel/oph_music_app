import { useState } from 'react';
import axiosApi from '../../../../conf/axios';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import { TiTick } from "react-icons/ti";
import { Link } from 'react-router-dom';
import ContactBG from '../../../../../public/assets/images/music_bg.png'
import Glow from '../../../../../public/assets/images/contact-elipise.png'

const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?(\?.*)?$/;

function HeroSection() {
  const [modal,setModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    instagram_handle: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/; // Ensures exactly 10 digits
    return phoneRegex.test(phone);
  };
  const closeModal = () =>{
    setModal(false);
  }
  const handleSubmit = async(e) => {
    e.preventDefault();
   
    if (!isValidEmail(formData.email)) {
      toast.error("Invalid Email Address!", { position: "top-right", theme: "dark" });
      return;
    }
    console.log(formData.instagram_handle);
    console.log(instagramRegex.test(formData.instagram_handle));
    
    
    
    if (!instagramRegex.test(formData.instagram_handle)) {
      toast.error(
        "Invalid Instagram URL! Please enter a valid profile link.",
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        }
      );
      return; 
    }
    if (!isValidPhoneNumber(formData.phone)) {
      toast.error("Invalid Phone Number! Must be 10 digits.", { position: "top-right", theme: "dark" });
      return;
    }

    // Create FormData object
    const data = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      data.append(key, value);
    }

    // Log form data
    console.log('Form Data:', formData);
    const response = await axiosApi.post('/contacts',formData)
    if(response.status == 201){
      setModal(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        instagram_handle: '',
        description: '',
      })
    }
    else{
      toast.error('OOPS! Something went wrong', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }
    // Optionally, you can send the formData to an API or server here
    // axiosApi.post('/events/bookings', data);
  };

  return (
    <div
      className="w-full pb-10 md:pb- md:pt-10 flex items-center justify-center bg-cover bg-center relative before:content-[''] before:absolute before:inset-0 before:block "
      style={{ backgroundImage: `url(${ContactBG})` }}
    >
      <img src={Glow} className='absolute left-0' alt="" />
      <div className="flex h-full md:px-16 lg:px-16 xl:px-16 justify-between flex-col lg:flex-row items-center w-full z-10  gap-6 mt-12">
        <div className="flex  flex-col lg:w-1/2 px-4 md:px-0">
          <span className=" text-[24px] md:text-[34px] mt-20 md:mt-10  lg:text-[42px] text-white uppercase font-extrabold ">
            Fill out this form to get updates, detailed info, and{' '}
            <span className="text-[#5DC9DE]"> stay connected with the OPH Community</span>
          </span>
          <span className="text-[16px] md:text-[20px] text-[#9BA3B7] mt-2">
            Give us a call, and if the call doesn&apos;t connect, please fill out the form. We will get in touch with you within 24 hours.
          </span>

          <div className="container w-full h-[1px] opacity-30 mx-auto bg-white relative my-4"></div>

          <div className="flex flex-col lg:flex-row text-[20px]">
            <span className="text-[#ffffff]">OPH Contact Details: </span>
            <div className="flex-col flex lg:pl-5">
              <a href="tel:+918976592947">
                <span className="text-[#2DDA89] mt-3 lg:mt-0">+91 - 8976592947</span>
              </a>
              <a href="tel:+918433792947">
                <span className="text-[#2DDA89] mt-3">+91 - 8433792947</span>
              </a>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 mt-5 md:mt-20  md:mt-14 w-[90%]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-300 mb-4">
                Full Name: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-4">
                Email: <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="abc@gmail.com"
                required
              />
            </div>

            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-300 mb-4">
                Contact: <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="contact"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="+91-1234567890"
                required
              />
            </div>

            <div>
              <label htmlFor="insta" className="block text-sm font-medium text-gray-300 mb-4">
                Instagram Handle: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="insta"
                name="instagram_handle"
                value={formData.instagram_handle}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="instahandle"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-4">
                Description:
              </label>
              <textarea
                rows={4}
                id="description"
                name="description"
                maxLength={1000}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="Your description here"
              />
            </div>

            <div className="py-4">
              <button
                type="submit"
                className="border-2 border-[#5DC9DE] text-black bg-[#5DC9DE] px-4 rounded-[43px] py-2 w-full font-bold"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer className="z-[100000]"></ToastContainer>
      {modal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="bg-[#2C3141] w-[80%] lg:w-[50%] flex justify-center flex-col items-center rounded-xl py-10 text-white text-center">
            <img src="/assets/success.svg" alt="tick" />
            <p className="text-center sm:px-20 px-4 mt-2 sm:text-[23px]">
              Thank you for submitting your details! You’ll receive regular updates and detailed information directly to your email. Stay connected with the OPH Community!
            </p>
            <Link to={'/'}>
              <button className="px-14 hover:font-bold mt-10 py-2 bg-[#5DC9DE] text-[#181B24] font-semibold uppercase rounded-full">
                Back To Home
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeroSection;
