import { useEffect, useState } from "react";
import { API } from "../../../lib/api";

interface UserService {
    service_id: number;
    user_id: number;
    price: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Service {
    id: number;
    name: string;
}

export function useServices(
    targetUser: { id: number; role: string } | null,
    isSelf: boolean,
) {
    const [userServices, setUserServices] = useState<UserService[]>([]);
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [selectedServicePrice, setSelectedServicePrice] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserServices = async (id: number) => {
        const { data, error } = await API.providers({
            provider_id: String(id),
        }).services.get();
        if (!error && data) setUserServices(data);
    };

    useEffect(() => {
        if (!targetUser?.id || targetUser.role !== "provider") return;

        fetchUserServices(targetUser.id);

        if (isSelf) {
            API.services.get().then(({ data, error }) => {
                if (!error && data) setAllServices(data);
            });
        }
    }, [targetUser?.id, isSelf]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetUser) return;

        setSubmitting(true);
        setError(null);

        const { error } = await API.providers.me.services.assign.post({
            service_id: Number(selectedServiceId),
            price: Number(selectedServicePrice),
        });

        if (error) {
            setError(
                typeof error.value === "string"
                    ? error.value
                    : "Error al añadir el servicio.",
            );
        } else {
            await fetchUserServices(targetUser.id);
            setSelectedServiceId("");
            setSelectedServicePrice("");
        }

        setSubmitting(false);
    };

    const handleDelete = async (serviceId: number) => {
        if (!targetUser) return;

        const { error } = await API.providers.me.services.unassign.delete({
            service_id: serviceId,
        });

        if (!error)
            setUserServices((prev) =>
                prev.filter((s) => s.service_id !== serviceId),
            );
        else console.error("Error al eliminar servicio:", error.value);
    };

    return {
        userServices,
        allServices,
        selectedServiceId,
        setSelectedServiceId,
        selectedServicePrice,
        setSelectedServicePrice,
        serviceSubmitting: submitting,
        serviceError: error,
        onAdd: handleAdd,
        onDelete: handleDelete,
    };
}
