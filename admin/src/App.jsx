import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import {
  ROLES,
  ANALYTICS_PORTAL_ROLES,
  EVENT_PAYMENTS_SIDEBAR_ROLES,
  CONTENT_PORTAL_ROLES,
  TV_PUBLISHING_PORTAL_ROLES,
  WEBSITE_CONFIG_HUB_ROLES,
  TICKETS_PORTAL_ROLES,
  EVENT_MANAGEMENT_WEB_CONFIG_ROLES,
  EVENT_CREATION_AND_LIST_ROLES,
  PAYMENTS_PORTAL_ROLES,
  MY_EPK_CHANGE_AND_SONGS_ROLES,
  MY_EPK_INCOME_ROLES,
} from "./utils/roles";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// pages
import AdminSignInForm from "./pages/AdminSignIn";
import AdminSignUpForm from "./pages/AdminSignUp";
import AssignRoles from "./pages/AssignRole";
import Home from "./pages/Home";

import Dashboard from "./view/dashboard/home";
import ArtistPortal from "./view/dashboard/artistPortal";

import WebsiteConfig from "./view/dashboard/websiteConfig";
import Contact from "./view/dashboard/websiteConfig/contact";
import Resource from "./view/dashboard/websiteConfig/resource";
import HomePage from "./view/dashboard/websiteConfig/homePage";
import PageMediaUpload from "./view/dashboard/websiteConfig/PageMediaUpload";
import UploadVideo from "./view/dashboard/websiteConfig/UploadVideo";
import Collab from "./view/dashboard/websiteConfig/collab";
import CollabArtistDetail from "./view/dashboard/websiteConfig/collab/CollabArtistDetail";
import EventAdminForm from "./view/dashboard/websiteConfig/Events";
import Events from "./view/dashboard/websiteConfig/Events/Events";
import LeaderBoard from "./view/dashboard/websiteConfig/leaderBoard";
import ArtistNew from "./view/dashboard/artistPortal/artistNew";
import ArtistAll from "./view/dashboard/artistPortal/artistAll";
import ContentNew from "./view/dashboard/artistPortal/contentNew";
import TvIndex from "./view/dashboard/artistPortal/tvPublishing/index";
// import ContentManage from "./view/dashboard/artistPortal/contentManage";
import NewSignupDetails from "./view/dashboard/New_signUp";
import Tvpublishing from "./view/dashboard/artistPortal/tvPublishing/tv";
// import artistKPI from "./view/dashboard/artistPortal/artistKPI";
import Alldata from "./view/dashboard/artistPortal/allData";
import Content_Analysis from "./view/dashboard/artistPortal/contentAnalysis";

import Notifications from "./view/dashboard/artistPortal/notifications";
import PaymentAll from "./view/dashboard/artistPortal/paymentAll";
import EventPayments from "./view/dashboard/artistPortal/paymentAll/EventPayments";
import PaymentWithdraw from "./view/dashboard/artistPortal/paymentsWithdrawals/Payment";
import ArtistSettings from "./view/dashboard/artistPortal/Settings";
import Tickets from "./view/dashboard/artistPortal/Tickets";
import TicketMain from "./view/dashboard/artistPortal/Tickets/tickets";
import ResolveTickets from "./view/dashboard/artistPortal/Tickets/resolveTickets";
import ResolveIndex from "./view/dashboard/artistPortal/Tickets/ResolveIndex";
import Artist_new from "./view/dashboard/artistPortal/artistNew/Artist_new";
import Artist_All from "./view/dashboard/artistPortal/artistAll/Artist_All";
import TimeCalender from "./view/dashboard/artistPortal/timeCalender";
import Content_New from "./view/dashboard/artistPortal/contentNew/Content_New";
import Content_Manage from "./view/dashboard/artistPortal/contentManage/Content_Manage";
import ContentManage from "./view/dashboard/artistPortal/contentManage";
import Withdraw from "./view/dashboard/artistPortal/paymentsWithdrawals";
import ContentAnalysis from "./view/dashboard/artistPortal/contentAnalysis/ContentAnalysis";
import EventParticipation from "./view/dashboard/websiteConfig/Events/EventParticipation";
import EventManagement from "./view/dashboard/websiteConfig/Events/EventManagement";
import EventWinning from "./view/dashboard/websiteConfig/Events/EventWinning";
import EventWinnerAssign from "./view/dashboard/websiteConfig/Events/EventWinnerAssign";
import Artist_Kpi from "./view/dashboard/artistPortal/artistKPI";
import AddNote from "./view/dashboard/artistPortal/artistKPI/AddNote";
import CreateResource from "./view/dashboard/websiteConfig/resource";
import CreateReels from "./view/dashboard/websiteConfig/resource/CreateReels";
import CreateStory from "./view/dashboard/websiteConfig/resource/CreateStory";
import ViewPodcasts from "./view/dashboard/websiteConfig/resource/ViewPodcasts";
import UpdatePodcast from "./view/dashboard/websiteConfig/resource/UpdatePodcast";
import ViewReels from "./view/dashboard/websiteConfig/resource/ViewReels";
import ViewStories from "./view/dashboard/websiteConfig/resource/ViewStories";
import ViewLearning from "./view/dashboard/websiteConfig/resource/ViewLearning";
import UpdateStory from "./view/dashboard/websiteConfig/resource/UpdateStory";
import UpdateReel from "./view/dashboard/websiteConfig/resource/UpdateReel";
import UpdateLearning from "./view/dashboard/websiteConfig/resource/UpdateLearning";
import AudioPlatform from "./view/dashboard/artistPortal/audioPlatform";
import Audio_Metrics from "./view/dashboard/artistPortal/audioPlatform/Audio_Metrics";
import EventPayment from "./view/dashboard/artistPortal/paymentAll/EventPayment";
import SongPayment from "./view/dashboard/artistPortal/paymentAll/SongPayment";
import VerifyBookingDates from "./view/dashboard/artistPortal/VerifyBookingDates/VerifyBookingDates";
import ChangeDetails from "./view/dashboard/artistPortal/ChangeDetails/ChangeDetails";
import NewSongs from "./view/dashboard/artistPortal/NewSongs/NewSongs";
import ChangeDetailsIndividual from "./view/dashboard/artistPortal/ChangeDetails";
import NewSongsIndividual from "./view/dashboard/artistPortal/NewSongs";
import CreateLearning from "./view/dashboard/websiteConfig/resource/CreateLearning";
import WebsiteSettings from "./view/dashboard/websiteConfig/Settings";
import ContentRelease from "./view/dashboard/artistPortal/contentRelease/ContentRelease";
import ContentReleaseInd from "./view/dashboard/artistPortal/contentRelease/index";
import SpIncomeStat from "./view/dashboard/artistPortal/SpIncomeStat/SpIncomeStat";
import SpIncomeStatIndividual from "./view/dashboard/artistPortal/SpIncomeStat";

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {/* <ToastContainer position="top-right" autoClose={3000} /> */}
        <Routes>
          {/* ---------- PUBLIC ---------- */}
          <Route path="/" element={<AdminSignInForm />} />
          <Route path="/signup" element={<AdminSignUpForm />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/ArtistNew/:ophid" element={<ArtistNew />} />
          <Route
            path="/ArtistAll/:ophid"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.SALES_HEAD,
                  ROLES.SALES_MEMBER,
                ]}
              >
                <ArtistAll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AddNote/:ophid"
            element={
              <ProtectedRoute allowedRoles={ANALYTICS_PORTAL_ROLES}>
                <AddNote />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ContentNew/:ophid/:songId"
            element={
              <ProtectedRoute allowedRoles={CONTENT_PORTAL_ROLES}>
                <ContentNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/special-artist-songs/:ophid/:songId"
            element={
              <ProtectedRoute allowedRoles={MY_EPK_CHANGE_AND_SONGS_ROLES}>
                <NewSongsIndividual />
              </ProtectedRoute>
            }
          />

          <Route
            path="/special-artist-income-status/:ophid"
            element={
              <ProtectedRoute allowedRoles={MY_EPK_INCOME_ROLES}>
                <SpIncomeStatIndividual />
              </ProtectedRoute>
            }
          />

          <Route
            path="/change-details/:ophid/:field"
            element={
              <ProtectedRoute allowedRoles={MY_EPK_CHANGE_AND_SONGS_ROLES}>
                <ChangeDetailsIndividual />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ContentRelease/:ophid/:songId"
            element={
              <ProtectedRoute allowedRoles={ANALYTICS_PORTAL_ROLES}>
                <ContentReleaseInd />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ContentManage/:ophid/:songId"
            element={
              <ProtectedRoute allowedRoles={CONTENT_PORTAL_ROLES}>
                <ContentManage />
              </ProtectedRoute>
            }
          />
          <Route path="/artistPortal" element={<ArtistPortal />} />
          <Route
            path="/newsignup/:ophid"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.SALES_HEAD,
                  ROLES.SALES_MEMBER,
                  ROLES.ACCOUNTS_HEAD,
                  ROLES.ACCOUNTS_MEMBER,
                ]}
              >
                <NewSignupDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/New_SignUp"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.SALES_HEAD,
                  ROLES.SALES_MEMBER,
                  ROLES.ACCOUNTS_HEAD,
                  ROLES.ACCOUNTS_MEMBER,
                ]}
              >
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Withdraw/:ophid/:withdrawal_id"
            element={<Withdraw />}
          />
          <Route
            path="/Content_Analysis/:ophid/:songId"
            element={
              <ProtectedRoute allowedRoles={ANALYTICS_PORTAL_ROLES}>
                <ContentAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Audio_metrics/:songId"
            element={
              <ProtectedRoute allowedRoles={ANALYTICS_PORTAL_ROLES}>
                <Audio_Metrics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AllEvents"
            element={
              <ProtectedRoute allowedRoles={EVENT_CREATION_AND_LIST_ROLES}>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/event_participants"
            element={
              <ProtectedRoute
                allowedRoles={EVENT_MANAGEMENT_WEB_CONFIG_ROLES}
              >
                <EventParticipation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/event-winning"
            element={
              <ProtectedRoute allowedRoles={EVENT_MANAGEMENT_WEB_CONFIG_ROLES}>
                <EventWinning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/event-winner-assign/:event_id"
            element={
              <ProtectedRoute allowedRoles={EVENT_MANAGEMENT_WEB_CONFIG_ROLES}>
                <EventWinnerAssign />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content/tv"
            element={
              <ProtectedRoute allowedRoles={TV_PUBLISHING_PORTAL_ROLES}>
                <Tvpublishing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/TvIndex/:oph_id/:song_id"
            element={
              <ProtectedRoute allowedRoles={TV_PUBLISHING_PORTAL_ROLES}>
                <TvIndex />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ResolvedTickets/:ophid/:ticketNumber"
            element={
              <ProtectedRoute allowedRoles={TICKETS_PORTAL_ROLES}>
                <ResolveIndex />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Tickets/:ophid/:ticketNumber"
            element={
              <ProtectedRoute allowedRoles={TICKETS_PORTAL_ROLES}>
                <Tickets />
              </ProtectedRoute>
            }
          />
          <Route path="/EventPayment/:ophid/:eventId/:transactionId" element={<EventPayment />} />
          <Route path="/EventPayment/:ophid/:eventId" element={<EventPayment />} />
          <Route path="/EventPayment/:ophid" element={<EventPayment />} />
          <Route
            path="/SongPayment/:ophid/:song_id"
            element={<SongPayment />}
          />

          {/* <Route path="/home" element={<ProtectedRoute allowedRoles={Object.values(ROLES)}><Home /></ProtectedRoute>} /> */}
          {/* ---------- PROTECTED (SUPER_ADMIN) ---------- */}
          <Route
            path="/WebsiteConfig"
            element={
              <ProtectedRoute allowedRoles={WEBSITE_CONFIG_HUB_ROLES}>
                <WebsiteConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Contact"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.SALES_MEMBER,
                  ROLES.SALES_HEAD,
                ]}
              >
                <Contact />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Resource"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.OPERATION_HEAD,
                  ROLES.OPERATION_MEMBER,
                ]}
              >
                <CreateResource />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Reels"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.OPERATION_HEAD,
                  ROLES.OPERATION_MEMBER,
                ]}
              >
                <CreateReels />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Stories"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.OPERATION_HEAD,
                  ROLES.OPERATION_MEMBER,
                ]}
              >
                <CreateStory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Learning"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.OPERATION_HEAD,
                  ROLES.OPERATION_MEMBER,
                ]}
              >
                <CreateLearning />
              </ProtectedRoute>
            }
          />

          <Route
            path="/allResource"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.OPERATION_HEAD,
                  ROLES.OPERATION_MEMBER,
                ]}
              >
                <ViewPodcasts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/allReel"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.OPERATION_HEAD,
                  ROLES.OPERATION_MEMBER,
                ]}
              >
                <ViewReels />
              </ProtectedRoute>
            }
          />

          <Route
            path="/allStories"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.OPERATION_HEAD,
                  ROLES.OPERATION_MEMBER,
                ]}
              >
                <ViewStories />
              </ProtectedRoute>
            }
          />

          <Route
            path="/allLearning"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.OPERATION_HEAD,
                  ROLES.OPERATION_MEMBER,
                ]}
              >
                <ViewLearning />
              </ProtectedRoute>
            }
          />

          <Route
            path="/update_podcast/:podcastId"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.OPERATION_HEAD,
                  ROLES.OPERATION_MEMBER,
                ]}
              >
                <UpdatePodcast />
              </ProtectedRoute>
            }
          />

          <Route
            path="/update_reel/:reelId"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.OPERATION_HEAD,
                  ROLES.OPERATION_MEMBER,
                ]}
              >
                <UpdateReel />
              </ProtectedRoute>
            }
          />

          <Route
            path="/update_story/:storyId"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.OPERATION_HEAD,
                  ROLES.OPERATION_MEMBER,
                ]}
              >
                <UpdateStory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/update_learning/:learningId"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.OPERATION_HEAD,
                  ROLES.OPERATION_MEMBER,
                ]}
              >
                <UpdateLearning />
              </ProtectedRoute>
            }
          />

          <Route
            path="/HomePage"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                ]}
              >
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/PageMediaUpload"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                ]}
              >
                <PageMediaUpload />
              </ProtectedRoute>
            }
          />

          <Route
            path="/UploadVideo"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                ]}
              >
                <UploadVideo />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Collab/:ophid"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                ]}
              >
                <CollabArtistDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Collab"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                ]}
              >
                <Collab />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Events"
            element={
              <ProtectedRoute allowedRoles={EVENT_CREATION_AND_LIST_ROLES}>
                <EventAdminForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/event_management/:event_id"
            element={
              <ProtectedRoute allowedRoles={EVENT_CREATION_AND_LIST_ROLES}>
                <EventManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/LeaderBoard"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.SUPER_ADMIN,
                ]}
              >
                <LeaderBoard />
              </ProtectedRoute>
            }
          />

          {/* Artist‑portal items */}
          <Route
            path="/artist/new"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.SALES_HEAD,
                  ROLES.SALES_MEMBER,
                ]}
              >
                <Artist_new />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Artist/All"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.SALES_HEAD,
                  ROLES.SALES_MEMBER,
                ]}
              >
                <Artist_All />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ContentNew"
            element={
              <ProtectedRoute allowedRoles={CONTENT_PORTAL_ROLES}>
                <Content_New />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ContentManage"
            element={
              <ProtectedRoute allowedRoles={CONTENT_PORTAL_ROLES}>
                <Content_Manage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/artistPortal"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.SALES_HEAD,
                  ROLES.SALES_MEMBER,
                ]}
              >
                <ArtistPortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tvpublishing"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <Tvpublishing />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ArtistKPI"
            element={
              <ProtectedRoute allowedRoles={ANALYTICS_PORTAL_ROLES}>
                <Artist_Kpi />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                ]}
              >
                <TimeCalender />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify-booking-dates"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                ]}
              >
                <VerifyBookingDates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <Alldata />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ContentAnalysis"
            element={
              <ProtectedRoute allowedRoles={ANALYTICS_PORTAL_ROLES}>
                <Content_Analysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ContentRelease"
            element={
              <ProtectedRoute allowedRoles={ANALYTICS_PORTAL_ROLES}>
                <ContentRelease />
              </ProtectedRoute>
            }
          />
          <Route
            path="/platform"
            element={
              <ProtectedRoute allowedRoles={ANALYTICS_PORTAL_ROLES}>
                <AudioPlatform />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Notifications"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/PaymentAll"
            element={
              <ProtectedRoute allowedRoles={PAYMENTS_PORTAL_ROLES}>
                <PaymentAll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/EventPayments"
            element={
              <ProtectedRoute allowedRoles={EVENT_PAYMENTS_SIDEBAR_ROLES}>
                <EventPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/PaymentWithdraw"
            element={
              <ProtectedRoute allowedRoles={PAYMENTS_PORTAL_ROLES}>
                <PaymentWithdraw />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Settings"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <ArtistSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute allowedRoles={TICKETS_PORTAL_ROLES}>
                <TicketMain />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ResolveTickets"
            element={
              <ProtectedRoute allowedRoles={TICKETS_PORTAL_ROLES}>
                <ResolveTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-details"
            element={
              <ProtectedRoute allowedRoles={MY_EPK_CHANGE_AND_SONGS_ROLES}>
                <ChangeDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/special-artist-songs"
            element={
              <ProtectedRoute allowedRoles={MY_EPK_CHANGE_AND_SONGS_ROLES}>
                <NewSongs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/special-artist-income-status"
            element={
              <ProtectedRoute allowedRoles={MY_EPK_INCOME_ROLES}>
                <SpIncomeStat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/websiteConfig_Setting"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.SALES_MEMBER,
                  ROLES.SALES_HEAD,
                ]}
              >
                <WebsiteSettings />
              </ProtectedRoute>
            }
          />

          {/* Dashboards / home views */}
          {/* <Route
            path="/Dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <Dashboard />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <Dashboard />
              </ProtectedRoute>
            }
          /> */}

          {/* Role‑management page (already SUPER_ADMIN‑only) */}
          <Route
            path="/role_change"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <AssignRoles />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
