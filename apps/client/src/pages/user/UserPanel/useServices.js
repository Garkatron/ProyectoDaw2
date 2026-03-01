import { useEffect, useState } from 'react';
import { getUserServices, addUserService, deleteUserService } from '../../../services/user_services.service';
import { getAllServices } from '../../../services/services.service';

export function useServices(targetUser, isSelf) {
    const [userServices, setUserServices] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [selectedServicePrice, setSelectedServicePrice] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!targetUser?.id || targetUser.role !== 'provider') return;

        const fetch = async () => {
            const services = await getUserServices(targetUser.id);
            setUserServices(services);
            if (isSelf) {
                const catalog = await getAllServices();
                setAllServices(catalog);
            }
        };
        fetch();
    }, [targetUser?.id, isSelf]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await addUserService(targetUser.id, selectedServiceId, selectedServicePrice);

            const updated = await getUserServices(targetUser.id);
            setUserServices(updated);
            setSelectedServiceId('');
            setSelectedServicePrice('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al añadir el servicio.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (serviceId) => {
        try {
            await deleteUserService(targetUser.id, serviceId);
            setUserServices((prev) => prev.filter((s) => s.service_id !== serviceId));
        } catch (err) {
            console.error('Error al eliminar servicio:', err);
        }
    };

    return {
        userServices, allServices,
        selectedServiceId, setSelectedServiceId,
        selectedServicePrice, setSelectedServicePrice,
        serviceSubmitting: submitting,
        serviceError: error,
        onAdd: handleAdd,
        onDelete: handleDelete,
    };
}