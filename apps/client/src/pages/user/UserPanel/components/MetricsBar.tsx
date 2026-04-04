import { CalendarDays, Trophy } from 'lucide-react';
import { Group, Paper, Text, ThemeIcon, Divider } from '@mantine/core';
import { useTranslation } from 'react-i18next';

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
      const { t } = useTranslation();
    
    return (
        <>
            <Group gap="md">
                <MetricPill
                    icon={CalendarDays}
                    label={t('userpanel.label.completed_appointments')}
                    value={targetUser.citasCompletas || 0}
                />
                <MetricPill
                    icon={Trophy}
                    label={t('userpanel.label.total_points')}
                    value={targetUser.puntosTotales || 0}
                />
            </Group>
            <Divider />
        </>
    );
}