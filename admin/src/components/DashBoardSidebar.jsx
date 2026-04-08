import React from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { ROLES, WEBSITE_CONFIG_HUB_ROLES } from "../utils/roles";

/** Who may open the New SignUp queue (under-review list; rejected-payments subview is role-gated on the page). */
const NEW_SIGNUP_SIDEBAR_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.SALES_HEAD,
  ROLES.SALES_MEMBER,
  ROLES.ACCOUNTS_HEAD,
  ROLES.ACCOUNTS_MEMBER,
];

const homeLinks = [
  { label: "Artist Portal", route: "/artistPortal" },
  { label: "New SignUp", route: "/New_SignUp", roles: NEW_SIGNUP_SIDEBAR_ROLES },
  { label: "Website Config", route: "/WebsiteConfig", roles: WEBSITE_CONFIG_HUB_ROLES },
  {
    label: "Assign Role",
    route: "/role_change",
    roles: [ROLES.SUPER_ADMIN],
  },
];

const DashBoardSidebar = ({ children }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const handleTitleClick = () => {
        navigate("/home");
    };
    console.log(loading,"before");

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Please login</div>;
    }

    return (
        <div className="h-screen flex overflow-hidden bg-gray-50 relative">
            <Sidebar
                title={
                    <button onClick={handleTitleClick}>
                        DashBoard
                    </button>
                }
                links={homeLinks}
                userRole={user.role}
            />
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

export default DashBoardSidebar;
