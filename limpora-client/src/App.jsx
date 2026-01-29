
import { Routes, Route } from 'react-router-dom';
import Home from './pages/main/Home';
import PrivateRoute from './components/PrivateRoute';
import UserPanel from './pages/user/UserPanel';
import Rergister from './pages/auth/Register';
import Login from './pages/auth/Login';
import Appointments from './pages/user/Appointments';
import TopUsers from './pages/main/TopUsers';
import Reviews from './pages/main/Reviews';
import AdminPanel from './pages/admin/AdminPanel';
import BookingConfirmation from './pages/user/BookingConfirmation';
import Currency from './pages/user/Currency';
import UserFinder from './pages/main/UserFinder';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Rergister />} />
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateRoute />}>
        <Route path="/panel/:username" element={<UserPanel />} />

        <Route path="/currency" element={<Currency />} />
        <Route path="/userfinder" element={<UserFinder />} />
        <Route path="/booking" element={<BookingConfirmation />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/top" element={<TopUsers />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/panel/admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

export default App;
