import logo from '../../assets/logo-provisional.png';
import { useAuthStore } from '../../stores/auth.store';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginSchema from '../../schemas/NewSessionSchema';
import lang from '../../utils/LangManager';
import {
    TextInput,
    PasswordInput,
    Button,
    Paper,
    Title,
    Stack,
    Image,
    Center,
    Anchor,
    Modal,
    Text,
} from '@mantine/core';
import { UserRole } from '../../../../common/enums/Role.enum';

export default function Login() {
    const login = useAuthStore((state) => state.login);
    const user = useAuthStore((state) => state.user);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [isAdmin, setAdmin] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = LoginSchema.safeParse({ email, password });

        if (!result.success) {
            setModalTitle(lang('login.validation_error'));
            setModalMessage(result.error.issues[0]?.message ?? 'Validation error');
            setModalOpen(true);
            return;
        }

        const response = await login(result.data.email, result.data.password);

        if (response.success) {
            setModalTitle(lang('login.success_title'));
            setModalMessage(lang('login.success_message'));
            setSuccess(true);
            if (user?.role === UserRole.Admin) setAdmin(true);
        } else {
            setModalTitle(lang('login.error_title'));
            setModalMessage(response.error ?? lang('login.generic_error'));
        }

        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        if (success) navigate(isAdmin ? '/panel/admin' : '/panel/me');
    };

    return (
        <Center mih="100vh" px="md">
            <Paper w="100%" maw={448} p={40} withBorder>
                <Stack align="center" mb="xl" gap="xs">
                    <Image src={logo} alt="Limpora Logo" w={112} h={112} fit="contain" />
                    <Title order={1} fw={300} fz="2rem">
                        {lang('login.title')}
                    </Title>
                </Stack>

                <form onSubmit={handleSubmit}>
                    <Stack gap="md" mb="xl">
                        <TextInput
                            id="email"
                            type="email"
                            required
                            label={lang('login.email')}
                            placeholder="tu.correo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.currentTarget.value)}
                            size="md"
                        />
                        <PasswordInput
                            id="password"
                            required
                            label={lang('login.password')}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.currentTarget.value)}
                            size="md"
                        />
                    </Stack>

                    <Stack gap="sm" mb="md">
                        <Button type="submit" variant="default" size="md" fullWidth>
                            {lang('login.submit')}
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            size="md"
                            fullWidth
                            onClick={() => (window.location.href = '/api/v1/auth/google-url')}
                        >
                            Google
                        </Button>
                    </Stack>
                </form>

                <Center>
                    <Anchor component={Link} to="/register" size="sm">
                        {lang('login.register')}
                    </Anchor>
                </Center>
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
