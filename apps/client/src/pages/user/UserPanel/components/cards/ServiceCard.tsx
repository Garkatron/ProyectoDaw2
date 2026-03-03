import { ActionIcon, Group, Paper, Text } from '@mantine/core';
import { X } from 'lucide-react';

export default function ServiceCard({ service, isSelf, onDelete }) {
    return (
        <Paper withBorder p="md" radius="md" shadow="xs">
            <Group justify="space-between">
                <Text size="sm" fw={500}>{service.service_name}</Text>
                <Group gap="sm">
                    <Text size="sm" fw={600} c="dimmed">{service.price_per_h}€ hour</Text>
                    {isSelf && (
                        <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => onDelete(service.service_id)}
                            title="Eliminar servicio"
                        >
                            <X size={12} />
                        </ActionIcon>
                    )}
                </Group>
            </Group>
        </Paper>
    );
}