import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Stack, Title, Text, Paper, Group, Skeleton, Alert, Avatar,
} from "@mantine/core";
import { AlertCircle, Calendar } from "lucide-react";
import Base from "../../layouts/Base";
import { API } from "../../lib/api";
import type { Post } from "@limpora/common";


function formatDate(iso: string, long = false) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: long ? "long" : "short",
    year: "numeric",
  });
}

function PostCard({ post }: { post: Post }) {
  return (
    <Paper withBorder radius="xl" p="lg">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text fw={600} size="md" style={{ flex: 1 }}>{post.title}</Text>
          {post.created_at && (
            <Group gap={4} style={{ opacity: 0.45, flexShrink: 0 }}>
              <Calendar size={12} />
              <Text size="xs">{formatDate(post.created_at)}</Text>
            </Group>
          )}
        </Group>
        <Text size="sm" lh={1.75} style={{ opacity: 0.72 }} lineClamp={4}>
          {post.content}
        </Text>
        {post.user_id && (
          <Group gap="xs" mt={4}>
            <Avatar size={20} radius="xl" color="blue">{post.user_id}</Avatar>
            <Text size="xs" style={{ opacity: 0.55 }}>{post.user_id}</Text>
          </Group>
        )}
      </Stack>
    </Paper>
  );
}

export function PostsPublicList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    API.post.get()
      .then(({ data, error: err }) => {
        if (err) setError(String(err));
        else setPosts((data as Post[]) ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Base>
      <Stack maw={768} mx="auto" p="lg" gap="lg">
        <Title order={1} fz="1.5rem" fw={600}>Publicaciones</Title>

        {error && <Alert icon={<AlertCircle size={16} />} color="red" radius="md">{error}</Alert>}

        {loading ? (
          <Stack gap="sm">
            {[1, 2, 3].map((i) => <Skeleton key={i} height={120} radius="xl" />)}
          </Stack>
        ) : posts.length === 0 ? (
          <Paper withBorder radius="xl" p="xl">
            <Text size="sm" ta="center" style={{ opacity: 0.55 }}>Sin publicaciones.</Text>
          </Paper>
        ) : (
          <Stack gap="sm">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </Stack>
        )}
      </Stack>
    </Base>
  );
}

// ── Detalle ────────────────────────────────────────────────────────────────────
export function PostPublicDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    API.post({ id }).get({ })
      .then(({ data, error: err }) => {
        if (err) setError(String(err));
        else setPost(data as Post);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Base>
      <Stack maw={768} mx="auto" p="lg" gap="lg">
        {loading ? (
          <Stack gap="md">
            <Skeleton height={32} width="60%" radius="md" />
            <Skeleton height={200} radius="xl" />
          </Stack>
        ) : error ? (
          <Alert icon={<AlertCircle size={16} />} color="red" radius="md">{error}</Alert>
        ) : post ? (
          <>
            <Stack gap={4}>
              <Title order={1} fz={{ base: "1.4rem", sm: "1.8rem" }} fw={700}
                style={{ letterSpacing: "-0.02em" }}>
                {post.title}
              </Title>
              <Group gap="md" align="center">
                {post.user_id && (
                  <Group gap="xs">
                    <Avatar size={22} radius="xl" color="blue">{post.user_id}</Avatar>
                    <Text size="xs" style={{ opacity: 0.55 }}>{post.user_id}</Text>
                  </Group>
                )}
                {post.created_at && (
                  <Group gap={4} style={{ opacity: 0.4 }}>
                    <Calendar size={12} />
                    <Text size="xs">{formatDate(post.created_at, true)}</Text>
                  </Group>
                )}
              </Group>
            </Stack>

            <Paper withBorder radius="xl" p={{ base: "lg", sm: "xl" }}>
              <Text size="sm" lh={1.85} style={{ opacity: 0.8, whiteSpace: "pre-wrap" }}>
                {post.content}
              </Text>
            </Paper>
          </>
        ) : null}
      </Stack>
    </Base>
  );
}