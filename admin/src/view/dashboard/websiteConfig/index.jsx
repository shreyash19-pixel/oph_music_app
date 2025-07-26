import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "../../../components/Sidebar";
import { ROLES } from "./../../../utils/roles";
import { useAuth } from "../../../auth/AuthProvider";

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
      route: "/resource",
      roles: [
        ROLES.SUPER_ADMIN,
        ROLES.ADMINISTRATIVE_HEAD,
        ROLES.ADMINISTRATIVE_MEMBER,
        ROLES.OPERATION_HEAD,
        ROLES.OPERATION_MEMBER,
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
      label: "Collab",
      route: "/notifications",
      roles: [
        ROLES.SUPER_ADMIN,
        ROLES.ADMINISTRATIVE_HEAD,
        ROLES.ADMINISTRATIVE_MEMBER,
      ],
    },
    {
      label: "Event Management",
      route: "/Events",
      roles: [
        ROLES.SUPER_ADMIN,
        ROLES.SALES_HEAD,
        ROLES.SALES_MEMBER,
        ROLES.PROJECT_HEAD,
        ROLES.PROJECT_MEMBER,
        ROLES.ACCOUNTS_HEAD,
        ROLES.ACCOUNTS_MEMBER,
      ],
    },
    {
      label: "Leaderboard",
      route: "/leaderboard",
      roles: [ROLES.ADMINISTRATIVE_HEAD, ROLES.ADMINISTRATIVE_MEMBER,ROLES.SUPER_ADMIN],
    },
  ];

   const { user } = useAuth();
  return (
    <div className="h-screen flex overflow-hidden relative bg-gray-50">
      <Sidebar title="Website Config" links={links} userRole={user.role} />
    console.log(user.role);
    
      {/* Main content */}
      <main className="flex-1 p-10 flex items-center justify-center">
        <div className="text-gray-400 italic">
          Select an item from the sidebar…
        </div>
      </main>
    </div>
  );
};

export default WebsiteConfig;
