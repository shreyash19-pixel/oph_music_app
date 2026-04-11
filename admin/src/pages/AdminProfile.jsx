import React, { useEffect, useMemo, useState } from "react";
import DashBoardSidebar from "../components/DashBoardSidebar";
import { useAuth } from "../auth/AuthProvider";
import { ROLES } from "../utils/roles";
import axiosApi from "../conf/axios";

/** Map JWT `role` string → display department + role title. */
const ROLE_TO_DEPARTMENT_AND_TITLE = {
  [ROLES.SUPER_ADMIN]: { department: "Administration", roleTitle: "Super Admin" },
  [ROLES.ADMINISTRATIVE_HEAD]: {
    department: "Administrative",
    roleTitle: "Head",
  },
  [ROLES.ADMINISTRATIVE_MEMBER]: {
    department: "Administrative",
    roleTitle: "Member",
  },
  [ROLES.SALES_HEAD]: { department: "Sales", roleTitle: "Head" },
  [ROLES.SALES_MEMBER]: { department: "Sales", roleTitle: "Member" },
  [ROLES.OPERATION_HEAD]: { department: "Operations", roleTitle: "Head" },
  [ROLES.OPERATION_MEMBER]: { department: "Operations", roleTitle: "Member" },
  [ROLES.PROJECT_HEAD]: { department: "Project", roleTitle: "Head" },
  [ROLES.PROJECT_MEMBER]: { department: "Project", roleTitle: "Member" },
  [ROLES.CREATIVE_HEAD]: { department: "Creative", roleTitle: "Head" },
  [ROLES.CREATIVE_MEMBER]: { department: "Creative", roleTitle: "Member" },
  [ROLES.ACCOUNTS_HEAD]: { department: "Accounts", roleTitle: "Head" },
  [ROLES.ACCOUNTS_MEMBER]: { department: "Accounts", roleTitle: "Member" },
  [ROLES.NOT_ASSIGNED]: { department: "—", roleTitle: "Not assigned" },
};

function departmentAndRoleFromJwt(role) {
  if (!role || typeof role !== "string") {
    return { department: "—", roleTitle: "—" };
  }
  const normalized = role.trim().toLowerCase();
  if (ROLE_TO_DEPARTMENT_AND_TITLE[normalized]) {
    return ROLE_TO_DEPARTMENT_AND_TITLE[normalized];
  }
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const titleWord = parts[parts.length - 1];
    const deptWords = parts.slice(0, -1);
    const cap = (w) =>
      w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w;
    return {
      department: deptWords.map(cap).join(" "),
      roleTitle: cap(titleWord),
    };
  }
  return {
    department: "—",
    roleTitle: role.trim(),
  };
}

const AdminProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const res = await axiosApi.get("/admin/profile");
        if (cancelled) return;
        if (res.data?.success && res.data?.data) {
          setProfile(res.data.data);
        } else {
          setProfileError(res.data?.message || "Could not load profile");
        }
      } catch (e) {
        if (cancelled) return;
        setProfileError(
          e.response?.data?.message || e.message || "Could not load profile",
        );
        setProfile(null);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const email =
    profile?.email?.trim() || user?.email?.trim() || "—";
  const name =
    profile?.name?.trim() ||
    (profileLoading ? "…" : "—");
  const contactNumber =
    profile?.contactNumber?.trim() ||
    (profileLoading ? "…" : "—");

  const rawRole =
    (typeof profile?.role === "string" && profile.role) ||
    (typeof user?.role === "string" && user.role) ||
    "";

  const { department, roleTitle } = useMemo(
    () => departmentAndRoleFromJwt(rawRole),
    [rawRole],
  );

  const rows = [
    { label: "Name", value: name },
    { label: "Contact number", value: contactNumber },
    { label: "Email", value: email },
    { label: "Department", value: department },
    { label: "Role", value: roleTitle },
  ];

  const headerName =
    profile?.name?.trim() || (profileLoading ? "Loading…" : email);

  return (
    <div className="h-screen flex overflow-hidden relative bg-gray-50">
      <DashBoardSidebar>
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-[#0d3c44] mb-2">
            Your profile
          </h1>
          <p className="text-gray-600 text-sm mb-8">
            Signed-in admin user details from your session.
          </p>
          {profileError && (
            <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-50 text-amber-900 text-sm px-4 py-3">
              {profileError}{" "}
              <span className="text-amber-800/80">
                Name and phone may be unavailable until this succeeds.
              </span>
            </div>
          )}
          <div className="rounded-2xl border border-[#0d3c44]/20 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0d3c44] to-[#145058] text-white">
              <p className="text-sm opacity-90">Logged in as</p>
              <p className="text-lg font-semibold truncate">{headerName}</p>
              {profile?.name?.trim() && (
                <p className="text-sm mt-1 opacity-90 truncate">{email}</p>
              )}
              <p className="text-sm mt-2 opacity-95">
                <span className="opacity-80">Department:</span>{" "}
                <span className="font-medium">{department}</span>
              </p>
              <p className="text-sm mt-0.5 opacity-95">
                <span className="opacity-80">Role:</span>{" "}
                <span className="font-medium">{roleTitle}</span>
              </p>
            </div>
            <dl className="divide-y divide-gray-100">
              {rows.map(({ label, value }) => (
                <div
                  key={label}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 px-6 py-4"
                >
                  <dt className="text-sm font-medium text-[#0d3c44]">
                    {label}
                  </dt>
                  <dd className="sm:col-span-2 text-sm text-gray-800 break-all">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </DashBoardSidebar>
    </div>
  );
};

export default AdminProfile;
