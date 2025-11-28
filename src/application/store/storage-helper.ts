import { useSettingsStore } from './settings-store';
import { useAuthStore } from './auth-store';
import { LocalStorageService } from '../services/storage/local-storage-service';
import { CloudStorageService } from '../services/storage/cloud-storage-service';
import { type StorageService } from '../services/storage/storage-service';

const localService = new LocalStorageService();
const cloudService = new CloudStorageService();

export const getStorageService = (): StorageService => {
    const { storageMode } = useSettingsStore.getState();
    const { isAuthenticated } = useAuthStore.getState();

    if (storageMode === 'cloud' && isAuthenticated) {
        return cloudService;
    }
    return localService;
};
