import { Review, UserRegisterFormData } from "../types";
import { apiClient, apiClientAuth } from "./clients";

export const authApi = {
  async register(user: UserRegisterFormData) {
    const res = await apiClient.post(`/api/v1/user/auth/register`, user);
    return res.data;
  },
  async verify(email: string, opt: string) {
    const res = await apiClient.post(`/api/v1/user/auth/verify`, null, {
      params: { email: email, otp: opt },
    });
    return res.data;
  },
  async login(email: string, password: string) {
    const res = await apiClient.post("/api/v1/user/auth/login", {
      email: email, password: password
    })
    return res;
  },
  async getProfile() {
    const res = await apiClientAuth().get("/api/v1/user/secure/profile")
    return res;
  }
};
