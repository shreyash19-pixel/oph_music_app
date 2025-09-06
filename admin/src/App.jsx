import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import { ROLES } from "./utils/roles";
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
import Collab from "./view/dashboard/websiteConfig/collab";
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
import ContentRelease from "./view/dashboard/artistPortal/contentRelease";
import Notifications from "./view/dashboard/artistPortal/notifications";
import PaymentAll from "./view/dashboard/artistPortal/paymentAll";
import PaymentWithdraw from "./view/dashboard/artistPortal/paymentsWithdrawals/Payment";
import ArtistSettings from "./view/dashboard/artistPortal/Settings";
import Tickets from "./view/dashboard/artistPortal/Tickets";
import TicketMain from "./view/dashboard/artistPortal/Tickets/tickets";
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
import Artist_Kpi from "./view/dashboard/artistPortal/artistKPI";
import AddNote from "./view/dashboard/artistPortal/artistKPI/AddNote";
import CreateResource from "./view/dashboard/websiteConfig/resource";
import CreateReels from "./view/dashboard/websiteConfig/resource/CreateReels";
import CreateStory from "./view/dashboard/websiteConfig/resource/CreateStory";
import ViewPodcasts from "./view/dashboard/websiteConfig/resource/ViewPodcasts";
import UpdatePodcast from "./view/dashboard/websiteConfig/resource/UpdatePodcast";
import ViewReels from "./view/dashboard/websiteConfig/resource/ViewReels";
import ViewStories from "./view/dashboard/websiteConfig/resource/ViewStories";
import UpdateStory from "./view/dashboard/websiteConfig/resource/UpdateStory";
import UpdateReel from "./view/dashboard/websiteConfig/resource/UpdateReel";
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
function App() {
  return (
    <AuthProvider>
      <Router>
        {/* <ToastContainer position="top-right" autoClose={3000} /> */}
        <Routes>
          {/* ---------- PUBLIC ---------- */}
          <Route path="/" element={<AdminSignInForm />} />
          <Route path="/signup" element={<AdminSignUpForm />} />
          <Route path="/WebsiteConfig" element={<WebsiteConfig />} />

          <Route path="/home" element={<Dashboard />} />
          <Route path="/ArtistNew/:ophid" element={<ArtistNew />} />
          <Route path="/ArtistAll/:ophid" element={<ArtistAll />} />
          <Route path="/AddNote/:ophid" element={<AddNote />} />
          <Route path="/ContentNew/:ophid/:songId" element={<ContentNew />} />
          <Route
            path="/special-artist-songs/:ophid/:songId"
            element={<NewSongsIndividual />}
          />
          <Route
            path="/change-details/:ophid/:field"
            element={<ChangeDetailsIndividual />}
          />
          <Route
            path="/ContentManage/:ophid/:songId"
            element={<ContentManage />}
          />
          <Route path="/artistPortal" element={<ArtistPortal />} />
          <Route path="/newsignup/:ophid" element={<NewSignupDetails />} />

          <Route path="/New_SignUp" element={<Home />} />
          <Route
            path="/Withdraw/:ophid/:withdrawal_id"
            element={<Withdraw />}
          />
          <Route
            path="/Content_Analysis/:ophid/:songId"
            element={<ContentAnalysis />}
          />
          <Route
            path="/Audio_metrics/:songId"
            element={<Audio_Metrics />} // Adjusted to match the new export
          />
          <Route path="/AllEvents" element={<Events />} />
          <Route
            path="/event_participants"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.SALES_HEAD,
                  ROLES.SALES_MEMBER,
                  ROLES.PROJECT_HEAD,
                  ROLES.PROJECT_MEMBER,
                  ROLES.ACCOUNTS_HEAD,
                  ROLES.ACCOUNTS_MEMBER,
                ]}
              >
                <EventParticipation />
              </ProtectedRoute>
            }
          />
          <Route path="/content/tv" element={<Tvpublishing />} />
          <Route path="/TvIndex/:oph_id/:song_id" element={<TvIndex />} />
          <Route path="/Tickets/:ophid/:ticketNumber" element={<Tickets />} />
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
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
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
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.SALES_HEAD,
                  ROLES.SALES_MEMBER,
                  ROLES.PROJECT_HEAD,
                  ROLES.PROJECT_MEMBER,
                  ROLES.ACCOUNTS_HEAD,
                  ROLES.ACCOUNTS_MEMBER,
                ]}
              >
                <EventAdminForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/event_management/:event_id"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.SALES_HEAD,
                  ROLES.SALES_MEMBER,
                  ROLES.PROJECT_HEAD,
                  ROLES.PROJECT_MEMBER,
                  ROLES.ACCOUNTS_HEAD,
                  ROLES.ACCOUNTS_MEMBER,
                ]}
              >
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
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.CREATIVE_HEAD,
                  ROLES.CREATIVE_MEMBER,
                  ROLES.ACCOUNTS_HEAD,
                  ROLES.ACCOUNTS_MEMBER,
                ]}
              >
                <Content_New />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ContentManage"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.CREATIVE_HEAD,
                  ROLES.CREATIVE_MEMBER,
                  ROLES.ACCOUNTS_HEAD,
                  ROLES.ACCOUNTS_MEMBER,
                ]}
              >
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
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.OPERATION_HEAD,
                  ROLES.OPERATION_MEMBER,
                ]}
              >
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
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <Content_Analysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ContentRelease"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <ContentRelease />
              </ProtectedRoute>
            }
          />

          <Route
            path="/platform"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
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
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ACCOUNTS_HEAD,
                  ROLES.ACCOUNTS_MEMBER,
                ]}
              >
                <PaymentAll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/PaymentWithdraw"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ACCOUNTS_HEAD,
                  ROLES.ACCOUNTS_MEMBER,
                ]}
              >
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
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                  ROLES.ACCOUNTS_HEAD,
                  ROLES.ACCOUNTS_MEMBER,
                ]}
              >
                <TicketMain />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-details"
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
                <ChangeDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/special-artist-songs"
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
                <NewSongs />
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
                  ROLES.ADMINISTRATIVE_MEMBER,
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
