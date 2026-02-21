import Calendar from "../../components/Calendar";
import Base from "../../layouts/Base";
import { UserCard } from "../../components/UserCard";
import { Link } from "react-router-dom";


export default function BookingConfirmation({ users }) {
  return (
    <Base>
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL PRINCIPAL: CALENDARIO */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Selecciona fecha
          </h2>
          <Calendar />
        </div>

        {/* PANEL LATERAL: USUARIOS DISPONIBLES */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Usuarios
          </h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {users && users.length > 0 ? (
              users.map((user) => (
                <Link
                  key={user.id}
                  to="/booking"
                  state={{ userId: user.id }} // Aquí se pasa el id
                >
                  <UserCard user={user} />
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No hay usuarios disponibles</p>
            )}
          </div>
        </div>
      </div>
    </Base>
  );
}