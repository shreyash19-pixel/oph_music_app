import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../../../API/profile";
import { useArtist } from "../../../API/ArtistContext";

const SignInForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { login, logout } = useArtist();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (location.state?.status === "cancelled") {
      toast.error(
        "Payment is mandatory. Please complete the payment to continue."
      );
      navigate("/auth/login", { replace: true, state: {} });
    }
  }, [location.state, logout, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser(credentials.email, credentials.password);

      if (response.success) {
       
        toast.success("Login Successful");       
        localStorage.setItem("token", response.token);
     
        const path = `${response.step}`
        navigate(path, {
          state: {
            from: "Registeration"
          }
        });
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
    <div
      className="py-40 pt-48 flex items-center justify-center bg-[url('/assets/images/music_bg.png')] bg-cover bg-center relative
              "
    >
      <div className="w-full max-w-2xl p-8 rounded-lg relative z-10">
        <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)] text-center">
          SIGN IN
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          Hey family member, your personal portal is waiting for you, where
          every step leads you toward growth and success in your music career.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              placeholder="abc@gmail.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400"
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
          </div>

          <div className="text-right">
            <a
              href="#"
              className="text-sm text-cyan-400 hover:text-cyan-300"
              onClick={() => {
                navigate("/auth/forgot-password");
              }}
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className={`w-full py-2 px-4 ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-cyan-400 hover:bg-cyan-500"
            } text-gray-900 font-medium rounded-full transition-colors duration-200`}
            disabled={loading}
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Don&apos;t have an account?{" "}
          <a
            href="#"
            className="text-cyan-400 hover:text-cyan-300"
            onClick={() => {
              navigate("/auth/signup");
            }}
          >
            Create Account
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignInForm;
