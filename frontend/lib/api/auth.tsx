import { Review, UserProfile, UserRegisterFormData } from "../types";
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
    const res = await apiClientAuth().get("/api/v1/user/auth/secure/profile")
    return res;
  },
  async updateInformation(user: UserProfile, avatarFile?: File) {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify({
        bio: user.bio,
        firstName: user.firstName,
        lastName: user.lastName,
        city: user.city,
        dateOfBirth: user.dateOfBirth,
      })], { type: "application/json" })
    );
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const res = await apiClientAuth().patch(
      "/api/v1/user/auth/update-info",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    // Backend expects { oldPassword, newPassword } and a POST request
    const payload = { oldPassword: currentPassword, newPassword };
    const res = await apiClientAuth().post("/api/v1/user/auth/change-password", payload);
    return res;
  },
  async deleteAccount() {
    const res = await apiClientAuth().delete("/api/v1/user/auth/delete");
    return res;
  }
};
