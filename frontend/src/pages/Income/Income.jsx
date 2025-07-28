import React,{ useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchIncome, getWithDrawHistory, postWithdraw } from "../../slice/income";
import { useArtist } from "../auth/API/ArtistContext";
import axiosApi from "../../conf/axios";


export default function IncomeWithdrawal() {
  const { headers, ophid } = useArtist();
  const [income, setIncome] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // const { income, history, loading, isError, errorMessage } = useSelector((state) => state.income);
  // const dispatch = useDispatch();

  //Fetch income and withdrawal history on component mount
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //        console.log("ophID", ophid);
  //       // await dispatch(fetchIncome(headers));
  //       await dispatch(getWithDrawHistory(headers));
  //     } catch (error) {
  //       console.error("Error fetching income data:", error);
  //       setRequestStatus({
  //         message: error.message || "Failed to fetch income data",
  //         status: "Failed"
  //       });
  //     }
  //   };

  //   fetchData();
  // }, [dispatch, headers]);
 
  

  // const handleWithdraw = async (e) => {
  //   e.preventDefault();

  //   // Validate withdrawal amount
  //   if (!withdrawAmount || withdrawAmount <= 0) {
  //     setRequestStatus({
  //       message: "Please enter a valid withdrawal amount",
  //       status: "Failed"
  //     });
  //     return;
  //   }

  //   // Create the withdrawal data object
  //   const withdrawalData = {
  //     amount: parseFloat(withdrawAmount)
  //   };

  //   // try {
  //   //   const response = await dispatch(postWithdraw({ data: withdrawalData, headers }));

  //   //   if (postWithdraw.fulfilled.match(response)) {
  //   //     setRequestStatus({
  //   //       message: "Withdrawal request successful",
  //   //       status: "Success"
  //   //     });
  //   //     setWithdrawAmount(0);
  //   //     // Refresh data after successful withdrawal
  //   //     await dispatch(fetchIncome(headers));
  //   //     await dispatch(getWithDrawHistory(headers));
  //   //   } else {
  //   //     const errorMessage = response.payload || "Withdrawal failed";
  //   //     setRequestStatus({
  //   //       message: errorMessage,
  //   //       status: "Failed"
  //   //     });
  //   //   }
  //   // } catch (error) {
  //   //   console.error("Withdrawal error:", error);
  //   //   setRequestStatus({
  //   //     message: error.message || "Something went wrong during withdrawal",
  //   //     status: "Failed"
  //   //   });
  //   // }

  //    try {
  //      const response = await axiosApi.post(
  //        "http://localhost:5000/sendWithdraw",
  //        data,
  //        {
  //          headers: headers,
  //        }
  //      );
  //      if (response.status === 201) {
  //        return response.data.data;
  //      }
  //      return rejectWithValue("Withdrawal failed");
  //    } catch (err) {
  //      console.log(err);
  //      return rejectWithValue(
  //        err.response?.data?.message || "Something went wrong"
  //      );
  //    }
  // };

  const submitWithdraw = async (e) => {
    e.preventDefault();
   if (!withdrawAmount || !ophid) return;
     setLoading(true);
    try {
     const payload = {
       withdraw_amount: withdrawAmount,
       ophid,
     };

     console.log("Sending payload:", payload);

     const res = await axiosApi.post(
       "/sendWithdraw",
       payload,
       { headers: { ...headers } }
     );

     if (res.status === 201) {
       setStatus({ type: "success", message: "Withdrawal request submitted" });
       setWithdrawAmount("");
      //  fetchHistory(); // refresh
     } else {
       throw new Error("Withdrawal failed");
     }
    } catch (err) {
      console.error("Post Error:", err);
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Something went wrong",
      });
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!ophid) return; // wait until ophID is available

      try {
        const response = await axiosApi.get(
          `http://localhost:5000/getWithdraw?ophID=${ophid}`
        );

        const withdrawals = response.data.data;
        setHistory(withdrawals);
      } catch (err) {
        console.error("Failed to fetch withdrawal history:", err);
        setRequestStatus({
          message: err.message || "Failed to fetch withdrawal history",
          status: "Failed",
        });
      }
    };

    fetchHistory();
  }, [ophid]);

  
  // useEffect(() => {
  //   if (headers && ophid) {
  //     fetchHistory();
  //   }
  // }, [headers, ophid]);

  // Add a helper function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Add a helper function to get status text
 const getStatusText = (status) => {
   switch (status) {
     case "pending":
       return "Pending";
     case "approved":
       return "Approved";
     case "rejected":
       return "Rejected";
     default:
       return "Unknown";
   }
 };

 const getStatusColor = (status) => {
   switch (status) {
     case "pending":
       return "text-yellow-400";
     case "approved":
       return "text-green-400";
     case "rejected":
       return "text-red-400";
     default:
       return "text-gray-400";
   }
 };

  if (loading) {
    return <div className="min-h-[calc(100vh-70px)] flex items-center justify-center">Loading...</div>;
  }

  // if (isError) {
  //   return (
  //     <div className="min-h-[calc(100vh-70px)] flex items-center justify-center">
  //       <p className="text-red-500">Error: {errorMessage}</p>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-[calc(100vh-70px)] text-gray-100 px-8 py-6">
      <div className="container space-y-6">
        <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
          INCOME
        </h1>

        {/* Available Amount Card */}
        <div className="bg-[#6F4FA0] rounded-lg p-6">
          <div className="space-y-1">
            <p className="text-sm text-purple-200">Available Amount:</p>
            {income ? (
              <p className="text-2xl font-bold">{income.income}</p>
            ) : (
              ""
            )}
          </div>
        </div>

        {/* Bank Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm text-gray-400">Bank Name:</label>
              {income && income.bank_name ? (
                <p className="text-cyan-300">{income.bank_name}</p>
              ) : (
                <p>Not Available</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm text-gray-400">
                Bank Account Holder:
              </label>
              {income && income.bank_acc_name ? (
                <p className="text-cyan-300">{income.bank_acc_name}</p>
              ) : (
                <p>Not Available</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm text-gray-400">
                Bank Account Number:
              </label>
              {income && income.masked_acc_number ? (
                <p className="text-cyan-300">{income.masked_acc_number}</p>
              ) : (
                <p>Not Available</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm text-gray-400">Bank IFSC Code:</label>
              {income && income.bank_ifsc_code ? (
                <p className="text-cyan-300">{income.bank_ifsc_code}</p>
              ) : (
                <p>Not Available</p>
              )}
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <form onSubmit={submitWithdraw} className="max-w-2xl space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">
                Withdraw Amount: <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <button
              type="submit"
              className="self-end px-6 py-3 bg-cyan-400 text-gray-900 rounded-lg font-medium hover:bg-cyan-300 transition-colors"
            >
              Withdraw
            </button>
          </div>
        </form>

        {/* Withdrawal History Section */}
        <div className="space-y-4">
          <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
            WITHDRAWAL HISTORY
          </h1>
          {history && history.length > 0 ? (
            <div className="space-y-2">
              {history.map((withdrawals) => (
                <div
                  key={`${withdrawals.created_at}-${withdrawals.withdraw_amount}`}
                  className="bg-gray-800/50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-300">
                        Amount: ₹{withdrawals.withdraw_amount}
                      </p>
                      <p className="text-sm text-gray-400">
                        Date: {formatDate(withdrawals.created_at)}
                      </p>
                    </div>
                    <span className={`${getStatusColor(withdrawals.status)}`}>
                      {getStatusText(withdrawals.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No withdrawal history found</p>
          )}
        </div>
      </div>
    </div>
  );
}
