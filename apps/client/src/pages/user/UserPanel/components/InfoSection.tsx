import { useTranslation } from 'react-i18next';
import InfoCard from './cards/InfoCard';
import { Divider, Flex, Group, Title } from '@mantine/core';

export default function InfoSection({ targetUser }) {
    const { t } = useTranslation();

    return (
        <>
            <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'flex-start', md: 'center' }}
                gap="lg"
            >
                <Title order={1} fz="1.5rem" fw={600}>
                    {targetUser.name}
                </Title>

                <Group gap="md" wrap="wrap">
                    <InfoCard
                        label={t('userpanel.label.role')}
                        value={targetUser.role}
                    />
                </Group>
            </Flex>
            <Divider />
        </>
    );
}