import {
  TrashIcon
} from "@heroicons/react/24/outline";

export default function AdminUserCard({ user, onDelete }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300/20 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-grow">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-700 flex-shrink-0">
            {user.name[0].toUpperCase()}
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <span
              className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                user.role === "provider"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {user.role}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(user)}
          className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
          title="Eliminar usuario"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
