import React from "react";
import Sidebar from "./Sidebar"; // adjust path if needed
import { ROLES } from "../utils/roles";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

const artistLinks = [
  {
    label: "Artist",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMINISTRATIVE_HEAD,
      ROLES.ADMINISTRATIVE_MEMBER,
      ROLES.SALES_HEAD,
      ROLES.SALES_MEMBER,
    ],
    children: [
      {
        label: "All",
        route: "/Artist/All",
      },
      {
        label: "New",
        route: "/artist/new",
      },
    ],
  },
  {
    label: "Content",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMINISTRATIVE_HEAD,
      ROLES.ADMINISTRATIVE_MEMBER,
      ROLES.CREATIVE_HEAD,
      ROLES.CREATIVE_MEMBER,
      ROLES.ACCOUNTS_HEAD,
      ROLES.ACCOUNTS_MEMBER,
    ],
    children: [
      {
        label: "New",
        route: "/ContentNew",
      },
      {
        label: "Manage",
        route: "/ContentManage",
      },
      {
        label: "Tv Publishing",
        route: "/content/tv",
      },
    ],
  },
  {
    label: "Analytics",
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_HEAD, ROLES.OPERATION_MEMBER],
    children: [
      { label: "Artist KPI", route: "/analytics/kpi" },
      { label: "Content Analysis", route: "/analytics/analysis" },
      { label: "Content Release", route: "/analytics/release" },
    ],
  },
  {
    label: "Payments",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMINISTRATIVE_HEAD,
      ROLES.ADMINISTRATIVE_MEMBER,
      ROLES.ACCOUNTS_HEAD,
      ROLES.ACCOUNTS_MEMBER,
    ],
    children: [
      {
        label: "All",
        route: "/payments/all",
      },
      {
        label: "Withdrawals",
        route: "/payments/withdrawals",
      },
    ],
  },
  { label: "All Data", route: "/data" },
  { label: "Notifications", route: "/notifications" },
  {
    label: "Time Calendar",
    route: "/calendar",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMINISTRATIVE_HEAD,
      ROLES.ADMINISTRATIVE_MEMBER,
    ],
  },
  {
    label: "Tickets",
    route: "/tickets",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMINISTRATIVE_HEAD,
      ROLES.ADMINISTRATIVE_MEMBER,
      ROLES.ACCOUNTS_HEAD,
      ROLES.ACCOUNTS_MEMBER,
    ],
  },
  { label: "Settings", route: "/settings", roles: [ROLES.SUPER_ADMIN] },
];

const ArtistSidebar = ({ children }) => {
  const navigate = useNavigate();
  const handleTitleClick = () => {
    navigate("/home");
  }
  const handleGoHome = () => {
    navigate('/')
  }
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Session expired or not logged in</h2>
        <p className="text-gray-500 mb-6">
          Please login again to continue accessing your dashboard.
        </p>
        <button
          onClick={handleGoHome}
          className="px-6 py-3 bg-[#0C3C44] text-white rounded-lg shadow hover:bg-[#0b353c] transition duration-300"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}


  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 relative">
      <Sidebar title={
        <button
          onClick={handleTitleClick}
        // className="text-blue-600 hover:underline focus:outline-none"
        >
          Artist Portal
        </button>
      } links={artistLinks} userRole={user.role} />
      <main className="flex-1 p-10 overflow-y-auto">
        {children || (
          <div className="text-gray-400 italic flex justify-center items-center h-full">
            Select an item from the sidebar…
          </div>
        )}
      </main>
    </div>
  );
};

export default ArtistSidebar;
