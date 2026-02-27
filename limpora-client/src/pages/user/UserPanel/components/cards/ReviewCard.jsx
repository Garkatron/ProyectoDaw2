import { Avatar, Box, Group, Paper, Stack, Text } from '@mantine/core';

export default function ReviewCard({ review }) {
    const reviewerName = review?.reviewer || 'Anónimo';
    const rating = Number(review?.rating || 0);
    const text = review?.text || '';

    return (
        <Paper withBorder p="md" radius="md" shadow="xs">
            <Stack gap="xs">
                <Group gap="sm">
                    <Avatar size={32} radius="50%" fw={700}>
                        {reviewerName.charAt(0).toUpperCase()}
                    </Avatar>

                    <Group justify="space-between" style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>{reviewerName}</Text>
                        <Text size="sm" c="yellow.5" style={{ flexShrink: 0 }}>
                            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                        </Text>
                    </Group>
                </Group>

                {text && (
                    <Box
                        pl="sm"
                        pt={4}
                        style={{ borderLeft: '2px solid var(--mantine-color-default-border)' }}
                    >
                        <Text size="sm" c="dimmed" fs="italic">"{text}"</Text>
                    </Box>
                )}
            </Stack>
        </Paper>
    );
}