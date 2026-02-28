import { CalendarDays, Trophy } from 'lucide-react';
import lang from '../../../../utils/LangManager';
import { Group, Paper, Text, ThemeIcon, Divider } from '@mantine/core';

const MetricPill = ({ icon: Icon, label, value }) => (
    <Paper withBorder px="md" py="sm" radius="xl" shadow="xs">
        <Group gap="xs">
            <Icon size={20} />
            <Text size="sm" fw={500}>
                {label}: <Text span fw={700}>{value}</Text>
            </Text>
        </Group>
    </Paper>
);

export default function MetricsBar({ targetUser }) {
    return (
        <>
            <Group gap="md">
                <MetricPill
                    icon={CalendarDays}
                    label={lang('userpanel.label.completed_appointments')}
                    value={targetUser.citasCompletas || 0}
                />
                <MetricPill
                    icon={Trophy}
                    label={lang('userpanel.label.total_points')}
                    value={targetUser.puntosTotales || 0}
                />
            </Group>
            <Divider />
        </>
    );
}