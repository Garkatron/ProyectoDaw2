import { useState, useEffect } from "react"
import Base from "../../layouts/Base"
import { UserCard } from "../../components/UserCard"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import {
    Box, Button, Center, Group, Loader, Paper,
    SimpleGrid, Stack, Text, TextInput, Title,
} from "@mantine/core"
import { API } from "../../lib/api"

export default function UserFinder() {
    const [users, setUsers] = useState([])
    const [services, setServices] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [activeServices, setActiveServices] = useState([])

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300)
        return () => clearTimeout(handler)
    }, [searchTerm])

    useEffect(() => {
        fetchUsers()
        fetchServices()
    }, [])

    useEffect(() => {
        filterUsers()
    }, [debouncedSearch, activeServices, users])

    const fetchUsers = async () => {
        setLoading(true)
        const { data, error } = await API.user.get()

        if (error) {
            console.error(error)
        } else {
            const nonAdmin = (data ?? []).filter(u => u.role !== "admin" && u.role !== "client")
            setUsers(nonAdmin)
            setFilteredUsers(nonAdmin)
        }
        setLoading(false)
    }

    const fetchServices = async () => {
        const { data, error } = await API.services.get()

        if (error) {
            console.error(error)
        } else {
            setServices(data ?? [])
        }
    }

    const filterUsers = () => {
        let filtered = users
        if (debouncedSearch)
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(debouncedSearch.toLowerCase())
            )
        if (activeServices.length > 0)
            filtered = filtered.filter(u =>
                u.services?.some(s => activeServices.includes(s.name))
            )
        setFilteredUsers(filtered)
    }

    const toggleService = (serviceName: string) => {
        setActiveServices(prev =>
            prev.includes(serviceName)
                ? prev.filter(s => s !== serviceName)
                : [...prev, serviceName]
        )
    }

    const clearFilters = () => {
        setSearchTerm("")
        setActiveServices([])
    }

    const hasFilters = activeServices.length > 0 || searchTerm

    return (
        <Base>
            <Stack gap="lg">
                <Paper withBorder p="lg">
                    <Stack gap="md">
                        <TextInput
                            placeholder="Buscar por nombre..."
                            leftSection={<Search size={18} />}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.currentTarget.value)}
                            size="md"
                        />
                        <Group gap="xs" wrap="wrap">
                            {services.map(s => (
                                <Button
                                    key={s.id}
                                    onClick={() => toggleService(s.name)}
                                    size="xs"
                                    radius="lg"
                                    variant={activeServices.includes(s.name) ? "filled" : "light"}
                                    color={activeServices.includes(s.name) ? "blue" : "gray"}
                                >
                                    {s.name}
                                </Button>
                            ))}
                        </Group>
                        {hasFilters && (
                            <Button onClick={clearFilters} size="xs" variant="light" color="red">
                                Limpiar filtros
                            </Button>
                        )}
                    </Stack>
                </Paper>

                <Paper withBorder p="lg">
                    <Title order={2} fz="1.25rem" fw={600} mb="lg">
                        Usuarios ({filteredUsers.length})
                    </Title>
                    {loading ? (
                        <Center py={64}><Loader size="lg" /></Center>
                    ) : filteredUsers.length === 0 ? (
                        <Text ta="center" py={64} fz="lg">No se encontraron usuarios</Text>
                    ) : (
                        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                            {filteredUsers.map(user => (
                                <Link
                                    key={user.id}
                                    to="/booking"
                                    state={{ userId: user.id }}
                                    style={{ textDecoration: "none" }}
                                >
                                    <Box
                                        style={{ transition: "transform 0.2s" }}
                                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                    >
                                        <UserCard user={user} />
                                    </Box>
                                </Link>
                            ))}
                        </SimpleGrid>
                    )}
                </Paper>
            </Stack>
        </Base>
    )
}