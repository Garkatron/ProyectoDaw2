import lang from '../../../../utils/LangManager';
import ServiceCard from './cards/ServiceCard';

export default function ServicesSection({
    isSelf,
    userServices,
    allServices,
    onDelete,
    onAdd,
    selectedServiceId,
    setSelectedServiceId,
    selectedServicePrice,
    setSelectedServicePrice,
    serviceSubmitting,
    serviceError,
}) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-light text-gray-700 pb-2 border-b border-gray-200">
                {lang('userpanel.title.services') ?? 'Servicios'}
            </h2>

            {userServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {userServices.map((service) => (
                        <ServiceCard
                            key={service.service_id}
                            service={service}
                            isSelf={isSelf}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-sm mt-2">No hay servicios registrados.</p>
            )}

            {isSelf && (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                    <h3 className="text-lg font-light text-gray-700">Añadir servicio</h3>

                    {serviceError && <p className="text-red-500 text-sm">{serviceError}</p>}

                    <form onSubmit={onAdd} className="flex flex-col sm:flex-row gap-3">
                        <select
                            value={selectedServiceId}
                            onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                            required
                            className="flex-1 p-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 transition"
                        >
                            <option value="">Selecciona un servicio...</option>
                            {allServices
                                .filter((s) => !userServices.some((us) => us.service_id === s.id))
                                .map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                        </select>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={selectedServicePrice}
                            onChange={(e) => setSelectedServicePrice(e.target.value)}
                            required
                            placeholder="Precio (€)"
                            className="w-32 p-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 transition"
                        />

                        <button
                            type="submit"
                            disabled={serviceSubmitting}
                            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-200 transition disabled:opacity-50"
                        >
                            {serviceSubmitting ? 'Añadiendo...' : 'Añadir'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}