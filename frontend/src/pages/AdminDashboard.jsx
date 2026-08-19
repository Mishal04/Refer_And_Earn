import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("leads");
  const [leads, setLeads] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [topReferrers, setTopReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [leadsRes, withdrawalsRes, summaryRes, topRes] = await Promise.all([
        api.get("/leads"),
        api.get("/withdrawals"),
        api.get("/analytics/summary"),
        api.get("/analytics/top-referrers"),
      ]);
      setLeads(leadsRes.data);
      setWithdrawals(withdrawalsRes.data);
      setSummary(summaryRes.data);
      setTopReferrers(topRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const updateLeadStatus = async (leadId, status, currentValue) => {
    let projectValue = currentValue;
    if (status === "completed" && !currentValue) {
      const input = prompt("Enter project value (Rs.):");
      if (!input) return;
      projectValue = Number(input);
    }
    try {
      await api.put(`/leads/${leadId}`, { status, projectValue });
      setMessage("Lead updated!");
      fetchAll();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update lead");
    }
  };

  const updateWithdrawalStatus = async (id, status) => {
    try {
      await api.put(`/withdrawals/${id}`, { status });
      setMessage("Withdrawal updated!");
      fetchAll();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update withdrawal");
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-blue-100 text-blue-800",
    approved: "bg-indigo-100 text-indigo-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    requested: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">Refer & Earn — Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hi, {user?.name}</span>
          <button onClick={logout} className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {message && (
          <div className="bg-blue-100 text-blue-800 p-3 rounded-lg mb-4 text-sm">{message}</div>
        )}

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-500">Total Leads</p>
              <p className="text-xl font-bold text-gray-800">{summary.totalLeads}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-gray-800">Rs. {summary.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-500">Commissions Paid</p>
              <p className="text-xl font-bold text-gray-800">Rs. {summary.totalCommissionsPaid.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-500">Conversion Rate</p>
              <p className="text-xl font-bold text-gray-800">{summary.conversionRate}%</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["leads", "withdrawals", "leaderboard"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                tab === t ? "bg-blue-600 text-white" : "bg-white text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <>
            {tab === "leads" && (
              <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
                {leads.length === 0 ? (
                  <p className="text-sm text-gray-500">No leads yet.</p>
                ) : (
                  leads.map((lead) => (
                    <div key={lead._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-800">{lead.clientName}</p>
                          <p className="text-sm text-gray-500">{lead.projectDetails}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            By: {lead.referredBy?.name} ({lead.referredBy?.email})
                          </p>
                          {lead.projectValue > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              Value: Rs. {lead.projectValue.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${
                            statusColors[lead.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </div>
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead._id, e.target.value, lead.projectValue)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm mt-2"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="approved">Approved</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "withdrawals" && (
              <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
                {withdrawals.length === 0 ? (
                  <p className="text-sm text-gray-500">No withdrawal requests.</p>
                ) : (
                  withdrawals.map((w) => (
                    <div key={w._id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">
                          {w.user?.name} — Rs. {w.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {w.method} — {w.accountInfo}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[w.status]}`}>
                          {w.status}
                        </span>
                        {w.status === "requested" && (
                          <>
                            <button
                              onClick={() => updateWithdrawalStatus(w._id, "approved")}
                              className="bg-green-600 text-white text-xs px-3 py-1 rounded-lg"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateWithdrawalStatus(w._id, "rejected")}
                              className="bg-red-600 text-white text-xs px-3 py-1 rounded-lg"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {w.status === "approved" && (
                          <button
                            onClick={() => updateWithdrawalStatus(w._id, "paid")}
                            className="bg-blue-600 text-white text-xs px-3 py-1 rounded-lg"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "leaderboard" && (
              <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
                {topReferrers.length === 0 ? (
                  <p className="text-sm text-gray-500">No commissions earned yet.</p>
                ) : (
                  topReferrers.map((r, i) => (
                    <div key={r.userId} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">#{i + 1}</span>
                        <div>
                          <p className="font-medium text-gray-800">{r.name}</p>
                          <p className="text-sm text-gray-500">{r.email}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-green-700">Rs. {r.totalEarned.toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
