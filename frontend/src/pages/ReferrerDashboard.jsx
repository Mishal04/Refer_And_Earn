import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import DisclaimerBox from "../components/DisclaimerBox";

const ReferrerDashboard = () => {
  const { user, logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  const [leadData, setLeadData] = useState({
    clientName: "",
    clientContact: "",
    projectDetails: "",
    source: "",
  });

  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    method: "easypaisa",
    accountInfo: "",
  });

  const [message, setMessage] = useState("");

  const fetchLeads = async () => {
    try {
      const res = await api.get("/leads/mine");
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/leads", leadData);
      setMessage("Lead submitted successfully!");
      setLeadData({ clientName: "", clientContact: "", projectDetails: "", source: "" });
      setShowLeadForm(false);
      fetchLeads();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit lead");
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/withdrawals", withdrawData);
      setMessage("Withdrawal requested successfully!");
      setWithdrawData({ amount: "", method: "easypaisa", accountInfo: "" });
      setShowWithdrawForm(false);
      window.location.reload();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to request withdrawal");
    }
  };

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-blue-100 text-blue-800",
    approved: "bg-indigo-100 text-indigo-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">Apexora Referrals</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hi, {user?.name}</span>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {message && (
          <div className="bg-blue-100 text-blue-800 p-3 rounded-lg mb-4 text-sm">
            {message}
          </div>
        )}

        {/* Payment & Referral Disclaimers */}
        <DisclaimerBox />

        {/* Referral Link Card */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-2">Your Referral Link</h2>
          <div className="flex gap-2">
            <input
              readOnly
              value={referralLink}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                setMessage("Link copied!");
              }}
              className="bg-blue-600 text-white px-4 rounded-lg text-sm"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Code: <span className="font-mono">{user?.referralCode}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowLeadForm(!showLeadForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {showLeadForm ? "Cancel" : "+ Submit New Lead"}
          </button>
          <button
            onClick={() => setShowWithdrawForm(!showWithdrawForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {showWithdrawForm ? "Cancel" : "Request Withdrawal"}
          </button>
        </div>

        {/* Lead Form */}
        {showLeadForm && (
          <form
            onSubmit={handleLeadSubmit}
            className="bg-white rounded-xl shadow-sm p-5 mb-6 space-y-3"
          >
            <h3 className="font-semibold text-gray-700">Submit New Lead</h3>
            <input
              placeholder="Client Name"
              required
              value={leadData.clientName}
              onChange={(e) => setLeadData({ ...leadData, clientName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Client Contact"
              required
              value={leadData.clientContact}
              onChange={(e) => setLeadData({ ...leadData, clientContact: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Project Details"
              required
              value={leadData.projectDetails}
              onChange={(e) => setLeadData({ ...leadData, projectDetails: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows={3}
            />
            <input
              placeholder="Source (e.g. whatsapp, instagram)"
              value={leadData.source}
              onChange={(e) => setLeadData({ ...leadData, source: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Submit Lead
            </button>
          </form>
        )}

        {/* Withdraw Form */}
        {showWithdrawForm && (
          <form
            onSubmit={handleWithdrawSubmit}
            className="bg-white rounded-xl shadow-sm p-5 mb-6 space-y-3"
          >
            <h3 className="font-semibold text-gray-700">Request Withdrawal</h3>
            <input
              type="number"
              placeholder="Amount"
              required
              value={withdrawData.amount}
              onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <select
              value={withdrawData.method}
              onChange={(e) => setWithdrawData({ ...withdrawData, method: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="easypaisa">Easypaisa</option>
              <option value="jazzcash">JazzCash</option>
              <option value="bank">Bank Transfer</option>
            </select>
            <input
              placeholder="Account Info (number/IBAN)"
              required
              value={withdrawData.accountInfo}
              onChange={(e) => setWithdrawData({ ...withdrawData, accountInfo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Request Withdrawal
            </button>
          </form>
        )}

        {/* Leads List */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Your Leads</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : leads.length === 0 ? (
            <p className="text-sm text-gray-500">No leads submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead._id}
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-800">{lead.clientName}</p>
                    <p className="text-sm text-gray-500">{lead.projectDetails}</p>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferrerDashboard;
