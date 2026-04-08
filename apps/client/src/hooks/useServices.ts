import { useEffect, useState } from "react";
import { API } from "../lib/api";
import type { ProviderService, Service } from "@limpora/common";

export function useServices(
    targetUser: { id: number; role: string } | null,
    isSelf: boolean,
) {
    const [userServices, setUserServices] = useState<ProviderService[]>([]);
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [selectedServicePrice, setSelectedServicePrice] = useState("");
    const [selectedServiceMinutes, setSelectedServiceMinutes] =
        useState<number>(15);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserServices = async (id: number) => {
        const { data, error } = await API.providers({
            provider_id: id,
        }).services.get();
        if (!error && data)
            setUserServices(
                data.map((s) => ({ ...s, is_active: Boolean(s.is_active) })),
            );
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
            price_per_h: Number(selectedServicePrice),
            duration_minutes: selectedServiceMinutes,
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
            setSelectedServiceMinutes(15);
        }

        setSubmitting(false);
    };

    const handleDelete = async (service_id: number) => {
        if (!targetUser) return;

        const { error } = await API.providers.me
            .services({ service_id })
            .unassign.delete();

        if (!error)
            setUserServices((prev) =>
                prev.filter((s) => s.service_id !== service_id),
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
        selectedServiceMinutes,
        setSelectedServiceMinutes,
        serviceSubmitting: submitting,
        serviceError: error,
        onAdd: handleAdd,
        onDelete: handleDelete,
    };
}
