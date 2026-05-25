import React from "react";
import Sidebar from "./Sidebar";
import {
  ROLES,
  EVENT_MANAGEMENT_WEB_CONFIG_ROLES,
  WEBSITE_CONFIG_SETTINGS_ROLES,
} from "../utils/roles";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

// Website Config hub — layout matches ArtistSidebar (h-screen, sidebar + scrollable main).

const WebConfigSidebar = ({ children }) => {
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
          label: "View/Update Resource",
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
      roles: EVENT_MANAGEMENT_WEB_CONFIG_ROLES,
      children: [
        {
          label: "Event Creation",
          route: "/Events",
        },
        {
          label: "Events",
          route: "/AllEvents",
        },
        {
          label: "Event Participants",
          route: "/event_participants",
        },
        {
          label: "Event Winning",
          route: "/event-winning",
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
      roles: WEBSITE_CONFIG_SETTINGS_ROLES,
    },
  ];

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const handleTitleClick = () => {
    navigate("/home");
  };
  const handleGoHome = () => {
    navigate("/");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
            type="button"
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
      <Sidebar
        title={
          <button type="button" onClick={handleTitleClick}>
            Website Config
          </button>
        }
        links={links}
        userRole={user.role}
      />
      <main className="flex-1 p-10 overflow-y-auto">{children}</main>
    </div>
  );
};

export default WebConfigSidebar;
