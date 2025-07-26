import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosApi from "../conf/axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../auth/AuthProvider";

const AdminSignInForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosApi.post("/admin/signin", {
        email: credentials.email,
        password: credentials.password,
      });

      if (response.status === 200) {
        toast.success("Login Successful");
        const token = response.data.token;
        localStorage.setItem("token", token);
        login(token);
        navigate("/home");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Login failed. Please try again."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/assets/images/music_bg.png')] bg-cover bg-center p-5">
      <div className="w-full max-w-md bg-[#0d3c44] p-10 rounded-2xl shadow-2xl border border-white/20">
        <h1 className="text-center text-3xl font-extrabold text-white mb-6">
          SIGN IN
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="email" className="block mb-2 text-white font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#0d3c44] focus:ring-1 focus:ring-[#0d3c44]"
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block mb-2 text-white font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 pr-12 focus:outline-none focus:border-[#0d3c44] focus:ring-1 focus:ring-[#0d3c44]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0d3c44] hover:text-[#0b3239]"
              >
                {showPassword ? <FiEyeOff size={22} /> : <FiEye size={22} />}
              </button>
            </div>
          </div>

          <div className="text-right mb-5">
            <button
              type="button"
              onClick={() => navigate("/auth/forgot-password")}
              className="text-sm text-white underline hover:text-[#609900] transition"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-base font-bold rounded-lg transition-colors duration-200 ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-white text-[#0d3c44] hover:bg-gray-100"
            }`}
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-white text-sm">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="underline hover:text-[#609900] transition"
            onClick={() => navigate("/auth/signup")}
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdminSignInForm;
