import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
import ArtistSidebar from "../../../../components/ArtistSidebar";
import { useAuth } from "../../../../auth/AuthProvider";
import { EVENT_PAYMENTS_SIDEBAR_ROLES } from "../../../../utils/roles";

const canViewEvents = (role) =>
  role && EVENT_PAYMENTS_SIDEBAR_ROLES.includes(role);

const EventPayments = () => {
  const [eventdata, setEventData] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !canViewEvents(user.role)) return;

    const fetchDataEvents = async () => {
      try {
        const res = await axiosApi.get("/payment-for-all-events");
        setEventData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch Event Payments", err);
      }
    };

    fetchDataEvents();
  }, [user]);

  return (
    <div>
      <ArtistSidebar>
        {!user ? (
          <div>Loading user...</div>
        ) : canViewEvents(user.role) ? (
          <SearchableDynamicTable
            title="Events"
            data={eventdata}
            showStatusIndicator={false}
            pageSize={10}
            excludeColumns={
              "song_id,review,release_date,old_release_date,From"
            }
            detailsUrl="/EventPayment"
          />
        ) : (
          <div>You do not have permission to view this section.</div>
        )}
      </ArtistSidebar>
    </div>
  );
};

export default EventPayments;
