import { Routes, Route } from "react-router-dom";
import Home from "./pages/main/Home";
import PrivateRoute from "./components/PrivateRoute";
import Rergister from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Appointments from "./pages/user/Appointments";
// import TopUsers from './pages/main/TopUsers';
import AdminPanel from "./pages/admin/AdminPanel";
import BookingConfirmation from "./pages/user/BookingConfirmation";
import Currency from "./pages/user/Currency";
import UserFinder from "./pages/main/UserFinder";
// import EmailCode from './pages/auth/EmailCode';
import UserPanel from "./pages/user/UserPanel/index";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ScheduleSettings from "./pages/user/ScheduleSettings";

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
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Rergister />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route element={<PrivateRoute />}>
        <Route path="/panel/:username" element={<UserPanel />} />
        <Route path="/currency" element={<Currency />} />
        <Route path="/userfinder" element={<UserFinder />} />
        <Route path="/booking" element={<BookingConfirmation />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/panel/admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

export default App;
