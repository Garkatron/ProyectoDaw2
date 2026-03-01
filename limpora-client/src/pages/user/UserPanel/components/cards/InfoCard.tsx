import { Paper, Text } from '@mantine/core';

export default function InfoCard({ label, value }) {
    return (
        <Paper withBorder p="md" radius="md" shadow="xs">
            <Text size="xs" fw={300} tt="uppercase" c="dimmed">{label}</Text>
            <Text size="md" fw={500}>{value}</Text>
        </Paper>
    );
}