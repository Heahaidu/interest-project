import axios from "axios";
import { apiClient } from "./clients";
import type { AxiosRequestConfig } from "axios";

export interface ListNotificationRough {
    items: any[],
    nextCursorCreatedAt: string | null;
    nextCursorUuid: string;
}

/**
 * - GET    /notifications
 * - PATCH  /notifications/{id}/read
 * - PATCH  /notifications/read-all
 */

const api = axios.create({ baseURL: 'http://localhost:8081/api/v1'});

export const notificationsApi = {

    async list(
    ): Promise<ListNotificationRough> {
        const res = await api.get<ListNotificationRough>(
            "/notifications",
            {headers: { 'X-User-UUID' : '11111111-1111-1111-1111-111111111111'}}
        );
        return res.data;
    },

    async markAsRead(id: string) {
        const res = await api.get(
            `/notifications/${id}/read`,
            {headers: { 'X-User-UUID' : '11111111-1111-1111-1111-111111111111'}}
        );
        return res.data;
    },

    markAllAsRead: async () => {
        const res = await api.get(
            "/notifications/read-all",
            {headers: { 'X-User-UUID' : '11111111-1111-1111-1111-111111111111'}}
        );
        return res.data;
    },

};
