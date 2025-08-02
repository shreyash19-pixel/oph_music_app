import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosApi from "../../../../conf/axios"; // Update the path as per your structure

const Withdraw = () => {
  const { ophid } = useParams();
  const [withdrawData, setWithdrawData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosApi.get(`/getWithdraw?ophID=${ophid}`);
        setWithdrawData(res.data.data);
        console.log("Withdraw Data:", res.data.data);
      } catch (err) {
        console.error("Failed to fetch withdraw data:", err);
      }
    };

    if (ophid) {
      fetchData();
    }
  }, [ophid]);

  return (
    <div className="text-white p-4">
      <h2 className="text-xl font-semibold mb-4">Withdrawal Details</h2>
      {withdrawData ? (
        <pre>{JSON.stringify(withdrawData, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Withdraw;
