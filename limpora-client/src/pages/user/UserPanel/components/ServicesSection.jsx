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
    console.log(allServices)
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-light text-gray-800 pb-2 border-b border-gray-100">
                {lang('userpanel.title.services') ?? 'Servicios'}
            </h2>

            {userServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-gray-500 text-sm">No hay servicios registrados.</p>
            )}

            {isSelf && (
                <div className="pt-4 border-t border-gray-100 space-y-3">
                    <h3 className="text-base font-medium text-gray-700">Añadir servicio</h3>

                    {serviceError && <p className="text-red-500 text-sm">{serviceError}</p>}

                    <form onSubmit={onAdd} className="flex flex-col sm:flex-row gap-3">
                        <select
                            value={selectedServiceId}
                            onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                            required
                            className="flex-1 p-2 bg-gray-100/50 border border-gray-300/50 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-400/50"
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
                            className="w-32 p-2 bg-gray-100/50 border border-gray-300/50 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-400/50"
                        />

                        <button
                            type="submit"
                            disabled={serviceSubmitting}
                            className="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded-lg shadow-sm border border-gray-300/50 hover:bg-gray-200/70 transition duration-150 disabled:opacity-50"
                        >
                            {serviceSubmitting ? 'Añadiendo...' : 'Añadir'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
