import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
import ArtistSidebar from "../../../../components/ArtistSidebar";
import { useAuth } from "../../../../auth/AuthProvider";
import { ROLES } from "../../../../utils/roles";

const PaymentAll = () => {
  const [tableData, setTableData] = useState([]);
  const [eventdata, setEventData] = useState([]);
  const [bookingdata, setBookingData] = useState([]);
  const { user } = useAuth();

  

  const role = user.role

  console.log("User role:", role);

  // Decide visibility based on the rules you gave:
  // - super admin should see all three
  // - administrative head should see only song
  // - project head should only see events
  // - creative head only Booking
  const canView = {
    events:
      role === ROLES.SUPER_ADMIN ||
      role === ROLES.PROJECT_HEAD ||
      role === ROLES.ACCOUNTS_HEAD ||
      role === ROLES.ACCOUNTS_MEMBER,
    song:
      role === ROLES.SUPER_ADMIN ||
      role === ROLES.ADMINISTRATIVE_HEAD ||
      role === ROLES.ACCOUNTS_HEAD ||
      role === ROLES.ACCOUNTS_MEMBER,
    booking:
      role === ROLES.SUPER_ADMIN ||
      role === ROLES.CREATIVE_HEAD ||
      role === ROLES.ACCOUNTS_HEAD ||
      role === ROLES.ACCOUNTS_MEMBER,
  };

  useEffect(() => {
    const fetchDataSong = async () => {
      try {
        const res = await axiosApi.get("/payment-for-all-song");
        setTableData(res.data.data);
        console.log(res.data.data);
      } catch (err) {
        console.error("Failed to fetch Song Payments", err);
      }
    };

    const fetchDataEvents = async () => {
      try {
        const res = await axiosApi.get("/payment-for-all-events");
        setEventData(res.data.data);
        console.log(res.data.data);
      } catch (err) {
        console.error("Failed to fetch Event Payments", err);
      }
    };

    const fetchDataBooking = async () => {
      try {
        const res = await axiosApi.get("/payment-for-all-booking");
        setBookingData(res.data.data);
        console.log(res.data.data);
      } catch (err) {
        console.error("Failed to fetch Booking Payments", err);
      }
    };

    // Fetch data based on user role
    if (canView.events) fetchDataEvents();
    if (canView.song) fetchDataSong();
    if (canView.booking) fetchDataBooking();
  }, []);

  return (
    <div>
      <ArtistSidebar>
        {/* If user not loaded yet, you can show nothing or a loader. */}
        {!user ? (
          <div>Loading user...</div>
        ) : (
          <>
            {canView.events && (
              <>
                <SearchableDynamicTable
                  title="Events"
                  data={eventdata}
                  showStatusIndicator={false}
                  pageSize={10}
                  excludeColumns={"Status,song_id,Review,From,reject_reason"}
                  detailsUrl="/EventPayment"
                />
                <br />
              </>
            )}

            {canView.song && (
              <>
                <SearchableDynamicTable
                  title="Song"
                  data={tableData}
                  showStatusIndicator={false}
                  pageSize={10}
                  excludeColumns={"Status,event_id,Review,From,reject_reason,CreatedAt,UpdatedAt,reject_for,release_date"}
                  detailsUrl="/SongPayment"
                />
                <br />
              </>
            )}

           

            {/* If you want a fallback when nothing is visible */}
            {!canView.events && !canView.song && !canView.booking && (
              <div>You do not have permission to view these sections.</div>
            )}
          </>
        )}
      </ArtistSidebar>
    </div>
  );
};

export default PaymentAll;
