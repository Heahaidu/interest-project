import { Event, Review } from "../types";
import { apiClient } from "./clients";

export type GetEventsResponse = {
    items: Event[], 
    nextCursor: string | null,
    hasNext: boolean
};

export const eventApi = {
    async list(): Promise<GetEventsResponse> {
        const res = await apiClient.get<GetEventsResponse>('/api/v1/events');
        return res.data;
    },
    async get(id: string): Promise<Event> {
        const res = await apiClient.get<Event>(`/api/v1/event/${id}`);
        return res.data;
    },
    create(data: FormData) {
        return apiClient.post("/api/v1/event/create", data)
    },
    update(id: string, data: FormData) {
        return apiClient.put(`/events/${id}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
    },
    async edit(event: Event) {
        const res = await apiClient.post('/api/v1/event/edit', event);
        return res.data;
    },
    async register(id: string) {
        const res = await apiClient.get<Event>(`/api/v1/event/register/${id}`)
        return res.data
    },
    async unregister(id: string) {
        const res = await apiClient.get<Event>(`/api/v1/event/unregister/${id}`)
        return res.data
    },
    async interest(id: string) {
        const res = await apiClient.get<Event>(`/api/v1/event/interest/${id}`)
        return res.data
    },
    async uninterest(id: string) {
        const res = await apiClient.get<Event>(`/api/v1/event/uninterest/${id}`)
        return res.data
    },
    async rating(id: string, data: Review) {
        const res = await apiClient.post(`/api/v1/event/rating/${id}`, data)
        return res.data
    },
    async delete(id: string) {
        const res = await apiClient.get(`/api/v1/event/delete/${id}`)
        return res.data
    },
    async hide(id: string) {
        const res = await apiClient.get(`/api/v1/event/hide/${id}`)
        return res.data
    },
}