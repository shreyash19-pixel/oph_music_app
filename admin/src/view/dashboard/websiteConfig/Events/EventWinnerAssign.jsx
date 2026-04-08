import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosApi from '../../../../conf/axios';
import WebConfigSidebar from "../../../../components/WebConfigSidebar";
import toast from 'react-hot-toast';
import { useAuth } from "../../../../auth/AuthProvider";
import { ROLES } from "../../../../utils/roles";

const EventWinnerAssign = () => {
  const { user, loading: authLoading } = useAuth();
  const { event_id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [artists, setArtists] = useState([]);
  const [selectedOphId, setSelectedOphId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (user?.role === ROLES.PROJECT_MEMBER) {
      setLoading(false);
      toast.error("You do not have permission to assign winners");
      navigate("/event-winning", { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (authLoading || user?.role === ROLES.PROJECT_MEMBER) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch event details and all artists in parallel
        const [eventRes, artistsRes] = await Promise.all([
          axiosApi.get(`/event-participants/${event_id}`),
          axiosApi.get('/all-artists-dropdown')
        ]);
        setEvent(eventRes.data.data.event);
        setArtists(artistsRes.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [event_id, authLoading, user?.role]);

  const handleSubmit = async () => {
    if (!selectedOphId) {
      toast.error('Please select a winner');
      return;
    }

    try {
      setSubmitting(true);
      await axiosApi.post('/assign-winner', {
        event_id: parseInt(event_id),
        winner_oph_id: selectedOphId
      });

      toast.success(`Winner assigned successfully! Prize: ₹${event?.winnerReward || 0}`);
      navigate('/event-winning');
    } catch (error) {
      console.error('Error assigning winner:', error);
      toast.error(error.response?.data?.message || 'Failed to assign winner');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedArtist = artists.find(a => a.oph_id === selectedOphId);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <WebConfigSidebar />
        <div className="flex-1 ml-0 overflow-auto flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <WebConfigSidebar />
        <div className="flex-1 ml-0 overflow-auto flex items-center justify-center">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <WebConfigSidebar />
      <div className="flex-1 ml-0 overflow-auto">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-[#0d3c44] to-[#145058] text-white rounded-none shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-wide leading-tight drop-shadow-sm">
                Assign Winner
              </h2>
              <p className="text-sm text-gray-200 mt-1">{event?.EventName || 'Event'}</p>
            </div>
            <button
              onClick={() => navigate('/event-winning')}
              className="px-4 py-2 bg-white text-[#0d3c44] rounded-lg hover:bg-gray-100 transition"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Event Info */}
        <div className="px-8 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">Event Name</div>
                <div className="font-medium">{event?.EventName || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Date</div>
                <div className="font-medium">
                  {event?.dateTime ? new Date(event.dateTime).toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Location</div>
                <div className="font-medium">{event?.location || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Default Prize</div>
                <div className="font-medium text-green-600">₹{event?.winnerReward || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Winner Selection */}
        <div className="px-8 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Winner</h3>
            
            <div className="space-y-4">
              {/* Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artist (OPH ID - Name)
                </label>
                <select
                  value={selectedOphId}
                  onChange={(e) => setSelectedOphId(e.target.value)}
                  className="w-full md:w-96 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d3c44] focus:border-[#0d3c44] outline-none"
                >
                  <option value="">-- Select Artist --</option>
                  {artists.map((artist) => (
                    <option key={artist.oph_id} value={artist.oph_id}>
                      {artist.oph_id} - {artist.stage_name || artist.full_name || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Artist Info */}
              {selectedArtist && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-gray-600">Selected Winner:</div>
                  <div className="font-semibold text-gray-900">
                    {selectedArtist.stage_name || selectedArtist.full_name}
                  </div>
                  <div className="text-sm text-gray-500">{selectedArtist.oph_id}</div>
                  <div className="mt-2 text-sm">
                    Prize Amount: <span className="font-semibold text-green-600">₹{event?.winnerReward || 0}</span>
                  </div>
                </div>
              )}

              {/* Approve Button */}
              <div className="pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOphId || submitting}
                  className={`px-8 py-3 font-medium rounded-lg transition ${
                    !selectedOphId || submitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {submitting ? 'Approving...' : 'Approve Winner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventWinnerAssign;
