import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setIsLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token, new_password: newPassword });
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-40 pt-48 flex items-center justify-center bg-[url('/assets/images/contact/bg.png')] bg-cover bg-center relative 
              before:content-['']
              before:absolute
              before:inset-0
              before:block
              before:bg-gradient-to-b
              before:from-[#000000]
              before:to-[#0000]
              before:opacity-75
              before:z-5">
      <div className="w-full max-w-2xl p-8 rounded-lg relative z-10">
        <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
          RESET PASSWORD
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
        Your password is the key to your control. Please save it in a secure place so you never have to worry or hesitate next time.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
              New Password:
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              required
              minLength="8"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
              Confirm Password:
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              required
              minLength="8"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 ${
              isLoading ? 'bg-cyan-500 cursor-not-allowed' : 'bg-cyan-400 hover:bg-cyan-500'
            } text-gray-900 font-medium rounded-full transition-colors duration-200`}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 