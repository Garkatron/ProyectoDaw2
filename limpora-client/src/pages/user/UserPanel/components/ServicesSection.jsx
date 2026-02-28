import lang from '../../../../utils/LangManager';
import ServiceCard from './cards/ServiceCard';
import {
    Alert,
    Button,
    Divider,
    Group,
    NumberInput,
    Select,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { useState } from 'react';

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
    const availableServices = allServices
        .filter((s) => !userServices.some((us) => us.service_id === s.id))
        .map((s) => ({ value: String(s.id), label: s.name }));

    return (
        <Stack gap="md">
            <Title order={2} fw={300} fz="xl">
                {lang('userpanel.title.services') ?? 'Servicios'}
            </Title>
            <Divider />

            {userServices.length > 0 ? (
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    {userServices.map((service) => (
                        <ServiceCard
                            key={service.service_id}
                            service={service}
                            isSelf={isSelf}
                            onDelete={onDelete}
                        />
                    ))}
                </SimpleGrid>
            ) : (
                <Text size="sm" c="dimmed">No hay servicios registrados.</Text>
            )}

            {isSelf && (
                <Stack gap="sm" pt="sm">
                    <Divider />
                    <Title order={3} fw={300} fz="lg">Añadir servicio</Title>

                    {serviceError && (
                        <Alert color="red" variant="light">{serviceError}</Alert>
                    )}

                    <form onSubmit={onAdd}>
                        <Group align="flex-end" gap="sm" wrap="wrap">
                            <Select
                                style={{ flex: 1, minWidth: 180 }}
                                placeholder="Selecciona un servicio..."
                                data={availableServices}
                                value={selectedServiceId ? String(selectedServiceId) : null}
                                onChange={(val) => setSelectedServiceId(Number(val))}
                                required
                            />

                            <NumberInput
                                w={128}
                                placeholder="Precio (€)"
                                min={0}
                                decimalScale={2}
                                value={selectedServicePrice}
                                onChange={setSelectedServicePrice}
                                required
                            />

                            <Button
                                type="submit"
                                variant="default"
                                loading={serviceSubmitting}
                            >
                                Añadir
                            </Button>
                        </Group>
                    </form>
                </Stack>
            )}
        </Stack>
    );
}