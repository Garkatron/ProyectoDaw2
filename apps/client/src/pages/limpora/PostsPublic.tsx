import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Stack, Title, Text, Paper, Group, Skeleton, Alert, Avatar,
  Divider
} from "@mantine/core";
import { AlertCircle, Calendar } from "lucide-react";
import Base from "../../layouts/Base";
import { API } from "../../lib/api";
import type { Post } from "@limpora/common";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

function formatDate(iso: string, long = false) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: long ? "long" : "short",
    year: "numeric",
  });
}

const MotionDiv = motion.div;

function PostCard({ post, index }: { post: Post; index: number }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <Paper withBorder radius="lg" p="xl">
        <Stack gap="md">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Text fw={500} size="md" style={{ flex: 1 }}>{post.title}</Text>
            {post.created_at && (
              <Group gap={4} style={{ opacity: 0.5, flexShrink: 0 }}>
                <Calendar size={12} />
                <Text size="xs">{formatDate(post.created_at)}</Text>
              </Group>
            )}
          </Group>

          <div className="md-content">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          <Divider />
          <Group gap="xs">
            <Avatar size={24} radius="xl" color="blue">A</Avatar>
            <Text size="xs" c="dimmed">Admin · Limpora</Text>
          </Group>
        </Stack>
      </Paper>
    </MotionDiv>
  );
}

export function PostsPublicList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    API.news.get()
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

        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" radius="md">
            {error}
          </Alert>
        )}

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
            {posts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
          </Stack>
        )}
      </Stack>
    </Base>
  );
}

export function PostPublicDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    API.news({ id }).get({})
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
          <MotionDiv
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Stack gap="md">
              <Stack gap={4}>
                <Title
                  order={1}
                  fz={{ base: "1.4rem", sm: "1.8rem" }}
                  fw={600}
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {post.title}
                </Title>
                <Group gap="md" align="center">
                  <Group gap="xs">
                    <Avatar size={22} radius="xl" color="blue">A</Avatar>
                    <Text size="xs" c="dimmed">Admin · Limpora</Text>
                  </Group>
                  {post.created_at && (
                    <Group gap={4} style={{ opacity: 0.4 }}>
                      <Calendar size={12} />
                      <Text size="xs">{formatDate(post.created_at, true)}</Text>
                    </Group>
                  )}
                </Group>
              </Stack>

              <Paper withBorder radius="xl" p={{ base: "lg", sm: "xl" }}>
                <div style={{ fontSize: 14, lineHeight: 1.85, opacity: 0.85 }}>
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
              </Paper>
            </Stack>
          </MotionDiv>
        ) : null}
      </Stack>
    </Base>
  );
}