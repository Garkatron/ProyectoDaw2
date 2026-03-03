import { useUserPanel } from './useUserPanel';
import { useServices } from './useServices';
import { useReviews } from './useReviews';
import ProfileHeader from './components/ProfileHeader';
import InfoSection from './components/InfoSection';
import MetricsBar from './components/MetricsBar';
import ServicesSection from './components/ServicesSection';
import ReviewsSection from './components/ReviewsSection';
import Base from '../../../layouts/Base';
import { Box, Loader, Center, Text, Paper, Stack } from '@mantine/core';

export default function UserPanel() {
    const { targetUser, isSelf, loading, error, handleLogout } = useUserPanel();
    const services = useServices(targetUser, isSelf);
    const reviews = useReviews(targetUser, isSelf);

    if (loading)
        return (
            <Base>
                <Center maw={1152} mx="auto" p="xl">
                    <Loader size="sm" />
                </Center>
            </Base>
        );

    if (error || !targetUser)
        return (
            <Base>
                <Box maw={1152} mx="auto" p="xl">
                    <Text c="red">{error || 'Usuario no encontrado.'}</Text>
                </Box>
            </Base>
        );

    return (
        <Base>
            <Box maw={1152} mx="auto" p={{ base: 'md', sm: 'xl' }}>
                <Paper withBorder radius="md">
                    <ProfileHeader
                        targetUser={targetUser}
                        isSelf={isSelf}
                        onLogout={handleLogout}
                    />

                    <Stack gap="lg" p="lg">
                        <InfoSection targetUser={targetUser} isSelf={isSelf} />
                        <MetricsBar targetUser={targetUser} />

                        {targetUser.role === 'provider' && (
                            <ServicesSection isSelf={isSelf} {...services} />
                        )}

                    </Stack>
                </Paper>
            </Box>
        </Base>
    );
}