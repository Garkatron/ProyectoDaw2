import lang from '../../../../utils/LangManager';
import ReviewCard from './cards/ReviewCard';
import {
    Alert,
    Button,
    Divider,
    Group,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    Title,
    UnstyledButton,
} from '@mantine/core';

export default function ReviewsSection({
    userReviews,
    canReview,
    reviewContent,
    setReviewContent,
    reviewRating,
    setReviewRating,
    reviewSubmitting,
    reviewSuccess,
    reviewError,
    onSubmit,
}) {
    return (
        <Stack gap="md">
            <Title order={2} fw={300} fz="xl">
                {lang('userpanel.title.reviews')}
            </Title>
            <Divider />

            {userReviews.length > 0 ? (
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    {userReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </SimpleGrid>
            ) : (
                <Text size="sm" c="dimmed">No hay reseñas aún.</Text>
            )}

            {canReview && (
                <Stack gap="sm" pt="sm">
                    <Divider />
                    <Title order={3} fw={300} fz="lg">Dejar una reseña</Title>

                    {reviewSuccess && (
                        <Alert color="green" variant="light">¡Reseña enviada correctamente!</Alert>
                    )}
                    {reviewError && (
                        <Alert color="red" variant="light">{reviewError}</Alert>
                    )}

                    <form onSubmit={onSubmit}>
                        <Stack gap="sm">
                            <Group gap={4}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <UnstyledButton
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewRating(star)}
                                        fz="1.5rem"
                                        style={{
                                            color: star <= reviewRating
                                                ? 'var(--mantine-color-yellow-4)'
                                                : 'var(--mantine-color-default-border)',
                                            transition: 'color 0.15s',
                                        }}
                                    >
                                        ★
                                    </UnstyledButton>
                                ))}
                            </Group>

                            <Textarea
                                value={reviewContent}
                                onChange={(e) => setReviewContent(e.target.value)}
                                required
                                placeholder="Escribe tu reseña..."
                                rows={3}
                                resize="none"
                            />

                            <Button
                                type="submit"
                                variant="default"
                                loading={reviewSubmitting}
                                w="fit-content"
                            >
                                Enviar reseña
                            </Button>
                        </Stack>
                    </form>
                </Stack>
            )}
        </Stack>
    );
}