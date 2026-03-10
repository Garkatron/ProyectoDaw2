import { useState } from 'react';
import { Modal, Button, FileInput, Stack } from '@mantine/core';

export const EditProfileImageModal = ({ opened, onClose, onSubmit, submitting }) => {
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async () => {
        if (!file) return;
        await onSubmit(file);
        onClose();
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Update profile picture">
            <Stack>
                <FileInput
                    label="Profile picture"
                    placeholder="Click to select image"
                    accept="image/jpeg,image/png,image/webp"
                    leftSection={ "upload" }
                    value={file}
                    onChange={setFile}
                />
                <Button
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={!file}
                    fullWidth
                >
                    Save
                </Button>
            </Stack>
        </Modal>
    );
};