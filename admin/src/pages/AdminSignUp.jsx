import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosApi from "../conf/axios";

const AdminSignUpForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Name.trim()) newErrors.Name = "Full name is required";
    else if (formData.Name.length < 2)
      newErrors.Name = "Name must be at least 2 characters";

    if (!formData.Email) newErrors.Email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email))
      newErrors.Email = "Invalid email format";

    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    else if (!/^\d{10}$/.test(formData.contactNumber))
      newErrors.contactNumber = "Must be 10 digits";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(formData.password)
    )
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getFieldError = (fieldName, value, formData) => {
    switch (fieldName) {
      case "Name":
        if (!value.trim()) return "Full name is required";
        if (value.length < 2) return "Name must be at least 2 characters";
        return "";

      case "Email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        return "";

      case "contactNumber":
        if (!value) return "Contact number is required";
        if (!/^\d{10}$/.test(value)) return "Must be 10 digits";
        return "";

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (
          !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(value)
        )
          return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
        return "";

      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (formData.password !== value) return "Passwords do not match";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => {
      const updatedFormData = { ...prevFormData, [name]: value };

      // Get error for the current field
      const error = getFieldError(name, value, updatedFormData);

      // Also revalidate confirmPassword if password is changing
      const confirmPasswordError =
        name === "password"
          ? getFieldError(
              "confirmPassword",
              updatedFormData.confirmPassword,
              updatedFormData
            )
          : errors.confirmPassword;

      // Set updated errors
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
        ...(name === "password" && { confirmPassword: confirmPasswordError }),
      }));

      return updatedFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    setIsSubmitting(true);
    try {
      const signupUser = async (formData) => {
        console.log(formData);

        const response = await axiosApi.post("/admin/signup", formData);
        return response.data;
      };
      const response = await signupUser(formData);
      console.log(response);

      if (response.success) {
        localStorage.setItem("token", response.token);
        navigate("/home");
      }
    } catch (e) {
      toast.error(e.response);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/assets/images/music_bg.png')] bg-cover bg-center p-5">
      <div className="w-full max-w-2xl bg-[#0d3c44] p-10 rounded-2xl shadow-2xl border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-4">
            ADMIN SIGN UP
            </h1>
          <p className="text-gray-200 text-sm">
            Create your admin account to manage the OPH Music platform
          </p>
        </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
            <label className="block mb-2 text-white font-medium">
              Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#0d3c44] focus:ring-1 focus:ring-[#0d3c44]"
              placeholder="Enter your full name"
                />
                {errors.Name && (
              <div className="text-red-400 text-sm mt-1">{errors.Name}</div>
                )}
              </div>

              <div>
            <label className="block mb-2 text-white font-medium">
              Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#0d3c44] focus:ring-1 focus:ring-[#0d3c44]"
              placeholder="admin@example.com"
                />
                {errors.Email && (
              <div className="text-red-400 text-sm mt-1">
                    {errors.Email}
                  </div>
                )}
              </div>

              <div>
            <label className="block mb-2 text-white font-medium">
              Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
              <select className="px-4 py-3 rounded-l-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#0d3c44] focus:ring-1 focus:ring-[#0d3c44]">
                    <option>IND +91</option>
                  </select>
                  <input
                    type="tel"
                maxLength={10}
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                className="w-full px-4 py-3 rounded-r-lg border border-l-0 border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#0d3c44] focus:ring-1 focus:ring-[#0d3c44]"
                placeholder="Enter 10-digit number"
                  />
                </div>
                {errors.contactNumber && (
              <div className="text-red-400 text-sm mt-1">
                    {errors.contactNumber}
                  </div>
                )}
              </div>

              <div>
            <label className="block mb-2 text-white font-medium">
              Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 pr-12 focus:outline-none focus:border-[#0d3c44] focus:ring-1 focus:ring-[#0d3c44]"
                placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0d3c44] hover:text-[#0b3239]"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M6.58 6.58l10.84 10.84M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
              <div className="text-red-400 text-sm mt-1">
                    {errors.password}
                  </div>
                )}
              </div>

              <div>
            <label className="block mb-2 text-white font-medium">
              Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 pr-12 focus:outline-none focus:border-[#0d3c44] focus:ring-1 focus:ring-[#0d3c44]"
                placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0d3c44] hover:text-[#0b3239]"
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M6.58 6.58l10.84 10.84M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
              <div className="text-red-400 text-sm mt-1">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <button
                type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-[#0d3c44] font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
            {isSubmitting ? "Creating Account..." : "Create Admin Account"}
              </button>
            </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-200 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/admin/signin")}
              className="text-white hover:text-gray-300 font-medium underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignUpForm;