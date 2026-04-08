import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "../../../components/Sidebar";
import { ROLES } from "./../../../utils/roles";
import { useAuth } from "../../../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import WebConfigSidebar from "../../../components/WebConfigSidebar";

// WebsiteConfig page – independent component
// Tailwind‑only styling – brand colour #0d3c44

const WebsiteConfig = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    {
      label: "Contact Management",
      route: "/Contact",
      roles: [
        ROLES.SUPER_ADMIN,
        ROLES.ADMINISTRATIVE_HEAD,
        ROLES.ADMINISTRATIVE_MEMBER,
        ROLES.SALES_MEMBER,
        ROLES.SALES_HEAD,
      ],
    },
    {
      label: "Resource Management",
      roles: [
        ROLES.SUPER_ADMIN,
        ROLES.ADMINISTRATIVE_HEAD,
        ROLES.ADMINISTRATIVE_MEMBER,
        ROLES.OPERATION_HEAD,
        ROLES.OPERATION_MEMBER,
      ],
      children: [
        {
          label: "Create Resource",
          route: "/resource",
        },
        {
          label: "View Resource",
          route: "/allResource",
        },
      ],
    },
    {
      label: "Home Page",
      route: "/homePage",
      roles: [
        ROLES.SUPER_ADMIN,
        ROLES.ADMINISTRATIVE_HEAD,
        ROLES.ADMINISTRATIVE_MEMBER,
      ],
    },
    {
       label: "Page Media Upload",
       route: "/PageMediaUpload",
       roles: [
       ROLES.SUPER_ADMIN,
       ROLES.ADMINISTRATIVE_HEAD,
       ROLES.ADMINISTRATIVE_MEMBER,
      ],
    },
    {
       label: "Upload Video",
       route: "/UploadVideo",
       roles: [
       ROLES.SUPER_ADMIN,
       ROLES.ADMINISTRATIVE_HEAD,
       ROLES.ADMINISTRATIVE_MEMBER,
      ],
    },
    {
      label: "Collab",
      route: "/Collab",
      roles: [
        ROLES.SUPER_ADMIN,
        ROLES.ADMINISTRATIVE_HEAD,
        ROLES.ADMINISTRATIVE_MEMBER,
      ],
    },
    {
      label: "Event Management",
      roles: [
        ROLES.SUPER_ADMIN,
        ROLES.SALES_HEAD,
        ROLES.SALES_MEMBER,
        ROLES.PROJECT_HEAD,
        ROLES.PROJECT_MEMBER,
        ROLES.ACCOUNTS_HEAD,
        ROLES.ACCOUNTS_MEMBER,
      ],
      children: [
        {
          label: "Event Creation",
          route: "/Events",
        },
        {
          label: "Events",
          route: "/allEvents",
        },
        {
          label: "Event Participants",
          route: "/event_participants",
        },
      ],
    },
    {
      label: "Leaderboard",
      route: "/LeaderBoard",
      roles: [
        ROLES.ADMINISTRATIVE_HEAD,
        ROLES.ADMINISTRATIVE_MEMBER,
        ROLES.SUPER_ADMIN,
      ],
    },
    {
      label: "Setting",
      route: "/websiteConfig_Setting",
      roles: [
        ROLES.SUPER_ADMIN,
        ROLES.ADMINISTRATIVE_HEAD,
        ROLES.SALES_HEAD,
        ROLES.SALES_MEMBER,
      ],
    },
  ];

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  if (loading) {
    return <div>Loading...</div>;
  }

  const handleGoHome = () => {
    navigate("/");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-50">
        <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Session expired or not logged in
          </h2>
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
    <div>
      <WebConfigSidebar>
      </WebConfigSidebar>
    </div>
  );
};

export default WebsiteConfig;
