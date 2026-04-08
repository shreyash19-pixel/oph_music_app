import React, { useEffect, useState } from "react";
import SearchableDynamicTable from "../components/SearchableDynamicTable";
import DashBoardSidebar from "../components/DashBoardSidebar";
import axiosApi from "../conf/axios";
import { useAuth } from "../auth/AuthProvider";
import { ROLES } from "../utils/roles";

const signupExcludeColumns = [
  "createdAt",
  "updatedAt",
  "user_pass",
  "step_status",
  "reject_reason",
  "personal_photo",
  "location",
  "current_step",
  "rejected_step",
  "traffic",
  "form_fill_count",
];

const NewSignup = () => {
  const { user } = useAuth();
  const [tableData, setTableData] = useState([]);
  const [rejectedData, setRejectedData] = useState([]);

  /** Administrative head: under-review table only (no rejected list). Rejected payments: sales head + super admin. */
  const showRejectedSignupPayments =
    user?.role === ROLES.SALES_HEAD || user?.role === ROLES.SUPER_ADMIN;

  useEffect(() => {
    const fetchData = async () => {
      const res = await axiosApi.get("/newsignup");
      setTableData(res.data.userDetails || []);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!showRejectedSignupPayments) {
      setRejectedData([]);
      return;
    }

    const fetchRejected = async () => {
      try {
        const res = await axiosApi.get("/newsignup/rejected-signup-payments");
        setRejectedData(res.data.userDetails || []);
      } catch (e) {
        setRejectedData([]);
      }
    };

    fetchRejected();
  }, [showRejectedSignupPayments]);

  return (
    <div>
      <DashBoardSidebar>
        <div className="space-y-10">
          <SearchableDynamicTable
            title="New SignUp"
            data={tableData}
            showStatusIndicator={false}
            excludeColumns={signupExcludeColumns}
            pageSize={8}
            detailsUrl="/newsignup"
          />
          {showRejectedSignupPayments && (
            <SearchableDynamicTable
              title="Rejected signup payments"
              data={rejectedData}
              showStatusIndicator={false}
              excludeColumns={signupExcludeColumns}
              pageSize={8}
              detailsUrl="/newsignup"
            />
          )}
        </div>
      </DashBoardSidebar>
    </div>
  );
};

export default NewSignup;
