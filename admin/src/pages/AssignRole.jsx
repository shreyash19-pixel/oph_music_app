import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosApi from "../conf/axios";
import DashBoardSidebar from "../components/DashBoardSidebar";
import { ROLES } from "../utils/roles";
import { useAuth } from "../auth/AuthProvider";

export default function AssignRoles() {
  const { user, logout } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    try {
      const res = await axiosApi.get("/admin/personal");
      setAdmins(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch admins", error);
      toast.error("Could not load admin list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleRoleChange = (email, newRole) => {
    setAdmins((prev) =>
      prev.map((admin) =>
        admin.Email === email ? { ...admin, Role: newRole, changed: true } : admin
      )
    );
  };

  const handleSave = async (email, newRole) => {
    try {
      await axiosApi.put("/admin/update-role", { email, newRole });
      setAdmins((prev) =>
        prev.map((admin) =>
          admin.Email === email ? { ...admin, changed: false } : admin
        )
      );

      const sessionEmail = user?.email && String(user.email).toLowerCase();
      const targetEmail = email && String(email).toLowerCase();
      if (sessionEmail && targetEmail === sessionEmail) {
        toast.success("Your role was updated. Signing you out…");
        setTimeout(() => {
          logout();
          window.location.assign("/");
        }, 600);
        return;
      }

      toast.success("Role updated successfully.");
    } catch (error) {
      console.error("Failed to update role", error);
      toast.error(
        error?.response?.data?.message || "Failed to update role."
      );
    }
  };

  const handleDelete = async (email) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this admin?"
    );
    if (!confirmDelete) return;

    try {
      await axiosApi.delete(`/admins/${email}`);
      setAdmins((prev) => prev.filter((admin) => admin.Email !== email));
      toast.success("Admin removed.");
    } catch (error) {
      console.error("Failed to delete admin", error);
      toast.error("Failed to delete admin.");
    }
  };

  return (
    <DashBoardSidebar>
      <div className="min-h-full flex flex-col">
        <div className="px-8 py-6 bg-gradient-to-r from-[#0d3c44] to-[#145058] text-white rounded-none shadow-lg mb-4">
          <h1 className="text-3xl font-extrabold tracking-wide leading-tight drop-shadow-sm">
            Assign Roles
          </h1>
          <p className="mt-2 text-sm text-white/85 max-w-2xl">
            Update admin roles. Saving applies immediately. If you change your own
            role, you are signed out right away. Other admins are signed out on
            their next authenticated API request.
          </p>
        </div>

        <div className="px-8 pb-8">
          {loading ? (
            <p className="text-center text-gray-500 py-16">Loading admins…</p>
          ) : (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold text-[#0d3c44] uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold text-[#0d3c44] uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold text-[#0d3c44] uppercase tracking-wider"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3 text-center text-xs font-semibold text-[#0d3c44] uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {admins.map((admin) => (
                      <tr
                        key={admin.Email}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {admin.Name}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {admin.Email}
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={admin.Role}
                            onChange={(e) =>
                              handleRoleChange(admin.Email, e.target.value)
                            }
                            className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0d3c44] focus:outline-none focus:ring-2 focus:ring-[#0d3c44]/30"
                          >
                            {Object.values(ROLES).map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSave(admin.Email, admin.Role)}
                              disabled={!admin.changed}
                              className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${
                                admin.changed
                                  ? "bg-[#0d3c44] text-white hover:bg-[#145058]"
                                  : "cursor-not-allowed bg-gray-200 text-gray-500"
                              }`}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(admin.Email)}
                              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {admins.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-12 text-center text-sm text-gray-500"
                        >
                          No admins found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashBoardSidebar>
  );
}
