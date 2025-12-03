import { useState } from "react";
import "./App.css";
import { Home } from "./pages/Home";
import { TopUsers } from "./pages/TopUsers";
import { UserPanel } from "./pages/UserPanel";
import { Currency } from "./pages/Currency";
import { Login } from "./pages/Login";
import { Rergister } from "./pages/Register";
import { Reviews } from "./pages/Reviews";
import { AdminPanel } from "./pages/admin/AdminPanel";
import { AdminUsersView } from "./pages/admin/AdminUsersView";
import { Booking } from "./pages/Booking";
import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Rergister />} />
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateRoute />}>
        <Route path="/me" element={<UserPanel />} />
        <Route path="/currency" element={<Currency />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/top" element={<TopUsers />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/admin/panel" element={<AdminPanel />} />
        <Route path="/admin/users" element={<AdminUsersView />} />
      </Route>
    </Routes>
  );
}

export default App;
