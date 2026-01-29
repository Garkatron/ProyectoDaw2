import { useState } from "react";
import BookingCard from "../../components/BookingCard";
import Base from "../../layouts/Base";
import Calendar from "../../components/Calendar";
import Finder from "../../components/Finder";
import { UserCard } from "../../components/UserCard";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import axios from "axios";

export default function UserFinder() {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterServices, setFilterServices] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterServices, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/user", {
        withCredentials: true,
      });
      const allUsers = response.data.data || [];
      const nonAdminUsers = allUsers
        .filter((u) => u.role !== "admin")
        .filter((u) => u.role !== "client");
      setUsers(nonAdminUsers);
      setFilteredUsers(nonAdminUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      showAlert("error", "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get("/api/v1/services");      
      const services = response.data.data || [];
      setServices(services);
    } catch (err) {
      console.error("Error fetching users:", err);
      showAlert("error", "Error al cargar usuarios");
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter((u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

 

    setFilteredUsers(filtered);
  };

  const handleSelectChange = (e) => {
    const selectedValues = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setFilterServices(selectedValues);
  };
 return (
    <Base>
      <div className="bg-white rounded-lg shadow-sm border border-gray-300/20 p-4 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          <div className="relative lg:col-span-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Filtrar por servicios
            </label>

            <select
              multiple
              value={filterServices}
              onChange={handleSelectChange}
              className="px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         h-44 bg-white"
            >
              {services.map((s) => (
                <option key={s.id || s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            <span className="text-xs text-gray-400 mt-1">
              Usa Ctrl (Windows) o Cmd (Mac) para seleccionar varios
            </span>
          </div>
        </div>

        {filterServices.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filterServices.map((service) => (
              <span
                key={service}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
              >
                {service}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-300/20 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Usuarios ({filteredUsers.length})
        </h2>

        {loading ? (
          <p className="text-gray-500 text-center py-8">
            Cargando usuarios...
          </p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No se encontraron usuarios
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </Base>
  );
}