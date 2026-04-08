import { ActionIcon, Box, Button, Group, Text, Skeleton, Avatar } from '@mantine/core';
import { LogOut, Camera } from 'lucide-react'; // Quitamos Pencil
import { EditProfileImageModal } from '../../../../components/EditProfileImageModal';
import { useState } from 'react';
import { useProfileImageMe } from '../../../../hooks/useProfileImage';
import { useBannerImageMe } from '../../../../hooks/useBannerImage';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileHeader({ targetUser, isSelf, onLogout }) {
    const { image, submitting, handleAdd } = useProfileImageMe();
    const { image: banner, submitting: bannerSubmitting, handleAdd: handleBannerAdd } = useBannerImageMe();

    const [avatarModalOpen, setAvatarModalOpen] = useState(false);
    const [bannerModalOpen, setBannerModalOpen] = useState(false);
    const [bannerLoaded, setBannerLoaded] = useState(false);
    const [avatarLoaded, setAvatarLoaded] = useState(false);

    const imageUrl = image ? URL.createObjectURL(image) : undefined;
    const bannerUrl = banner ? URL.createObjectURL(banner) : undefined;

    const handleBannerChange = (file: File) => { setBannerLoaded(false); handleBannerAdd(file); };
    const handleAvatarChange = (file: File) => { setAvatarLoaded(false); handleAdd(file); };

    return (
        <>
            {/* Banner Section */}
            <Box
                h={300}
                style={{
                    position: 'relative',
                    borderRadius: 'var(--mantine-radius-md) var(--mantine-radius-md) 0 0',
                    overflow: 'hidden',
                    cursor: isSelf ? 'pointer' : 'default',
                }}
                onClick={isSelf ? () => setBannerModalOpen(true) : undefined}
            >
                <AnimatePresence>
                    {(!bannerUrl || !bannerLoaded) && (
                        <motion.div
                            key="banner-skeleton"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            style={{ position: 'absolute', inset: 0 }}
                        >
                            <Skeleton height="100%" radius={0} animate={!!bannerUrl} />
                            {!bannerUrl && (
                                <Box style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'var(--mantine-color-default-hover)',
                                }}>
                                    <Text c="dimmed" size="sm">Fondo de usuario</Text>
                                </Box>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Banner Uploading Overlay */}
                <AnimatePresence>
                    {bannerSubmitting && (
                        <motion.div
                            key="banner-uploading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'absolute', inset: 0,
                                background: 'rgba(0,0,0,0.45)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 10,
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <Camera size={28} color="white" />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {bannerUrl && (
                    <motion.img
                        key={bannerUrl}
                        src={bannerUrl}
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={bannerLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        onLoad={() => setBannerLoaded(true)}
                        style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                )}

                {isSelf && (
                    <Box
                        style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: 0, transition: 'opacity 0.2s',
                            background: 'rgba(0,0,0,0.35)',
                            zIndex: 2,
                        }}
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

            <Box
                px="lg"
                pb="xs"
                style={{
                    display: 'flex', alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    marginTop: -48,
                }}
            >
                <Box 
                    style={{ 
                        position: 'relative', 
                        display: 'inline-block',
                        cursor: isSelf ? 'pointer' : 'default'
                    }}
                    onClick={isSelf ? () => setAvatarModalOpen(true) : undefined}
                >
                    <AnimatePresence>
                        {(!imageUrl || !avatarLoaded) && (
                            <motion.div
                                key="avatar-skeleton"
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    position: 'absolute', inset: 0,
                                    borderRadius: '50%', overflow: 'hidden',
                                    zIndex: 1,
                                }}
                            >
                                <Skeleton height={96} circle animate={!!imageUrl} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Avatar Uploading Overlay */}
                    <AnimatePresence>
                        {submitting && (
                            <motion.div
                                key="avatar-uploading"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    position: 'absolute', inset: 0,
                                    borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 10,
                                    backdropFilter: 'blur(2px)',
                                }}
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                >
                                    <Camera size={16} color="white" />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Avatar Hover Overlay (isSelf) */}
                    {isSelf && (
                        <Box
                            style={{
                                position: 'absolute', inset: 0,
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                opacity: 0, transition: 'opacity 0.2s',
                                background: 'rgba(0,0,0,0.3)',
                                zIndex: 5,
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                        >
                            <Camera size={20} color="white" />
                        </Box>
                    )}

                    <motion.div
                        initial={{ opacity: 0, scale: 0.88 }}
                        animate={avatarLoaded || !imageUrl ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                        <Avatar
                            size={96}
                            radius="50%"
                            src={imageUrl || ""}
                            alt={targetUser.name}
                            style={{ 
                                border: '3px solid var(--mantine-color-body)',
                            }}
                            onLoad={() => setAvatarLoaded(true)}
                        >
                            {targetUser.name[0].toUpperCase()}
                        </Avatar>
                    </motion.div>
                </Box>

                {isSelf && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.25 }}
                    >
                        <Button
                            variant="default" size="xs"
                            leftSection={<LogOut size={14} />}
                            onClick={onLogout} mb={4}
                        >
                            Logout
                        </Button>
                    </motion.div>
                )}
            </Box>

            <EditProfileImageModal
                opened={avatarModalOpen}
                onClose={() => setAvatarModalOpen(false)}
                onSubmit={handleAvatarChange}
                submitting={submitting}
            />
            <EditProfileImageModal
                opened={bannerModalOpen}
                onClose={() => setBannerModalOpen(false)}
                onSubmit={handleBannerChange}
                submitting={bannerSubmitting}
            />
        </>
    );
}