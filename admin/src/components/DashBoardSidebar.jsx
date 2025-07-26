import React from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

const homeLinks = [
    { label: "Artist Portal", route: "/artistPortal" },
    { label: "New SignUp", route: "/New_SignUp" },
    { label: "Website Config", route: "/WebsiteConfig" },
    { label: "Assign Role", route: "/role_change" },
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
