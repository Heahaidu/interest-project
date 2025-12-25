import { Event, Review } from "../types";
import { apiClient } from "./clients";

export type GetEventsResponse = {
    items: Event[], 
    nextCursor: string | null,
    hasNext: boolean
};

export const eventApi = {
    async list(): Promise<GetEventsResponse> {
        const res = await apiClient.get<GetEventsResponse>('/events');
        return res.data;
    },
    async get(id: string): Promise<Event> {
        const res = await apiClient.get<Event>(`/event/${id}`);
        return res.data;
    },
    create(data: FormData) {
        return apiClient.post("/event/create", data, 
            {headers: { 'X-User-UUID' : '11111111-1111-1111-1111-111111111111'}}
        )
    },
    update(id: string, data: FormData) {
        return apiClient.put(`/events/${id}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
    },
    async edit(event: Event) {
        const res = await apiClient.post('/event/edit', event);
        return res.data;
    },
    async register(id: string) {
        const res = await apiClient.get<Event>(`/event/register/${id}`)
        return res.data
    },
    async unregister(id: string) {
        const res = await apiClient.get<Event>(`/event/unregister/${id}`)
        return res.data
    },
    async interest(id: string) {
        const res = await apiClient.get<Event>(`/event/interest/${id}`)
        return res.data
    },
    async uninterest(id: string) {
        const res = await apiClient.get<Event>(`/event/uninterest/${id}`)
        return res.data
    },
    async rating(id: string, data: Review) {
        const res = await apiClient.post(`/event/rating/${id}`, data)
        return res.data
    },
    async delete(id: string) {
        const res = await apiClient.get(`/event/delete/${id}`)
        return res.data
    },
    async hide(id: string) {
        const res = await apiClient.get(`/event/hide/${id}`)
        return res.data
    },
}