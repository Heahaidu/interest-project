import axios from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ||  "http://localhost:8080";

export const endpoints = {
  // Auth
  "register": "/api/v1/user/register/account",
  "login": "/api/v1/user/auth/login",
  "verify-email": "/api/v1/user/register/verify-email",
  "profile": "/api/v1/user/secure/profile",
  "profile-update": "/api/v1/user/register/profile",

  // Page
  "page-update": "page-update",
  "page-delete": (id: string | number) => `page-delete/${id}`,
  "page-detail": (id: string | number) => `page-detail/${id}`,
  "pages-owner": "pages/owner",
  "pages": "pages",

  // Page Member
  "page-member-update": "page-member-update",
  "page-member-delete": (id: string | number) => `page-member-delete/${id}`,
  "page-member": (id: string | number) => `page-member/${id}`,
  "page-members": "page-members",

  // Page Follower
  "page-follower-update": (id: string | number) => `page-follower-update/${id}`,
  "page-follower-delete": (id: string | number) => `page-follower-delete/${id}`,
  "page-follower": (id: string | number) => `page-follower/${id}`,
  "page-followers": "page-followers",
};

export const authApis = () => {
  const token = getCookie("token");

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
