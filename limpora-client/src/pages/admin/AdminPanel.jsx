import { useEffect, useState } from "react";
import axios from "axios";
import AdminUserCard from "../../components/admin/AdminUserCard";
import AdminModal from "../../components/admin/AdminModal";
import Alert from "../../components/Alert";

import {
  UserPlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { deleteUser } from "../../services/user.service";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRegisterAdminModal, setShowRegisterAdminModal] = useState(false);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "client" });
  const [adminFormData, setAdminFormData] = useState({ name: "", email: "", password: "" });

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { filterUsers(); }, [searchTerm, filterRole, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/user", { withCredentials: true });
      setUsers(response.data.data || []);
      setFilteredUsers(response.data.data || []);
    } catch (err) {
      console.error(err);
      showAlert("error", "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    console.log(filtered);
    
    if (searchTerm) filtered = filtered.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterRole !== "all") filtered = filtered.filter(u => u.role === filterRole);
    setFilteredUsers(filtered);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/v1/auth/register", formData, { withCredentials: true });
      showAlert("success", `Usuario ${formData.name} registrado`);
      setShowRegisterModal(false);
      setFormData({ name: "", email: "", password: "", role: "client" });
      fetchUsers();
    } catch (err) {
      console.error(err);
      showAlert("error", err.response?.data?.message || "Error al registrar usuario");
    }
  };

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/v1/auth/reg_admin", adminFormData, { withCredentials: true });
      showAlert("success", `Admin ${adminFormData.email} registrado`);
      setShowRegisterAdminModal(false);
      setAdminFormData({ name: "", email: "", password: "" });
    } catch (err) {
      console.error(err);
      showAlert("error", err.response?.data?.message || "Error al registrar admin");
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Eliminar a ${user.name}?`)) return;
    try {
      await deleteUser(user.firebase_uid);
      showAlert("success", `Usuario ${user.name} eliminado`);
      fetchUsers();
    } catch (err) {
      showAlert("error", err.message || "Error al eliminar usuario");
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const stats = {
    total: users.length,
    providers: users.filter(u => u.role === "provider").length,
    clients: users.filter(u => u.role === "client").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">Panel de Administración</h1>
            <p className="text-sm text-gray-500 mt-1">Gestiona usuarios del sistema</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowRegisterModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg transition hover:bg-blue-700">
              <UserPlusIcon className="h-5 w-5" /> Nuevo Usuario
            </button>
            <button onClick={() => setShowRegisterAdminModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg transition hover:bg-gray-900">
              <UserPlusIcon className="h-5 w-5" /> Nuevo Admin
            </button>
          </div>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-xs font-light text-gray-500 uppercase">Total Usuarios</p>
            <p className="text-3xl font-semibold text-gray-800 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-xs font-light text-gray-500 uppercase">Proveedores</p>
            <p className="text-3xl font-semibold text-blue-600 mt-2">{stats.providers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-xs font-light text-gray-500 uppercase">Clientes</p>
            <p className="text-3xl font-semibold text-purple-600 mt-2">{stats.clients}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Buscar nombre o email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-transparent" />
          </div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-transparent">
            <option value="all">Todos los roles</option>
            <option value="provider">Proveedores</option>
            <option value="client">Clientes</option>
          </select>
        </div>

        {/* Users List */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Usuarios ({filteredUsers.length})</h2>
          {loading ? (
            <p className="text-gray-500 text-center py-8">Cargando usuarios...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No se encontraron usuarios</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map(user => <AdminUserCard key={user.id} user={user} onDelete={handleDelete} />)}
            </div>
          )}
        </div>
      </div>

      {/* Register User Modal */}
      <AdminModal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Registrar Nuevo Usuario">
        <div className="space-y-4">
          {["name", "email", "password"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field === "name" ? "Nombre" : field === "email" ? "Email" : "Contraseña"}</label>
              <input type={field} value={formData[field]} onChange={e => setFormData({ ...formData, [field]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-transparent" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-transparent">
              <option value="client">Cliente</option>
              <option value="provider">Proveedor</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setShowRegisterModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancelar</button>
            <button onClick={handleRegister} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Registrar</button>
          </div>
        </div>
      </AdminModal>

      {/* Register Admin Modal */}
      <AdminModal isOpen={showRegisterAdminModal} onClose={() => setShowRegisterAdminModal(false)} title="Registrar Nuevo Administrador">
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
            <p className="text-sm text-yellow-800">⚠️ Los administradores tienen acceso completo al sistema.</p>
          </div>
          {["name", "email", "password"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field === "name" ? "Nombre" : field === "email" ? "Email" : "Contraseña"}</label>
              <input type={field} value={adminFormData[field]} onChange={e => setAdminFormData({ ...adminFormData, [field]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-transparent" />
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <button onClick={() => setShowRegisterAdminModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancelar</button>
            <button onClick={handleRegisterAdmin} className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">Registrar Admin</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}