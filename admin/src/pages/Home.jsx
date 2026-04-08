import React, { useEffect, useState } from "react";
import SearchableDynamicTable from "../components/SearchableDynamicTable";
import DashBoardSidebar from "../components/DashBoardSidebar";
import axiosApi from "../conf/axios";

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
  "signup_transaction_id",
  "signup_payment_reject_reason",
  "signup_payment_updated_at",
  "signup_payment_created_at",
];

const NewSignup = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosApi.get("/newsignup/unified");
        setTableData(res.data.userDetails || []);
      } catch (e) {
        console.error("Error fetching new signup list:", e);
        setTableData([]);
      }
    };

    fetchData();
  }, []);

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
            leadColumns={[
              "oph_id",
              "OPH_ID",
              "signup_payment_status",
            ]}
          />
        </div>
      </DashBoardSidebar>
    </div>
  );
};

export default NewSignup;
