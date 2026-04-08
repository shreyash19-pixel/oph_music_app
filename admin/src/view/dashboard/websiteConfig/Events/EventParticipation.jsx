import React,{useState,useEffect} from 'react'
import axiosApi from '../../../../conf/axios';
import SearchableDynamicTable from '../../../../components/SearchableDynamicTable';
import WebConfigSidebar from "../../../../components/WebConfigSidebar";


const EventParticipation = () => {
   const [events, setEvents] = useState([]);
   const [selectedEvent, setSelectedEvent] = useState('');
   const [filteredData, setFilteredData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [enrichedData, setEnrichedData] = useState([]);
   const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch events first
        const eventsRes = await axiosApi.get("/events");
        const eventsData = eventsRes.data.data || [];
        console.log(eventsData);
        setEvents(eventsData);
        
        // Fetch all participants
        const participantsRes = await axiosApi.get("/getParticipant");
        const participantsData = participantsRes.data.data || [];
        
        // Enrich participant data with event information
        // participant_display = oph_id for internal, full name for external (from backend)
        const enriched = participantsData.map(participant => {
          const event = eventsData.find(e => e.event_id === participant.event_id);
          return {
            ...participant,
            Participant: participant.participant_display ?? participant.oph_id ?? '—',
            eventName: event ? event.EventName : 'Unknown Event',
            eventLocation: event ? event.location : 'Unknown Location',
            eventDateTime: event ? event.dateTime : 'Unknown Date',
            registrationFee: event ? event.registrationFee_normal : 'N/A',
            winnerReward: event ? event.winnerReward : 'N/A'
          };
        });
        
        setEnrichedData(enriched);
        setFilteredData(enriched);
        
        console.log('Events:', eventsData);
        console.log('Participants:', participantsData);
        console.log('Enriched Data:', enriched);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter participants based on selected event
  useEffect(() => {
    if (!selectedEvent) {
      setFilteredData(enrichedData);
    } else {
      const filtered = enrichedData.filter(participant => 
        participant.event_id === parseInt(selectedEvent)
      );
      setFilteredData(filtered);
    }
  }, [selectedEvent, enrichedData]);

  const handleEventChange = (event) => {
    setSelectedEvent(event.target.value);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <WebConfigSidebar />
        <div className="flex-1 ml-10 overflow-auto flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <WebConfigSidebar />
        <div className="flex-1 ml-10 overflow-auto flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <WebConfigSidebar />
      <div className="flex-1 ml-10 overflow-auto">
        {/* Event Filter Dropdown */}
        <div className="px-8 py-6 bg-gradient-to-r from-[#0d3c44] to-[#145058] text-white rounded-none shadow-lg mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-extrabold tracking-wide leading-tight drop-shadow-sm">
              Event Participation
            </h2>
            <div className="flex items-center space-x-4">
              <label htmlFor="eventFilter" className="text-sm font-medium text-white">
                Filter by Event:
              </label>
              <select
                id="eventFilter"
                value={selectedEvent}
                onChange={handleEventChange}
                className="px-4 py-2 bg-white text-gray-800 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#145058] shadow-sm"
              >
                <option value="">All Events</option>
                {events.map((event) => (
                  <option key={event.event_id} value={event.event_id}>
                    {event.EventName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {selectedEvent && (
          <div className="px-8 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                Showing participants for: <span className="font-semibold">
                  {events.find(e => e.event_id === parseInt(selectedEvent))?.EventName}
                </span>
                {' '}({filteredData.length} participants)
              </p>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="px-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-sm text-gray-600">Total Participants</div>
              <div className="text-2xl font-bold text-gray-900">{enrichedData.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-sm text-gray-600">Accepted</div>
              <div className="text-2xl font-bold text-green-600">
                {enrichedData.filter(p => p.status === 'accepted').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-sm text-gray-600">Rejected</div>
              <div className="text-2xl font-bold text-red-600">
                {enrichedData.filter(p => p.status === 'rejected').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-sm text-gray-600">Events</div>
              <div className="text-2xl font-bold text-blue-600">{events.length}</div>
            </div>  
          </div>
        </div>

        <SearchableDynamicTable
          title=""
          data={filteredData}
          showStatusIndicator={false}
          pageSize={10}
          includeColumns={["Participant", "eventName", "eventLocation", "eventDateTime", "status", "registrationFee", "winnerReward", "created_at"]}
          detailsUrl="/event_participants/participant"
        />
      </div>
    </div>
  );
  
}

export default EventParticipation;
