import { useState, useEffect } from "react";
import axios from "axios";
import Base from "../../layouts/Base";
import { UserCard } from "../../components/UserCard";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function UserFinder() {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeServices, setActiveServices] = useState([]);

  // Debounce búsqueda
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
    fetchServices();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [debouncedSearch, activeServices, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/v1/user", { withCredentials: true });
      const allUsers = res.data.data || [];
      const nonAdmin = allUsers.filter(u => u.role !== "admin" && u.role !== "client");
      setUsers(nonAdmin);
      setFilteredUsers(nonAdmin);
    } catch (err) {
      console.error(err);
      alert("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get("/api/v1/services");
      setServices(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Error al cargar servicios");
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (debouncedSearch) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (activeServices.length > 0) {
      filtered = filtered.filter(u =>
        u.services?.some(s => activeServices.includes(s.name))
      );
    }

    setFilteredUsers(filtered);
  };

  const toggleService = (serviceName) => {
    if (activeServices.includes(serviceName)) {
      setActiveServices(activeServices.filter(s => s !== serviceName));
    } else {
      setActiveServices([...activeServices, serviceName]);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveServices([]);
  };

  return (
    <Base>
      {/* BUSCADOR Y FILTROS */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
        {/* Buscador */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl
                       focus:ring-2 focus:ring-blue-400 focus:border-transparent 
                       shadow-sm transition placeholder-gray-400"
          />
        </div>

        {/* Filtros por servicios */}
        <div className="flex flex-wrap gap-3 mb-4">
          {services.map(s => (
            <button
              key={s.id || s.name}
              onClick={() => toggleService(s.name)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition
                          ${activeServices.includes(s.name)
                            ? "bg-blue-500 text-white shadow"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {(activeServices.length > 0 || searchTerm) && (
          <button
            onClick={clearFilters}
            className="mt-2 px-5 py-2 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition shadow-sm"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* RESULTADOS */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Usuarios ({filteredUsers.length})
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-16 text-lg">
            No se encontraron usuarios
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <UserCard
                key={user.id}
                user={user}
                className="hover:scale-105 transition-transform"
              />
            ))}
          </div>
        )}
      </div>
    </Base>
  );
}
