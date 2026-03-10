import { ActionIcon, Avatar, Box, Button, Group, Text, Overlay } from '@mantine/core';
import { LogOut, Pencil, Camera } from 'lucide-react';
import { EditProfileImageModal } from '../../../../components/EditProfileImageModal';
import { useState } from 'react';
import { useProfileImageMe } from '../../../../hooks/useProfileImage';
import { useBannerImageMe } from '../../../../hooks/useBannerImage';

export default function ProfileHeader({ targetUser, isSelf, onLogout }) {
    const { image, submitting, handleAdd } = useProfileImageMe();
    const { image: banner, submitting: bannerSubmitting, handleAdd: handleBannerAdd } = useBannerImageMe();

    const [avatarModalOpen, setAvatarModalOpen] = useState(false);
    const [bannerModalOpen, setBannerModalOpen] = useState(false);

    const imageUrl = image ? URL.createObjectURL(image) : undefined;
    const bannerUrl = banner ? URL.createObjectURL(banner) : undefined;

    return (
        <>
            {/* Banner */}
            <Box
                h={300}
                style={{
                    position: 'relative',
                    borderRadius: 'var(--mantine-radius-md) var(--mantine-radius-md) 0 0',
                    overflow: 'hidden',
                    background: bannerUrl
                        ? `url(${bannerUrl}) center/cover no-repeat`
                        : 'var(--mantine-color-default-hover)',
                    cursor: isSelf ? 'pointer' : 'default',
                }}
                onClick={isSelf ? () => setBannerModalOpen(true) : undefined}
            >
                {!bannerUrl && (
                    <Box
                        style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text c="dimmed" size="sm">Fondo de usuario</Text>
                    </Box>
                )}

                {isSelf && (
                    <Box
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            background: 'rgba(0,0,0,0.35)',
                        }}
                        className="banner-overlay"
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                    >
                        <Group gap="xs">
                            <Camera size={18} color="white" />
                            <Text c="white" size="sm" fw={500}>Cambiar portada</Text>
                        </Group>
                    </Box>
                )}
            </Box>

            {/* Avatar row */}
            <Box
                px="lg"
                pb="xs"
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    marginTop: -48,
                }}
            >
                <Box style={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                        size={96}
                        radius="50%"
                        src={imageUrl}
                        alt={targetUser.name}
                        style={{
                            border: '3px solid var(--mantine-color-body)',
                        }}
                    >
                        {targetUser.name[0].toUpperCase()}
                    </Avatar>
                    {isSelf && (
                        <ActionIcon
                            size="sm"
                            radius="xl"
                            variant="filled"
                            style={{ position: 'absolute', bottom: 2, right: 2 }}
                            onClick={() => setAvatarModalOpen(true)}
                        >
                            <Pencil size={11} />
                        </ActionIcon>
                    )}
                </Box>

                {isSelf && (
                    <Button
                        variant="default"
                        size="xs"
                        leftSection={<LogOut size={14} />}
                        onClick={onLogout}
                        mb={4}
                    >
                        Logout
                    </Button>
                )}
            </Box>

            <EditProfileImageModal
                opened={avatarModalOpen}
                onClose={() => setAvatarModalOpen(false)}
                onSubmit={handleAdd}
                submitting={submitting}
            />
            <EditProfileImageModal
                opened={bannerModalOpen}
                onClose={() => setBannerModalOpen(false)}
                onSubmit={handleBannerAdd}
                submitting={bannerSubmitting}
            />
        </>
    );
}