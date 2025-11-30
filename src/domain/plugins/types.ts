
export type PluginEventType =
    | 'USER_REGISTERED'
    | 'CV_CREATED'
    | 'SUBSCRIPTION_UPGRADED'
    | 'PAYMENT_FAILED';

export interface PluginEvent<T = any> {
    type: PluginEventType;
    payload: T;
    timestamp: Date;
}

export interface PluginManifest {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    permissions: string[];
}

export interface Plugin {
    manifest: PluginManifest;
    onInit(): Promise<void>;
    onEvent(event: PluginEvent): Promise<void>;
    onShutdown(): Promise<void>;
}
