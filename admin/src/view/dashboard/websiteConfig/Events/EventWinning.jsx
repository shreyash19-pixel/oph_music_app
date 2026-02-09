import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosApi from '../../../../conf/axios';
import WebConfigSidebar from "../../../../components/WebConfigSidebar";

const EventWinning = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await axiosApi.get("/events-with-winners");
        setEvents(res.data.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (event_id) => {
    navigate(`/event-winner-assign/${event_id}`);
  };

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
          <h2 className="text-3xl font-extrabold tracking-wide leading-tight drop-shadow-sm">
            Event Winning
          </h2>
          <p className="text-sm text-gray-200 mt-1">Select an event to assign a winner</p>
        </div>

        {/* Statistics */}
        <div className="px-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-sm text-gray-600">Total Events</div>
              <div className="text-2xl font-bold text-gray-900">{events.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-sm text-gray-600">Winners Assigned</div>
              <div className="text-2xl font-bold text-green-600">
                {events.filter(e => e.winner_oph_id).length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-sm text-gray-600">Pending Winners</div>
              <div className="text-2xl font-bold text-orange-600">
                {events.filter(e => !e.winner_oph_id).length}
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="px-8">
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prize</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.event_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {event.image && (
                            <img 
                              src={event.image} 
                              alt={event.EventName}
                              className="h-10 w-10 rounded-full object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{event.EventName}</div>
                            <div className="text-sm text-gray-500">ID: {event.event_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.dateTime ? new Date(event.dateTime).toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.location || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        ₹{event.winnerReward || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.winner_oph_id ? (
                          <div>
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              {event.winner_name || event.winner_oph_id}
                            </span>
                            <div className="text-xs text-gray-400 mt-1">
                              ₹{event.prize_amount}
                            </div>
                          </div>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            Not Assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEventClick(event.event_id)}
                          disabled={!!event.winner_oph_id}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                            event.winner_oph_id
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-[#0d3c44] text-white hover:bg-[#0b3239]'
                          }`}
                        >
                          {event.winner_oph_id ? 'Assigned' : 'Assign Winner'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventWinning;
