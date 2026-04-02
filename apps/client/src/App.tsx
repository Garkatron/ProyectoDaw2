import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/main/Home";
import PrivateRoute from "./components/PrivateRoute";
import Rergister from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Appointments from "./pages/user/Appointments";
// import TopUsers from './pages/main/TopUsers';
import AdminPanel from "./pages/admin/AdminPanel";
import BookingConfirmation from "./pages/user/BookingConfirmation";
import Currency from "./pages/user/Currency";
import RoleRoute from "./components/RoleRoute";
import UserFinder from "./pages/main/UserFinder";
// import EmailCode from './pages/auth/EmailCode';
import UserPanel from "./pages/user/UserPanel/index";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ScheduleSettings from "./pages/user/ScheduleSettings";
import AppointmentReviewPage from "./pages/user/AppointmentReviewPage";
import Inbox from "./pages/user/Inbox";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import Settings from "./pages/main/settings";
import OAuthCallback from "./pages/auth/OAuthCallback";
import CookieConsent from 'react-cookie-consent';
import lang from './utils/LangManager';

// <Route path="/emailcode" element={<EmailCode />} />

/*

<Route element={<PrivateRoute />}>
        <Route path="/panel/:username" element={<UserPanel />} />

        <Route path="/currency" element={<Currency />} />
        <Route path="/userfinder" element={<UserFinder />} />
        <Route path="/booking" element={<BookingConfirmation />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/top" element={<TopUsers />} />
        <Route path="/panel/admin" element={<AdminPanel />} />
      </Route>
*/

const routeOrder = ["/", "/currency", "/appointments", "/userfinder", "/inbox"];

const variants = {
  initial: (dir: number) => ({ x: dir * 50, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -50, opacity: 0 }),
};

const App = () => {
  const location = useLocation();

  return (
    <>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Rergister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />

        <Route element={<PrivateRoute />}>
          <Route path="/panel/:username" element={<UserPanel />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/review" element={<AppointmentReviewPage />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route element={<RoleRoute roles={["provider"]} />}>
            <Route path="/currency" element={<Currency />} />
          </Route>
          <Route path="/userfinder" element={<UserFinder />} />
          <Route path="/booking" element={<BookingConfirmation />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/panel/admin" element={<AdminPanel />} />
        </Route>
      </Routes>
      <CookieConsent
        buttonText="Aceptar"
        declineButtonText="Rechazar"
        enableDeclineButton
        onAccept={() => {

        }}
        onDecline={() => {

        }}
        style={{ background: "#2B373B" }}
        buttonStyle={{ background: "#4CAF50", color: "#fff" }}
        declineButtonStyle={{ background: "#f44336", color: "#fff" }}
      >
        {lang("cookies.message")}
      </CookieConsent>
    </>
  );
};

export default App;
