import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../pages/Home/Home";
import Notification from "../pages/Notification/Notification";
import SongDetails from "../pages/SongDetails/SongDetails";
import Learnings from "../pages/Learnings/Learning";
import DateChange from "../pages/DateChange/DateChange";
import SuccessScreen from "../pages/SuccessScreen/SuccessScreen";
import PaymentScreen from "../pages/PaymentScreen/PaymentScreen";
import SongRegistrationForm from "../pages/UploadSong/RegisterSong/RegisterSong";
import AudioMetadataForm from "../pages/UploadSong/AudioMetadata/AudioMetadata";
import TVPublishing from "../pages/TvPublishing/TvPublishing";
import ArtistSpotlight from "../pages/ArtistSpotlight/ArtistSpotlight";
import TimeCalendar from "../pages/TimeCalender/TimeCalender";
import BlockDateForm from "../pages/BlockDate/BlockDate";
import UploadSongs from "../pages/UploadSong/UploadSong";
import KPIDashboard from "../pages/KPIDashboard/KPIDashboard";
import AnalyticsDashboard from "../pages/Analytics/Analytics";
import { Provider } from "react-redux";
import { artistStore } from "../app/artist.js";
import RequestTicketForm from "../pages/RequestTicket/RequestTicket";
import ArtistProfile from "../pages/ArtistProfile/ArtistProfile";
import Events from "../pages/Events/Events";
import IncomeWithdrawal from "../pages/Income/Income";
import VideoMetadataForm from "../pages/UploadSong/VideoMetadata/VideoMetadata";
import Error from "../pages/Error.jsx";
import MembershipForm from "../pages/auth/SignUp/MembershipFrom.jsx";
import ErrorScreen from "../pages/ErrorScreen/ErrorScreen.jsx";
import ArtistDetail from "../pages/ArtistDetail/ArtistDetail.jsx";
import PendingScreen from "../pages/PendingScreen/PendingScreen.jsx";
import MYEPK from "../pages/MYEPK/MYEPK.jsx";
import EPKManagement from "../pages/EPKManagement/EPKManagement.jsx";
import AddNewSong from "../pages/AddNewSong/AddNewSong.jsx";
const ArtistRoutes = () => {
  return (
    <Provider store={artistStore}>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="notification" element={<Notification />} />
          <Route path="song-details" element={<SongDetails />} />
          <Route path="learnings" element={<Learnings />} />
          <Route path="time-calendar" element={<TimeCalendar />}></Route>
          <Route path="my-epk" element={<MYEPK />}></Route>
          <Route path="epk-management" element={<EPKManagement />}></Route>
          <Route path="add-new-song" element={<AddNewSong />}></Route>
          <Route path="block-date" element={<BlockDateForm />}></Route>
          <Route path="date-change" element={<DateChange />} />

          <Route path="success" element={<SuccessScreen />} />
          <Route path="error" element={<ErrorScreen />} />
          <Route path="pending" element={<PendingScreen />} />
          <Route path="payment" element={<PaymentScreen />} />

          <Route path="upload-song" element={<UploadSongs />} />
          <Route
            path="upload-song/register-song"
            element={<SongRegistrationForm />}
          />
          <Route
            path="upload-song/audio-metadata/:contentId"
            element={<AudioMetadataForm />}
          />
          <Route
            path="upload-song/video-metadata/:contentId"
            element={<VideoMetadataForm />}
          />
          <Route path="request-ticket" element={<RequestTicketForm />} />
          <Route path="events" element={<Events />} />

          <Route path="profile" element={<ArtistProfile />} />
          <Route path="income" element={<IncomeWithdrawal />} />
          <Route path="notifications" element={<Notification />} />
          <Route
            path="upload-song/register-song"
            element={<SongRegistrationForm />}
          />
          <Route
            path="upload-song/audio-metadata/:contentId"
            element={<AudioMetadataForm />}
          />
          <Route
            path="upload-song/video-metadata/:contentId"
            element={<VideoMetadataForm />}
          />
          <Route path="request-ticket" element={<RequestTicketForm />} />
          <Route path="events" element={<Events />} />
          <Route path="artist-detail" element={<ArtistDetail />} />

          <Route path="profile" element={<ArtistProfile />} />
          <Route path="income" element={<IncomeWithdrawal />} />
          <Route path="notifications" element={<Notification />} />
          <Route path="events" element={<Events />} />
          <Route path="key-performance-indicators" element={<KPIDashboard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="tv-publishing" element={<TVPublishing />} />
          <Route path="artist-spotlight" element={<ArtistSpotlight />} />
          <Route path="learnings" element={<Learnings />} />

          <Route path="tv-publishing" element={<TVPublishing />} />
          <Route path="artist-spotlight" element={<ArtistSpotlight />} />
          <Route path="*" element={<Error />} />
        </Route>
        <Route path="*" element={<Error />} />
      </Routes>
    </Provider>
  );
};

export default ArtistRoutes;
