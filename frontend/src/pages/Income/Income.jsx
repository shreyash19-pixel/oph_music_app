import React from "react";
import { useState, useEffect, useCallback } from "react";
import { useArtist } from "../auth/API/ArtistContext";
import axiosApi from "../../conf/axios";
import { toast } from "react-toastify";


export default function IncomeWithdrawal() {
  const { headers, ophid } = useArtist();
  const [income, setIncome] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch income data using the /get_income/:ophid route
  const fetchIncome = useCallback(async () => {
    if (!ophid) return;
    
    try {
      setLoading(true);
      const response = await axiosApi.get(`/get_income/${ophid}`);
      
      if (response.data && response.data.success && response.data.data) {
        const incomeData = response.data.data[0]; // Get first result from array
        // Use total_revenue as the income value
        setIncome({
          income: incomeData.total_revenue,
          // Additional data from the API response
          distinct_song_count: incomeData.distinct_song_count,
          total_song_count: incomeData.total_song_count,
          total_youtube_revenue: incomeData.total_youtube_revenue,
          total_audio_revenue: incomeData.total_audio_revenue
        });
      }
    } catch (err) {
      console.error("Failed to fetch income:", err);
      toast.error("Failed to fetch income data");
    } finally {
      setLoading(false);
    }
  }, [ophid]);

  // Fetch bank details using the /auth/documentation-details route
  const fetchBankDetails = useCallback(async () => {
    if (!ophid) return;
    
    try {
      const response = await axiosApi.get(`/auth/documentation-details?ophid=${ophid}`, {
        headers: { ...headers }
      });
      
      if (response.data && response.data.success && response.data.data) {
        const bankData = response.data.data[0]; // Get first result from array
        // Update income state with bank details
        setIncome(prevIncome => ({
          ...prevIncome,
          bank_name: bankData.BankName || null,
          account_holder_name: bankData.AccountHolderName || null,
          account_number: bankData.AccountNumber || null,
          ifsc_code: bankData.IFSCCode || null,
          agreement_accepted: bankData.AgreementAccepted || null
        }));
      }
    } catch (err) {
      console.error("Failed to fetch bank details:", err);
      // Don't show error toast for bank details as it's not critical
    }
  }, [ophid, headers]);

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
    try {
     const payload = {
       withdraw_amount: withdrawAmount,
       ophID: ophid,
     };

     console.log("Sending payload:", payload);

     const res = await axiosApi.post(
       "/sendWithdraw",
       payload,
       { headers: { ...headers } }
     );

      if (res.status === 201) {
        toast.success("Withdrawal request submitted successfully");
        setWithdrawAmount("");
        // Refresh income data after successful withdrawal
        await fetchIncome();
     } else {
       throw new Error("Withdrawal failed");
     }
    } catch (err) {
      console.error("Post Error:", err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!ophid) return; // wait until ophID is available

      try {
        setLoading(true);
        
        // Fetch income data
        await fetchIncome();
        
        // Fetch bank details
        await fetchBankDetails();
        
        // Fetch withdrawal history
        const response = await axiosApi.get(
          `/getWithdraw?ophID=${ophid}`
        );

        const withdrawals = response.data.data;
        setHistory(withdrawals);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        toast.error(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ophid, fetchIncome, fetchBankDetails]);

  
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
              <p className="text-2xl font-bold">${parseFloat(income.income).toFixed(2)}</p>
            ) : (
              <p className="text-2xl font-bold">$0.00</p>
            )}
          </div>
          {income && (
            <div className="mt-4 text-sm text-purple-200">
              <p>Total Songs: {income.total_song_count}</p>
              <p>YouTube Revenue: ${parseFloat(income.total_youtube_revenue).toFixed(2)}</p>
              <p>Audio Revenue: ${parseFloat(income.total_audio_revenue).toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Bank Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-cyan-400">Bank Details</h3>
          
          <div className="space-y-2">
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm text-gray-400">Bank Name:</label>
              {income && income.bank_name ? (
                <p className="text-cyan-300">{income.bank_name}</p>
              ) : (
                <p className="text-gray-500">Not Available</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm text-gray-400">
                Account Holder:
              </label>
              {income && income.account_holder_name ? (
                <p className="text-cyan-300">{income.account_holder_name}</p>
              ) : (
                <p className="text-gray-500">Not Available</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm text-gray-400">
                Account Number:
              </label>
              {income && income.account_number ? (
                <p className="text-cyan-300">{income.account_number}</p>
              ) : (
                <p className="text-gray-500">Not Available</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm text-gray-400">IFSC Code:</label>
              {income && income.ifsc_code ? (
                <p className="text-cyan-300">{income.ifsc_code}</p>
              ) : (
                <p className="text-gray-500">Not Available</p>
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
                  {/* <p className="text-xs text-gray-400">
                    Withdrawal No: {randomWithdrawNumber}
                  </p> */}
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
