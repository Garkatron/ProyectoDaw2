import { useEffect, useState } from "react";
import {
  Stack, Title, Text, Paper, Group, Button,
  TextInput, Textarea, Modal, Badge, ActionIcon,
  Skeleton, Alert,
} from "@mantine/core";
import { Pencil, Trash2, Plus, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import Base from "../../layouts/Base";
import { useAuthStore } from "../../stores/auth.store";
import { API } from "../../lib/api";
import type { Post } from "@limpora/common";


interface PostForm {
  title: string;
  content: string;
}

const emptyForm: PostForm = { title: "", content: "" };

export default function PostsManager() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch ──
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await API.post.get({});
    if (err) setError(String(err));
    else setPosts((data as Post[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  // ── Modal ──
  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (post: Post) => { setEditing(post); setForm({ title: post.title, content: post.content }); setModalOpen(true); };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    const { error: err } = editing
      ? await API.post.put({ id: editing.id, content: form.content, title: form.title })
      : await API.post.post(form);
    if (err) setError(String(err));
    else { setModalOpen(false); fetchPosts(); }
    setSubmitting(false);
  };

  // ── Delete ──
  const handleDelete = async (id: number) => {
    if (!confirm("Eliminar este post?")) return;
    const { error: err } = await API.post({ id }).delete();
    if (err) setError(String(err));
    else fetchPosts();
  };

  return (
    <Base>
      <Stack maw={768} mx="auto" p="lg" gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1} fz="1.5rem" fw={600}>Posts</Title>
          <Button leftSection={<Plus size={15} />} radius="xl" size="sm" onClick={openCreate}>
            Nuevo post
          </Button>
        </Group>

        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" radius="md">{error}</Alert>
        )}

        {loading ? (
          <Stack gap="sm">
            {[1, 2, 3].map((i) => <Skeleton key={i} height={80} radius="xl" />)}
          </Stack>
        ) : posts.length === 0 ? (
          <Paper withBorder radius="xl" p="xl">
            <Text size="sm" ta="center" style={{ opacity: 0.55 }}>Sin posts todavía.</Text>
          </Paper>
        ) : (
          <Stack gap="sm">
            {posts.map((post) => (
              <Paper key={post.id} withBorder radius="xl" p="md">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                    <Group gap="xs">
                      <Text fw={600} size="sm" truncate>{post.title}</Text>
                      {post.user_id === user?.id && (
                        <Badge size="xs" variant="light" radius="xl">tuyo</Badge>
                      )}
                    </Group>
                    <Text size="xs" lineClamp={2} style={{ opacity: 0.65 }}>{post.content}</Text>
                  </Stack>
                  {post.user_id === user?.id && (
                    <Group gap={4} wrap="nowrap">
                      <ActionIcon variant="subtle" size="sm" onClick={() => openEdit(post)}>
                        <Pencil size={14} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDelete(post.id)}>
                        <Trash2 size={14} />
                      </ActionIcon>
                    </Group>
                  )}
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? "Editar post" : "Nuevo post"} radius="xl" centered>
        <Stack gap="md">
          <TextInput label="Título" radius="md" value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Textarea label="Contenido" radius="md" autosize minRows={4} value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
          <Button radius="xl" loading={submitting}
            disabled={!form.title.trim() || !form.content.trim()}
            onClick={handleSubmit}>
            {editing ? "Guardar cambios" : "Crear"}
          </Button>
        </Stack>
      </Modal>
    </Base>
  );
}