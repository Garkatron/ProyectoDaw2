import { useEffect, useState } from "react"
import AdminUserCard from "../../components/admin/AdminUserCard"
import { useAuthStore } from "../../stores/auth.store"
import { API } from "../../lib/api"
import { UserPlus, Search } from "lucide-react"
import {
    Box, Button, Grid, Group, Loader, Modal, Paper, Select,
    SimpleGrid, Stack, Text, TextInput, PasswordInput, Title,
    Alert as MantineAlert,
} from "@mantine/core"

export default function AdminPanel() {
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterRole, setFilterRole] = useState("all")
    const [showRegisterModal, setShowRegisterModal] = useState(false)
    const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "client" })

    const register = useAuthStore((state) => state.register)

    useEffect(() => { fetchUsers() }, [])
    useEffect(() => { filterUsers() }, [searchTerm, filterRole, users])

    const fetchUsers = async () => {
        setLoading(true)
        const { data, error } = await API.user.get()

        if (error) {
            showAlert("error", "Error al cargar usuarios")
        } else {
            setUsers(data ?? [])
            setFilteredUsers(data ?? [])
        }
        setLoading(false)
    }

    const filterUsers = () => {
        let filtered = users
        if (searchTerm)
            filtered = filtered.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
        if (filterRole !== "all")
            filtered = filtered.filter(u => u.role === filterRole)
        setFilteredUsers(filtered)
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        const result = await register(formData.name, formData.email, formData.password, formData.role)

        if (result.success) {
            showAlert("success", `Usuario ${formData.name} registrado`)
            setShowRegisterModal(false)
            setFormData({ name: "", email: "", password: "", role: "client" })
            fetchUsers()
        } else {
            showAlert("error", result.error ?? "Error al registrar usuario")
        }
    }

    const handleDelete = async (user) => {
        if (!window.confirm(`¿Eliminar a ${user.name}?`)) return
        const { error } = await API.user({ id: String(user.id) }).delete()
        if (error) showAlert("error", "Error al eliminar usuario")
        else {
            showAlert("success", `Usuario ${user.name} eliminado`)
            fetchUsers()
        }
    }

    const showAlert = (type: 'success' | 'error', message: string) => {
        setAlert({ type, message })
        setTimeout(() => setAlert(null), 5000)
    }

    const stats = {
        total:     users.length,
        providers: users.filter(u => u.role === "provider").length,
        clients:   users.filter(u => u.role === "client").length,
    }

    return (
        <Box mih="100vh" bg="gray.0">
            <Stack maw={1280} mx="auto" p="md" gap="md">

                <Paper withBorder p="lg">
                    <Group justify="space-between" wrap="wrap">
                        <Box>
                            <Title order={1} fz="1.875rem" fw={600} c="gray.8">
                                Panel de Administración
                            </Title>
                            <Text size="sm" c="gray.5" mt={4}>Gestiona usuarios del sistema</Text>
                        </Box>
                        <Button leftSection={<UserPlus size={18} />} onClick={() => setShowRegisterModal(true)}>
                            Nuevo Usuario
                        </Button>
                    </Group>
                </Paper>

                {alert && (
                    <MantineAlert color={alert.type === 'success' ? 'green' : 'red'}>
                        {alert.message}
                    </MantineAlert>
                )}

                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Paper withBorder p="lg" ta="center">
                        <Text size="xs" fw={300} c="gray.5" tt="uppercase">Total Usuarios</Text>
                        <Text fz="1.875rem" fw={600} c="gray.8" mt="xs">{stats.total}</Text>
                    </Paper>
                    <Paper withBorder p="lg" ta="center">
                        <Text size="xs" fw={300} c="gray.5" tt="uppercase">Proveedores</Text>
                        <Text fz="1.875rem" fw={600} c="blue.6" mt="xs">{stats.providers}</Text>
                    </Paper>
                    <Paper withBorder p="lg" ta="center">
                        <Text size="xs" fw={300} c="gray.5" tt="uppercase">Clientes</Text>
                        <Text fz="1.875rem" fw={600} c="violet.6" mt="xs">{stats.clients}</Text>
                    </Paper>
                </SimpleGrid>

                <Paper withBorder p="md">
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                placeholder="Buscar nombre o email..."
                                leftSection={<Search size={16} />}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.currentTarget.value)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Select
                                value={filterRole}
                                onChange={val => setFilterRole(val ?? 'all')}
                                data={[
                                    { value: "all",      label: "Todos los roles" },
                                    { value: "provider", label: "Proveedores" },
                                    { value: "client",   label: "Clientes" },
                                ]}
                            />
                        </Grid.Col>
                    </Grid>
                </Paper>

                <Paper withBorder p="lg">
                    <Title order={2} fz="1.25rem" fw={600} c="gray.8" mb="md">
                        Usuarios ({filteredUsers.length})
                    </Title>
                    {loading ? (
                        <Group justify="center" py={32}>
                            <Loader size="sm" />
                            <Text c="gray.5">Cargando usuarios...</Text>
                        </Group>
                    ) : filteredUsers.length === 0 ? (
                        <Text c="gray.5" ta="center" py={32}>No se encontraron usuarios</Text>
                    ) : (
                        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                            {filteredUsers.map(user => (
                                <AdminUserCard key={user.id} user={user} onDelete={handleDelete} />
                            ))}
                        </SimpleGrid>
                    )}
                </Paper>
            </Stack>

            <Modal opened={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Registrar Nuevo Usuario">
                <form onSubmit={handleRegister}>
                    <Stack gap="sm">
                        <TextInput label="Nombre" required value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.currentTarget.value })} />
                        <TextInput label="Email" type="email" required value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.currentTarget.value })} />
                        <PasswordInput label="Contraseña" required value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.currentTarget.value })} />
                        <Select label="Rol" value={formData.role}
                            onChange={val => setFormData({ ...formData, role: val ?? 'client' })}
                            data={[
                                { value: "client",   label: "Cliente" },
                                { value: "provider", label: "Proveedor" },
                            ]}
                        />
                        <Group grow mt="sm">
                            <Button variant="default" onClick={() => setShowRegisterModal(false)}>Cancelar</Button>
                            <Button type="submit">Registrar</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Box>
    )
}