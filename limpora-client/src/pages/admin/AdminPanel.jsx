import { useEffect, useState } from "react";
import axios from "axios";
import AdminUserCard from "../../components/admin/AdminUserCard";
import AdminModal from "../../components/admin/AdminModal";
import Alert from "../../components/Alert";

import {
  UserPlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
  });

  const [adminFormData, setAdminFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/user", {
        withCredentials: true,
      });
      const allUsers = response.data.data || [];
      const nonAdminUsers = allUsers.filter((u) => u.role !== "admin");
      setUsers(nonAdminUsers);
      setFilteredUsers(nonAdminUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      showAlert("error", "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterRole !== "all") {
      filtered = filtered.filter((u) => u.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "/api/v1/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        },
        {
          withCredentials: true,
        },
      );

      showAlert("success", `Usuario ${formData.name} registrado exitosamente`);
      setShowRegisterModal(false);
      setFormData({ name: "", email: "", password: "", role: "client" });
      fetchUsers();
    } catch (err) {
      console.error("Error registering user:", err);
      showAlert(
        "error",
        err.response?.data?.message || "Error al registrar usuario",
      );
    }
  };

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "/api/v1/auth/reg_admin",
        {
          email: adminFormData.email,
          password: adminFormData.password,
        },
        {
          withCredentials: true,
        },
      );

      showAlert(
        "success",
        `Admin ${adminFormData.email} registrado exitosamente`,
      );
      setShowRegisterAdminModal(false);
      setAdminFormData({ email: "", password: "" });
    } catch (err) {
      console.error("Error registering admin:", err);
      showAlert(
        "error",
        err.response?.data?.message || "Error al registrar admin",
      );
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${user.name}?`)) return;

    try {
      
      await deleteUser(user.firebase_uid);
      showAlert("success", `Usuario ${user.name} eliminado exitosamente`);
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
    providers: users.filter((u) => u.role === "provider").length,
    clients: users.filter((u) => u.role === "client").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-300/20 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Panel de Administración
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gestiona usuarios del sistema
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
              >
                <UserPlusIcon className="h-5 w-5" />
                <span>Nuevo Usuario</span>
              </button>
              <button
                onClick={() => setShowRegisterAdminModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg shadow-sm transition-colors"
              >
                <UserPlusIcon className="h-5 w-5" />
                <span>Nuevo Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300/20">
          <p className="text-xs font-light text-gray-500 uppercase">
            Total Usuarios
          </p>
          <p className="text-3xl font-semibold text-gray-800 mt-2">
            {stats.total}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300/20">
          <p className="text-xs font-light text-gray-500 uppercase">
            Proveedores
          </p>
          <p className="text-3xl font-semibold text-blue-600 mt-2">
            {stats.providers}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300/20">
          <p className="text-xs font-light text-gray-500 uppercase">Clientes</p>
          <p className="text-3xl font-semibold text-purple-600 mt-2">
            {stats.clients}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-300/20 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los roles</option>
            <option value="provider">Proveedores</option>
            <option value="client">Clientes</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-300/20 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Usuarios ({filteredUsers.length})
        </h2>

        {loading ? (
          <p className="text-gray-500 text-center py-8">Cargando usuarios...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No se encontraron usuarios
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <AdminUserCard
                key={user.id}
                user={user}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Register Modal */}
      <AdminModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Registrar Nuevo Usuario"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="client">Cliente</option>
              <option value="provider">Proveedor</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleRegister}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Registrar
            </button>
          </div>
        </div>
      </AdminModal>

      {/* Register Admin Modal */}
      <AdminModal
        isOpen={showRegisterAdminModal}
        onClose={() => setShowRegisterAdminModal(false)}
        title="Registrar Nuevo Administrador"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Los administradores tienen acceso completo al sistema.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={adminFormData.email}
              onChange={(e) =>
                setAdminFormData({ ...adminFormData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={adminFormData.password}
              onChange={(e) =>
                setAdminFormData({ ...adminFormData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowRegisterAdminModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleRegisterAdmin}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors"
            >
              Registrar Admin
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
