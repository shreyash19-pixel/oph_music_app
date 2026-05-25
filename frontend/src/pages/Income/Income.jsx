import React, { useState, useEffect, useCallback } from "react";
import { useArtist } from "../auth/API/ArtistContext";
import axiosApi from "../../conf/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import NavbarRight from "../../components/Navbar/NavbarRight";

export default function IncomeWithdrawal() {
  const { headers, ophid } = useArtist();
  const [income, setIncome] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [incomeStatus, setIncomeStatus] = useState("locked");

  const navigate = useNavigate();

  const fetchIncome = useCallback(async () => {
    if (!ophid) return;

    try {
      setLoading(true);
      const response = await axiosApi.get(`/get_income/${ophid}`);

      if (response.data?.success && response.data.data?.length > 0) {
        const incomeData = response.data.data[0];
        setIncome({
          income: parseFloat(incomeData.total_revenue || 0),
          total_song_count: incomeData.total_song_count || 0,
          total_youtube_revenue: parseFloat(
            incomeData.total_youtube_revenue || 0,
          ),
          total_audio_revenue: parseFloat(incomeData.total_audio_revenue || 0),
          total_events_revenue: parseFloat(
            incomeData.total_events_revenue || 0,
          ),
        });
      } else {
        setIncome({
          income: 0,
          total_song_count: 0,
          total_youtube_revenue: 0,
          total_audio_revenue: 0,
          total_events_revenue: 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch income:", err);
      toast.error("Failed to fetch income data");
      setIncome({
        income: 0,
        total_song_count: 0,
        total_youtube_revenue: 0,
        total_audio_revenue: 0,
        total_events_revenue: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [ophid]);

  const fetchBankDetails = useCallback(async () => {
    if (!ophid) return;

    try {
      const response = await axiosApi.get(
        `/auth/documentation-details?ophid=${ophid}`,
        { headers },
      );

      if (response.data?.success && response.data.data?.length > 0) {
        const bankData = response.data.data[0];
        setIncome((prev) => ({
          ...prev,
          bank_name: bankData.BankName || null,
          account_holder_name: bankData.AccountHolderName || null,
          account_number: bankData.AccountNumber || null,
          ifsc_code: bankData.IFSCCode || null,
          agreement_accepted: bankData.AgreementAccepted || null,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch bank details:", err);
    }
  }, [ophid, headers]);

  useEffect(() => {
    const fetchData = async () => {
      if (!ophid) return;

      try {
        setLoading(true);

        // ✅ STEP 1: Check if ophid contains SA
        if (ophid.includes("SA")) {
          const statusResponse = await axiosApi.get(
            `/get-special-artists-income-status?ophid=${ophid}`,
            { headers },
          );

          if (
            statusResponse.data?.success &&
            statusResponse.data.data?.length > 0
          ) {
            const statusData = statusResponse.data.data[0];
            setIncomeStatus(statusData);

            // ✅ STEP 2: If locked → STOP everything
            if (statusData.status === "locked") {
              setLoading(false);
              return; // ⛔ Exit early
            }
          }
        }

        // ✅ STEP 3: Fetch income
        await fetchIncome();

        // ✅ STEP 4: Fetch bank details
        await fetchBankDetails();

        // ✅ STEP 5: Fetch withdrawal history
        const response = await axiosApi.get(`/getWithdraw?ophID=${ophid}`);
        const withdrawals = response.data.data || [];
        setHistory(withdrawals);

        const blockedTotal = withdrawals
          .filter((w) => w.status === "pending" || w.status === "approved")
          .reduce((sum, w) => sum + parseFloat(w.withdraw_amount), 0);

        setIncome((prev) => ({
          ...prev,
          availableAmount: (parseFloat(prev?.income) || 0) - blockedTotal,
        }));
      } catch (err) {
        console.error("Failed to fetch data:", err);
        toast.error(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ophid, fetchIncome, fetchBankDetails, headers]);

  const submitWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || !ophid) return;

    const withdrawAmountNum = parseFloat(withdrawAmount);
    const availableIncome = income?.availableAmount ?? income?.income ?? 0;

    if (withdrawAmountNum <= 0) {
      toast.error("Withdrawal amount must be greater than 0");
      return;
    }

    if (withdrawAmountNum > availableIncome) {
      toast.error(
        `Withdrawal amount cannot exceed available income of ₹${availableIncome.toFixed(
          2,
        )}`,
      );
      return;
    }

    try {
      const withdrawal_id = Math.floor(1000 + Math.random() * 9000).toString();
      const payload = {
        withdraw_amount: withdrawAmountNum,
        ophID: ophid,
        withdrawal_id,
      };

      const res = await axiosApi.post("/sendWithdraw", payload, { headers });

      if (res.status === 201) {
        toast.success("Withdrawal request submitted successfully");
        setWithdrawAmount("");
        await fetchIncome();
      } else {
        throw new Error("Withdrawal failed");
      }
    } catch (err) {
      console.error("Post Error:", err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const handleIncomeRequest = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await axiosApi.post(
        "/set-special-artists-income-status",
        { ophid: ophid, status: "requested" },
        {
          headers: {
            ...headers,
          },
        },
      );

      if (response.data.success) {
        console.log(response.data.data);

        navigate("/dashboard/pending", {
          state: {
            heading: "Your request is under review",
            btnText: "Back to Home",
            redirectTo: "/dashboard",
          },
        });
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (
    incomeStatus?.status === "locked" ||
    incomeStatus?.status === "requested"
  ) {
    console.log("eerre");

    return (
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white">
          {incomeStatus?.status === "locked" ? (
            <p className="text-lg font-semibold">
              Income is locked. Request to unlock
            </p>
          ) : (
            <p className="text-lg font-semibold">
              your request is under review
            </p>
          )}

          {incomeStatus?.status === "locked" && (
            <button
              onClick={handleIncomeRequest}
              className="bg-white text-[#6F4FA0] px-6 py-2 rounded-lg font-medium hover:opacity-90 transition"
            >
              Request to Unlock
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-70px)] text-gray-100 px-8 py-6">
      <div className="container space-y-6">
        <div className="flex justify-between items-center  mb-8">
          <h2 className="text-[#5DC9DE] text-2xl sm:text-3xl font-bold uppercase drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
            INCOME
          </h2>
          <NavbarRight />
        </div>

        {/* Available Amount Card */}
        <div className="bg-[#6F4FA0] rounded-lg p-6">
          <div className="space-y-1">
            <p className="text-sm text-purple-200">Available Amount:</p>
            <p className="text-2xl font-bold">
              ₹
              {income
                ? parseFloat(income.availableAmount ?? income.income).toFixed(2)
                : "0.00"}
            </p>
          </div>
          {income && (
            <div className="mt-4 text-sm text-purple-200 space-y-1">
              <p>Total Songs: {income.total_song_count}</p>
              <p>
                YouTube Revenue: ₹
                {parseFloat(income.total_youtube_revenue).toFixed(2)}
              </p>
              <p>
                Audio Revenue: ₹
                {parseFloat(income.total_audio_revenue).toFixed(2)}
              </p>
              {(income.total_events_revenue ?? 0) > 0 && (
                <p>
                  Event Winnings: ₹
                  {parseFloat(income.total_events_revenue).toFixed(2)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bank Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-cyan-400">Bank Details</h3>
          <div className="flex gap-2">
            <label className="text-sm text-gray-400">Bank Name:</label>
            <p
              className={income?.bank_name ? "text-cyan-300" : "text-gray-500"}
            >
              {income?.bank_name || "Not Available"}
            </p>
          </div>
          <div className="flex gap-2">
            <label className="text-sm text-gray-400">Account Holder:</label>
            <p
              className={
                income?.account_holder_name ? "text-cyan-300" : "text-gray-500"
              }
            >
              {income?.account_holder_name || "Not Available"}
            </p>
          </div>
          <div className="flex gap-2">
            <label className="text-sm text-gray-400">Account Number:</label>
            <p
              className={
                income?.account_number ? "text-cyan-300" : "text-gray-500"
              }
            >
              {income?.account_number || "Not Available"}
            </p>
          </div>
          <div className="flex gap-2">
            <label className="text-sm text-gray-400">IFSC Code:</label>
            <p
              className={income?.ifsc_code ? "text-cyan-300" : "text-gray-500"}
            >
              {income?.ifsc_code || "Not Available"}
            </p>
          </div>
        </div>

        {/* Withdrawal Form */}
        <form onSubmit={submitWithdraw} className="max-w-2xl space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">
                Withdraw Amount: <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={income?.availableAmount}
                  className={`w-full bg-gray-800/50 border rounded-full p-3 focus:outline-none ${
                    withdrawAmount &&
                    income &&
                    parseFloat(withdrawAmount) >
                      (income.availableAmount ?? income.income)
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-700 focus:border-cyan-400"
                  }`}
                  required
                />
                {withdrawAmount &&
                  income &&
                  parseFloat(withdrawAmount) >
                    (income.availableAmount ?? income.income) && (
                    <p className="absolute -bottom-6 left-0 text-red-400 text-sm">
                      Amount cannot exceed available income of ₹
                      {parseFloat(
                        income.availableAmount ?? income.income,
                      ).toFixed(2)}
                    </p>
                  )}
              </div>
            </div>
            <button
              type="submit"
              disabled={
                withdrawAmount &&
                income &&
                parseFloat(withdrawAmount) >
                  (income.availableAmount ?? income.income)
              }
              className={`self-end px-6 py-3 rounded-lg font-medium transition-colors ${
                withdrawAmount &&
                income &&
                parseFloat(withdrawAmount) >
                  (income.availableAmount ?? income.income)
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-cyan-400 text-gray-900 hover:bg-cyan-300"
              }`}
            >
              Withdraw
            </button>
          </div>
        </form>

        {/* Withdrawal History */}
        <div className="space-y-4">
          <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
            WITHDRAWAL HISTORY
          </h1>
          {history && history.length > 0 ? (
            <div className="space-y-2">
              {history
                .filter((w) => w.withdraw_amount != null)
                .map((w) => (
                  <div
                    key={`${w.created_at}-${w.withdraw_amount}`}
                    className="bg-gray-800/50 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-gray-300">
                        Amount: ₹{w.withdraw_amount}
                      </p>
                      {w.reason && (
                        <p className="text-gray-300">Reason: {w.reason}</p>
                      )}
                      <p className="text-sm text-gray-400">
                        Date: {formatDate(w.created_at)}
                      </p>
                    </div>
                    <span className={getStatusColor(w.status)}>
                      {getStatusText(w.status)}
                    </span>
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
