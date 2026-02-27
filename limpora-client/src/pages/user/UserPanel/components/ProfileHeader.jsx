import { Avatar, Box, Button, Center, Text } from '@mantine/core';
import { LogOut } from 'lucide-react';

export default function ProfileHeader({ targetUser, isSelf, onLogout }) {
    return (
        <Box style={{ position: 'relative' }}>
            {/* Banner */}
            <Box
                h={224}
                style={{
                    borderRadius: 'var(--mantine-radius-md) var(--mantine-radius-md) 0 0',
                    background: 'var(--mantine-color-default-hover)',
                }}
            >
                <Center h="100%">
                    <Text c="dimmed">Fondo de usuario</Text>
                </Center>
            </Box>

            {/* Avatar */}
            <Box style={{ position: 'absolute', left: 24, bottom: -40 }}>
                <Avatar
                    size={96}
                    radius="50%"
                    fw={700}
                    fz="1.875rem"
                >
                    {targetUser.name[0].toUpperCase()}
                </Avatar>
            </Box>

            {/* Logout */}
            {isSelf && (
                <Box style={{ position: 'absolute', top: 16, right: 16 }}>
                    <Button
                        variant="default"
                        size="xs"
                        leftSection={<LogOut size={14} />}
                        onClick={onLogout}
                    >
                        Logout
                    </Button>
                </Box>
            )}
        </Box>
    );
}