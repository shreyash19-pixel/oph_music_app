import React from "react";
import { useNavigate } from "react-router-dom";
import DashBoardSidebar from "../../../components/DashBoardSidebar";
import { useAuth } from "../../../auth/AuthProvider";
import { WEBSITE_CONFIG_HUB_ROLES } from "../../../utils/roles";
// Dashboard with two views: Home & Artist Portal
// Tailwind‑only styling – brand colour #0d3c44


// Main Dashboard component
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const showWebsiteConfig =
    user?.role && WEBSITE_CONFIG_HUB_ROLES.includes(user.role);


  // Sidebar link sets
 




  

  return (
    <div className="h-screen flex overflow-hidden relative bg-gray-50">

    

     
    
    <DashBoardSidebar>

      {/* Main content */}
      <main className="flex-1 p-10 flex items-center justify-center">
        { (
          <div className="flex flex-row gap-6">
            {/* Artist Portal button navigates to new view */}
            <button
              onClick={() => navigate("/artistPortal")}
              className="px-8 py-6 text-xl rounded-2xl font-semibold bg-[#0d3c44] text-white shadow-lg hover:bg-[#0b3239] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d3c44] transition-transform hover:scale-105"
            >
              Artist Portal
            </button>

            {showWebsiteConfig && (
              <button
                type="button"
                onClick={() => navigate("/WebsiteConfig")}
                className="px-8 py-6 text-xl rounded-2xl font-semibold border-2 border-[#0d3c44] text-[#0d3c44] shadow-lg hover:bg-[#e6f2f4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d3c44] transition-transform hover:scale-105"
              >
                Website Config
              </button>
            )}
          </div>
        ) 
        }
      </main>
    </DashBoardSidebar>
    </div>
  );
};

export default Dashboard;
