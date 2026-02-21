export default function ServiceCard({ service, isSelf, onDelete }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300/20 flex justify-between items-center">
            <p className="text-sm font-medium text-gray-800">{service.service_name}</p>
            <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-gray-600">{service.price}€</span>
                {isSelf && (
                    <button
                        onClick={() => onDelete(service.service_id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        title="Eliminar servicio"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}