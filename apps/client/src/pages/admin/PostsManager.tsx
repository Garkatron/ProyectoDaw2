import { useEffect, useState } from "react";
import {
  Stack, Title, Text, Paper, Group, Button,
  TextInput, Textarea, ActionIcon,
  Skeleton, Alert, Modal,
} from "@mantine/core";
import { Pencil, Trash2, Plus, AlertCircle, X, Check } from "lucide-react";
import Base from "../../layouts/Base";
import { useAuthStore } from "../../stores/auth.store";
import { API } from "../../lib/api";
import type { Post } from "@limpora/common";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion.div;

interface PostForm {
  title: string;
  content: string;
}

const emptyForm: PostForm = { title: "", content: "" };

function PostFormInline({ form, setForm, submitting, editingId, onCancel, onSubmit }: {
  form: PostForm;
  setForm: React.Dispatch<React.SetStateAction<PostForm>>;
  submitting: boolean;
  editingId: number | null;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <Paper withBorder radius="lg" p="xl">
      <Stack gap="md">
        <TextInput
          label="Título"
          radius="md"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <Textarea
          label="Contenido"
          radius="md"
          autosize
          minRows={5}
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" radius="md" leftSection={<X size={14} />} onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            radius="md"
            leftSection={<Check size={14} />}
            loading={submitting}
            disabled={!form.title.trim() || !form.content.trim()}
            onClick={onSubmit}
          >
            {editingId ? "Guardar cambios" : "Publicar"}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}

export default function PostsManager() {
  const user = useAuthStore((s) => s.user);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await API.post.get();
    if (err) setError(String(err));
    else setPosts((data as Post[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setCreating(true);
  };

  const openEdit = (post: Post) => {
    setCreating(false);
    setEditingId(post.id);
    setForm({ title: post.title, content: post.content });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCreating(false);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    const { error: err } = editingId
      ? await API.post({ id: editingId }).patch({ title: form.title, content: form.content })
      : await API.post.post({ title: form.title, content: form.content });
    if (err) setError(String(err));
    else { cancelEdit(); fetchPosts(); }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    const { error: err } = await API.post({ id }).delete();
    if (err) setError(String(err));
    else fetchPosts();
  };

  return (
    <Base>
      <Stack maw={768} mx="auto" p="lg" gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1} fz="1.5rem" fw={600}>Posts</Title>
          {!creating && !editingId && (
            <Button leftSection={<Plus size={15} />} radius="xl" size="sm" onClick={openCreate}>
              Nuevo post
            </Button>
          )}
        </Group>

        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" radius="md" withCloseButton
            onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <AnimatePresence>
          {creating && (
            <MotionDiv
              key="create-form"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PostFormInline
                form={form}
                setForm={setForm}
                submitting={submitting}
                editingId={editingId}
                onCancel={cancelEdit}
                onSubmit={handleSubmit}
              />
            </MotionDiv>
          )}
        </AnimatePresence>

        {loading ? (
          <Stack gap="sm">
            {[1, 2, 3].map((i) => <Skeleton key={i} height={100} radius="lg" />)}
          </Stack>
        ) : posts.length === 0 && !creating ? (
          <Paper withBorder radius="lg" p="xl">
            <Text size="sm" ta="center" c="dimmed">Sin posts todavía.</Text>
          </Paper>
        ) : (
          <Stack gap="sm">
            <AnimatePresence>
              {posts.map((post, i) => (
                <MotionDiv
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                >
                  {editingId === post.id ? (
                    <PostFormInline
                      form={form}
                      setForm={setForm}
                      submitting={submitting}
                      editingId={editingId}
                      onCancel={cancelEdit}
                      onSubmit={handleSubmit}
                    />
                  ) : (
                    <Paper withBorder radius="lg" p="xl">
                      <Stack gap="sm">
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Text fw={500} size="md" style={{ flex: 1 }}>{post.title}</Text>
                          <Group gap={4} wrap="nowrap">
                            <ActionIcon variant="subtle" size="sm" onClick={() => openEdit(post)}>
                              <Pencil size={14} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="red" size="sm"
                              onClick={() => setDeleteTarget(post.id)}>
                              <Trash2 size={14} />
                            </ActionIcon>
                          </Group>
                        </Group>
                        <Text size="sm" lh={1.75} c="dimmed">{post.content}</Text>
                      </Stack>
                    </Paper>
                  )}
                </MotionDiv>
              ))}
            </AnimatePresence>
          </Stack>
        )}
      </Stack>

      <Modal
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar post"
        centered
        size="sm"
        radius="lg"
      >
        <Text size="sm" c="dimmed" mb="lg">Esta acción no se puede deshacer.</Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" radius="md" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button color="red" radius="md" onClick={() => {
            handleDelete(deleteTarget!);
            setDeleteTarget(null);
          }}>
            Eliminar
          </Button>
        </Group>
      </Modal>
    </Base>
  );
}