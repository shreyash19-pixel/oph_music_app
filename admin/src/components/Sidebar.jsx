import React, { useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const Sidebar = ({ title, links, userRole }) => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const navigate = useNavigate();

  const toggleSection = (label) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const canAccess = (roles) => {
    if (!roles) return true;
    return roles.includes(userRole);
  };

  const handleLogout = () => {
    // Add your logout logic here (e.g., remove token, redirect)
    console.log("Logging out...");
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-20 p-3 rounded-2xl bg-[#0d3c44] text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#0d3c44]"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed lg:static inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } transition-transform duration-300 ${
          collapsed ? "w-20" : "w-64"
        } bg-[#0d3c44] text-white flex flex-col py-6 shadow-2xl rounded-r-2xl z-10`}
      >
        <div className="flex items-center justify-between px-4 mb-6">
          {!collapsed && <h1 className="text-xl font-bold">{title}</h1>}
          <div className="flex items-center space-x-2">
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1 rounded hover:bg-[#0b3239] transition"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded hover:bg-[#0b3239] transition"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronsRight className="w-5 h-5" />
              ) : (
                <ChevronsLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2">
          <ul className="space-y-1">
            {links.map((link) => {
              if (!canAccess(link.roles)) return null;

              return (
                <li key={link.label}>
                  {link.children ? (
                    <>
                      <button
                        onClick={() => toggleSection(link.label)}
                        className="w-full flex items-center justify-between font-medium py-2 px-2 rounded hover:bg-[#0b3239] transition"
                      >
                        <span className={`${collapsed ? "sr-only" : ""}`}>{link.label}</span>
                        {!collapsed && (
                          <>
                            {openSections[link.label] ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </>
                        )}
                      </button>
                      {!collapsed && openSections[link.label] && (
                        <ul className="ml-4 space-y-1">
                          {link.children
                            .filter((sub) => canAccess(sub.roles))
                            .map((sub) => (
                              <li key={sub.label}>
                                <button
                                  onClick={() => navigate(sub.route)}
                                  className="block w-full text-left py-1 pl-4 rounded hover:bg-[#0b3239] text-sm transition"
                                >
                                  {sub.label}
                                </button>
                              </li>
                            ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => navigate(link.route)}
                      className={`w-full text-left py-2 px-2 font-medium rounded hover:bg-[#0b3239] transition ${
                        collapsed ? "justify-center" : ""
                      }`}
                    >
                      <span className={`${collapsed ? "sr-only" : ""}`}>{link.label}</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
