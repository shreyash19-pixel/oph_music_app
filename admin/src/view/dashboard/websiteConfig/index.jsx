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
  return (
    <div>
      <WebConfigSidebar>
      </WebConfigSidebar>
    </div>
  );
};

export default WebsiteConfig;
