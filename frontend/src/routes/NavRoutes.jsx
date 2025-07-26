import React from "react";
import { Route, Routes } from "react-router-dom";
import NavLayout from "../layouts/NavLayout";
import Home from "../pages/NavPages/Home/Home";
import Contact from "../pages/NavPages/Contact/Contact";
import Events from "../pages/NavPages/Events/Events";
import Artists from "../pages/NavPages/Artists/Artists";
import Leaderboard from "../pages/NavPages/Leaderboard/Leaderboard";
import Resources from "../pages/NavPages/Resources/Resources";
import IndividualPodcast from "../pages/NavPages/Resources/components/IndividualPodcast/IndividualPodcast";
import IndividualEvent from "../pages/NavPages/Events/components/IndividualEvent/IndividualEvent";
import MusicPlayerProfile from "../pages/NavPages/Artists/components/MusicPlayerProfile";
import PaymentScreen from "../pages/NavPages/Events/components/PaymentScreen";
import { Provider } from "react-redux";
import { artistStore } from "../app/artist";
import Error from "../pages/NavPages/Error";
import SuccessScreen from "../pages/NavPages/Events/components/SuccessScreen";
import PrivacyPolicy from "../pages/NavPages/Legals/PrivacyPolicy";
import CancellationPolicy from "../pages/NavPages/Legals/CancelationPolicy";
import Disclaimer from "../pages/NavPages/Legals/Disclaimer";
import RefundPolicy from "../pages/NavPages/Legals/RefundPolicy";
import TermsAndConditions from "../pages/NavPages/Legals/TermsAndConditions";

const NavRoutes = () => {
  return (
    <Provider store={artistStore}>
      <Routes>
        <Route path="/" element={<NavLayout />}>
          <Route index element={<Home />} />
          <Route path="contact" element={<Contact />} />
          <Route path="events/online-music-events" element={<Events />} />
          <Route path="events/:id" element={<IndividualEvent />} />
          <Route path="payment" element={<PaymentScreen />} />
          <Route path="find-your-collaborator" element={<Artists />} />
          <Route path="artists/:id" element={<MusicPlayerProfile />} />
          <Route path="leaderboard/top-music-networking-platform-for-creators/" element={<Leaderboard />} />
          <Route path="resources/music-learning-education" element={<Resources />} />
          <Route path="content/:id" element={<IndividualPodcast />} />
          <Route path="success" element={<SuccessScreen />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy/>} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path ="/refund-policy" element={<RefundPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="*" element={<Error />} />
        </Route>
      </Routes>
    </Provider>
  );
};

export default NavRoutes;
