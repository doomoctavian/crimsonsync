/**
 * Upload service — document and avatar uploads with validation.
 */
import * as uploadApi from '../api/upload.api.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export function validateFile(file, { maxSize = MAX_FILE_SIZE, allowedTypes = ALLOWED_DOC_TYPES } = {}) {
    if (!file) return 'No file selected';
    if (file.size > maxSize) return `File must be under ${maxSize / 1024 / 1024} MB`;
    if (allowedTypes.length && !allowedTypes.includes(file.type)) {
        return 'File type not supported. Use PDF, JPG, or PNG.';
    }
    return null;
}

export async function uploadDocument(file, metadata = {}) {
    const error = validateFile(file);
    if (error) throw new Error(error);
    return uploadApi.uploadDocument(file, metadata);
}

export async function uploadAvatar(file) {
    const error = validateFile(file, {
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });
    if (error) throw new Error(error);
    return uploadApi.uploadAvatar(file);
}
