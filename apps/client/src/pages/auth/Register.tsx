import logo from "../../assets/logo.svg";
import { useState } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { Link, useNavigate } from 'react-router-dom';
import RegisterSchema from '../../schemas/RegisterSchema';
import lang from '../../utils/LangManager';
import {
    TextInput, PasswordInput, Select, Button, Paper,
    Title, Stack, Group, Image, Center, Modal, Text,
} from '@mantine/core';

export default function Register() {
    const register = useAuthStore((state) => state.register);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [role, setRole] = useState<string>('client');
    const [success, setSuccess] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalTitle, setModalTitle] = useState<string>('');
    const [modalMessage, setModalMessage] = useState<string>('');
    const navigate = useNavigate();

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        const result = RegisterSchema.safeParse({ username, email, password });

        if (!result.success) {
            setModalTitle(lang('register.validation_error'));
            setModalMessage(result.error.issues[0]?.message ?? lang('register.validation_error'));
            setModalOpen(true);
            return;
        }

        const data = await register(result.data.username, result.data.email, result.data.password, role);

        if (data.success) {
            setModalTitle(lang('register.success_title'));
            setModalMessage(lang('register.success_message'));
            setSuccess(true);
        } else {
            setModalTitle(lang('register.error_title'));
            setModalMessage(data.error || lang('register.generic_error'));
        }

        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        if (success) navigate("/verify-email", { state: { email } });
    };

    return (
        <Center mih="100vh" px="md">
            <Paper w="100%" maw={448} p={40} withBorder>
                <Stack align="center" mb="xl" gap="xs">
                    <Image src={logo} alt="Limpora Logo" w={180} h={180} fit="contain" />
                    <Title order={1} fw={300} fz="2rem">
                        {lang('register.title')}
                    </Title>
                </Stack>

                <form onSubmit={handleSubmit}>
                    <Stack gap="md" mb="xl">
                        <TextInput
                            required
                            placeholder={lang('register.placeholder.username')}
                            title={lang('register.tooltip.username')}
                            value={username}
                            onChange={(e) => setUsername(e.currentTarget.value)}
                            size="md"
                        />
                        <TextInput
                            type="email"
                            required
                            placeholder={lang('register.placeholder.email')}
                            title={lang('register.tooltip.email')}
                            value={email}
                            onChange={(e) => setEmail(e.currentTarget.value)}
                            size="md"
                        />
                        <PasswordInput
                            required
                            placeholder={lang('register.placeholder.password')}
                            title={lang('register.tooltip.password')}
                            value={password}
                            onChange={(e) => setPassword(e.currentTarget.value)}
                            size="md"
                        />
                        <Select
                            value={role}
                            onChange={(value) => setRole(value ?? 'client')}
                            size="md"
                            data={[
                                { value: 'client', label: lang('register.roles.client') },
                                { value: 'provider', label: lang('register.roles.provider') },
                                { value: 'admin', label: lang('register.roles.admin') },
                            ]}
                        />
                    </Stack>

                    <Group grow gap="md">
                        <Button type="submit" variant="default" size="md">
                            {lang('register.submit')}
                        </Button>
                        <Button component={Link} to="/login" variant="subtle" size="md">
                            {lang('register.cancel')}
                        </Button>
                    </Group>
                </form>
            </Paper>

            <Modal opened={modalOpen} onClose={handleModalClose} title={modalTitle} centered>
                <Text size="sm">{modalMessage}</Text>
                <Button mt="md" fullWidth variant="default" onClick={handleModalClose}>
                    Aceptar
                </Button>
            </Modal>
        </Center>
    );
}