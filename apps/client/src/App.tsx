import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/main/Home";
import PrivateRoute from "./components/PrivateRoute";
import Rergister from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Currency from "./pages/user/Currency";
import RoleRoute from "./components/RoleRoute";
import UserFinder from "./pages/main/UserFinder";
import UserPanel from "./pages/user/UserPanel";
import VerifyEmail from "./pages/auth/VerifyEmail";
import AppointmentReviewPage from "./pages/user/AppointmentReviewPage";
import Inbox from "./pages/user/Inbox";
import Settings from "./pages/main/Settings";
import OAuthCallback from "./pages/auth/OAuthCallback";
import CookieConsent from 'react-cookie-consent';
import lang from './utils/LangManager';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import BookingConfirmation from "./pages/booking";
import Appointments from "./pages/user/Appointments";
import Legal from "./pages/limpora/Legal";
import About from "./pages/limpora/About";
import DownloadPage from "./pages/limpora/Download";


const App = () => {
  const location = useLocation();
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);
  
  return (
    <>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Rergister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/about" element={<About />} />
        <Route path="/download" element={<DownloadPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/panel/:username" element={<UserPanel />} />
          <Route path="/review" element={<AppointmentReviewPage />} />
          <Route path="/inbox" element={<Inbox />} />
      
          <Route element={<RoleRoute roles={["provider"]} />}>
            <Route path="/currency" element={<Currency />} />
          </Route>
      
          <Route path="/userfinder" element={<UserFinder />} />
      
          <Route path="/booking" element={
            <Elements stripe={stripePromise}>
              <BookingConfirmation />
            </Elements>
          } />
          <Route path="/appointments" element={<Appointments />} />
      
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
