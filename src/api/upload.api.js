/**
 * Upload API — document and avatar uploads for verification/profile.
 * Compatible with Django FileField and FastAPI UploadFile endpoints.
 */
import { api } from './client.js';
import { config, ENDPOINTS } from '../config/index.js';

export async function uploadDocument(file, metadata = {}) {
    if (config.USE_MOCK_API) {
        await delay(500);
        return {
            id: 'doc_' + Date.now(),
            url: URL.createObjectURL(file),
            name: file.name,
            type: file.type,
            size: file.size,
            ...metadata,
        };
    }

    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, value);
    });

    return api.upload(ENDPOINTS.uploads.documents, formData);
}

export async function uploadAvatar(file) {
    if (config.USE_MOCK_API) {
        await delay(400);
        return {
            id: 'avatar_' + Date.now(),
            url: URL.createObjectURL(file),
            name: file.name,
        };
    }

    const formData = new FormData();
    formData.append('file', file);
    return api.upload(ENDPOINTS.uploads.avatar, formData);
}

function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
