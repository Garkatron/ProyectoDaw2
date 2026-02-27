import { useEffect, useState } from "react";
import axios from "axios";
import AdminUserCard from "../../components/admin/AdminUserCard";
import Alert from "../../components/Alert";
import { deleteUser } from "../../services/user.service";
import { UserPlus, Search } from "lucide-react";
import {
  Box,
  Button,
  Grid,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  PasswordInput,
  Title,
  Alert as MantineAlert,
} from "@mantine/core";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRegisterAdminModal, setShowRegisterAdminModal] = useState(false);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "client" });
  const [adminFormData, setAdminFormData] = useState({ name: "", email: "", password: "" });

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { filterUsers(); }, [searchTerm, filterRole, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/user", { withCredentials: true });
      setUsers(response.data.data || []);
      setFilteredUsers(response.data.data || []);
    } catch (err) {
      console.error(err);
      showAlert("error", "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    if (searchTerm) filtered = filtered.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterRole !== "all") filtered = filtered.filter(u => u.role === filterRole);
    setFilteredUsers(filtered);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/v1/auth/register", formData, { withCredentials: true });
      showAlert("success", `Usuario ${formData.name} registrado`);
      setShowRegisterModal(false);
      setFormData({ name: "", email: "", password: "", role: "client" });
      fetchUsers();
    } catch (err) {
      console.error(err);
      showAlert("error", err.response?.data?.message || "Error al registrar usuario");
    }
  };

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/v1/auth/reg_admin", adminFormData, { withCredentials: true });
      showAlert("success", `Admin ${adminFormData.email} registrado`);
      setShowRegisterAdminModal(false);
      setAdminFormData({ name: "", email: "", password: "" });
    } catch (err) {
      console.error(err);
      showAlert("error", err.response?.data?.message || "Error al registrar admin");
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Eliminar a ${user.name}?`)) return;
    try {
      await deleteUser(user.firebase_uid);
      showAlert("success", `Usuario ${user.name} eliminado`);
      fetchUsers();
    } catch (err) {
      showAlert("error", err.message || "Error al eliminar usuario");
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const stats = {
    total: users.length,
    providers: users.filter(u => u.role === "provider").length,
    clients: users.filter(u => u.role === "client").length,
  };

  return (
    <Box mih="100vh" bg="gray.0">
      <Stack maw={1280} mx="auto" p="md" gap="md">

        {/* Header */}
        <Paper withBorder p="lg" >
          <Group justify="space-between" wrap="wrap">
            <Box>
              <Title order={1} fz="1.875rem" fw={600} c="gray.8">
                Panel de Administración
              </Title>
              <Text size="sm" c="gray.5" mt={4}>Gestiona usuarios del sistema</Text>
            </Box>
            <Group gap="sm">
              <Button
                leftSection={<UserPlus size={18} />}
                onClick={() => setShowRegisterModal(true)}
              >
                Nuevo Usuario
              </Button>
              <Button
                leftSection={<UserPlus size={18} />}
                color="dark"
                onClick={() => setShowRegisterAdminModal(true)}
              >
                Nuevo Admin
              </Button>
            </Group>
          </Group>
        </Paper>

        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}

        {/* Stats */}
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <Paper withBorder p="lg"  ta="center">
            <Text size="xs" fw={300} c="gray.5" tt="uppercase">Total Usuarios</Text>
            <Text fz="1.875rem" fw={600} c="gray.8" mt="xs">{stats.total}</Text>
          </Paper>
          <Paper withBorder p="lg"  ta="center">
            <Text size="xs" fw={300} c="gray.5" tt="uppercase">Proveedores</Text>
            <Text fz="1.875rem" fw={600} c="blue.6" mt="xs">{stats.providers}</Text>
          </Paper>
          <Paper withBorder p="lg"  ta="center">
            <Text size="xs" fw={300} c="gray.5" tt="uppercase">Clientes</Text>
            <Text fz="1.875rem" fw={600} c="violet.6" mt="xs">{stats.clients}</Text>
          </Paper>
        </SimpleGrid>

        {/* Filters */}
        <Paper withBorder p="md" >
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
                onChange={setFilterRole}
                
                data={[
                  { value: "all", label: "Todos los roles" },
                  { value: "provider", label: "Proveedores" },
                  { value: "client", label: "Clientes" },
                ]}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Users List */}
        <Paper withBorder p="lg" >
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

      {/* Register User Modal */}
      <Modal
        opened={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Registrar Nuevo Usuario"
        
      >
        <form onSubmit={handleRegister}>
          <Stack gap="sm">
            <TextInput
              label="Nombre"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.currentTarget.value })}
              
              required
            />
            <TextInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.currentTarget.value })}
              
              required
            />
            <PasswordInput
              label="Contraseña"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.currentTarget.value })}
              
              required
            />
            <Select
              label="Rol"
              value={formData.role}
              onChange={val => setFormData({ ...formData, role: val })}
              
              data={[
                { value: "client", label: "Cliente" },
                { value: "provider", label: "Proveedor" },
              ]}
            />
            <Group grow mt="sm">
              <Button variant="default"  onClick={() => setShowRegisterModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" >
                Registrar
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Register Admin Modal */}
      <Modal
        opened={showRegisterAdminModal}
        onClose={() => setShowRegisterAdminModal(false)}
        title="Registrar Nuevo Administrador"
        
      >
        <form onSubmit={handleRegisterAdmin}>
          <Stack gap="sm">
            <MantineAlert color="yellow" >
              ⚠️ Los administradores tienen acceso completo al sistema.
            </MantineAlert>
            <TextInput
              label="Nombre"
              value={adminFormData.name}
              onChange={e => setAdminFormData({ ...adminFormData, name: e.currentTarget.value })}
              
              required
            />
            <TextInput
              label="Email"
              type="email"
              value={adminFormData.email}
              onChange={e => setAdminFormData({ ...adminFormData, email: e.currentTarget.value })}
              
              required
            />
            <PasswordInput
              label="Contraseña"
              value={adminFormData.password}
              onChange={e => setAdminFormData({ ...adminFormData, password: e.currentTarget.value })}
              
              required
            />
            <Group grow mt="sm">
              <Button variant="default"  onClick={() => setShowRegisterAdminModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" color="dark" >
                Registrar Admin
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}