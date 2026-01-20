import { useEffect, useState } from "react";
import { Home } from "./pages/Home";
import { TopUsers } from "./pages/TopUsers";
import { UserPanel } from "./pages/UserPanel";
import { Currency } from "./pages/Currency";
import { Login } from "./pages/Login";
import { Rergister } from "./pages/Register";
import { Reviews } from "./pages/Reviews";
import { AdminPanel } from "./pages/admin/AdminPanel";
import { AdminUsersView } from "./pages/admin/AdminUsersView";
import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";
import Appointments from "./pages/Appointments";
import { UserFinder } from "./pages/UserFinder";
import BookingConfirmation from "./pages/BookingConfirmation";
import { initLangManager } from "./utils/LangManager";

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
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/users" element={<AdminUsersView />} />
      </Route>
    </Routes>
  );
}

export default App;
