import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import { ROLES } from "./utils/roles";

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
import Events from "./view/dashboard/websiteConfig/Events";
import LeaderBoard from "./view/dashboard/websiteConfig/leaderBoard";

import ArtistNew from "./view/dashboard/artistPortal/artistNew";
import ArtistAll from "./view/dashboard/artistPortal/artistAll";
import ContentNew from "./view/dashboard/artistPortal/contentNew";
// import ContentManage from "./view/dashboard/artistPortal/contentManage";
import NewSignupDetails from "./view/dashboard/New_signUp";
// import tvpublishing from "./view/dashboard/artistPortal/tvPublishing";
// import artistKPI from "./view/dashboard/artistPortal/artistKPI";
import Alldata from "./view/dashboard/artistPortal/allData";
import ContentAnalysis from "./view/dashboard/artistPortal/contentAnalysis";
import ContentRelease from "./view/dashboard/artistPortal/contentRelease";
import Notifications from "./view/dashboard/artistPortal/notifications";
import PaymentAll from "./view/dashboard/artistPortal/paymentAll";
import PaymentWidthdrawal from "./view/dashboard/artistPortal/paymentsWithdrawals";
import Settings from "./view/dashboard/artistPortal/Settings";
import Tickets from "./view/dashboard/artistPortal/Tickets";
import Artist_new from "./view/dashboard/artistPortal/artistNew/Artist_new";
import Artist_All from './view/dashboard/artistPortal/artistAll/Artist_All'
import TimeCalender from "./view/dashboard/artistPortal/timeCalender";
import Content_New from "./view/dashboard/artistPortal/contentNew/Content_New";
import Content_Manage from "./view/dashboard/artistPortal/contentManage/Content_manage";
import ContentManage from "./view/dashboard/artistPortal/contentManage";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ---------- PUBLIC ---------- */}
          <Route path="/" element={<AdminSignInForm />} />
          <Route path="/signup" element={<AdminSignUpForm />} />
          <Route path="/WebsiteConfig" element={<WebsiteConfig />} />


          <Route path="/home" element={<Dashboard />} />
          <Route path="/ArtistNew/:ophid" element={<ArtistNew />} />
          <Route path="/ArtistAll/:ophid" element={<ArtistAll />} />
          <Route path="/ContentNew/:ophid/:songId" element={<ContentNew />} />
          <Route path="/ContentManage/:ophid/:songId" element={<ContentManage />} />
          <Route path="/artistPortal" element={<ArtistPortal />} />
          <Route path="/newsignup/:ophid" element={<NewSignupDetails />} />
          <Route path="/New_SignUp" element={<Home/>} />

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
                <Resource />
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
                <Events />
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
                <Content_New/>
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
                <tvPublishing />
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
                <artistKPI />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeCalender"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMINISTRATIVE_HEAD,
                  ROLES.ADMINISTRATIVE_MEMBER,
                ]}
              >
                <TimeCalender/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/AllData"
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
                <ContentAnalysis />
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
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <PaymentAll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/PaymentWithdrawal"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <PaymentWidthdrawal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Settings"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Tickets"
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
                <Tickets />
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
