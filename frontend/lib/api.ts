import axios, { type AxiosError } from "axios"
import type {
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  User,
  Course,
  CourseListResponse,
  EnrolledCourse,
  EnrollmentUser,
  UserListResponse,
  UploadResponse,
  Activity,
  CareRecord,
} from "./types"
import { useAuthStore } from "./store"

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = typeof window === "undefined" ? null : localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean })
    const isRefreshRequest = originalRequest?.url === "/refresh"

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
      const refreshToken = useAuthStore.getState().refreshToken || localStorage.getItem("refreshToken")
      if (refreshToken) {
        originalRequest._retry = true
        try {
          const response = await api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
            "/refresh",
            undefined,
            { headers: { Authorization: `Bearer ${refreshToken}` } },
          )
          const tokens = response.data.data
          useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken)
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
          return api(originalRequest)
        } catch {
          // The refresh interceptor below clears the expired session.
        }
      }

      useAuthStore.getState().clearAuth()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth APIs
export const authApi = {
  register: (username: string, password: string) =>
    api.post<ApiResponse<RegisterResponse>>("/register", { username, password }),

  login: (username: string, password: string) => api.post<ApiResponse<LoginResponse>>("/login", { username, password }),
  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>("/refresh", undefined, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    }),
}

// User APIs
export const userApi = {
  getUser: (id: number) => api.get<ApiResponse<User>>(`/user/${id}`),

  updateUser: (id: number, data: Partial<User>) => api.put<ApiResponse>(`/user/${id}`, data),
}

// Course APIs
export const courseApi = {
  getCourses: (params?: {
    category?: string
    keyword?: string
    page?: number
    pageSize?: number
  }) => api.get<ApiResponse<CourseListResponse>>("/courses", { params }),

  getCourse: (id: number) => api.get<ApiResponse<Course>>(`/course/${id}`),

  createCourse: (data: Partial<Course>) => api.post<ApiResponse<{ course_id: number }>>("/course", data),

  updateCourse: (id: number, data: Partial<Course>) => api.put<ApiResponse>(`/course/${id}`, data),

  deleteCourse: (id: number) => api.delete<ApiResponse>(`/course/${id}`),
}

// Enrollment APIs
export const enrollmentApi = {
  enroll: (course_id: number) => api.post<ApiResponse>("/enroll", { course_id }),

  cancelEnroll: (id: number) => api.delete<ApiResponse>(`/enroll/${id}`),

  getUserEnrollments: (userId: number) => api.get<ApiResponse<EnrolledCourse[]>>(`/enroll/user/${userId}`),

  getCourseEnrollments: (course_id: number) => api.get<ApiResponse<EnrollmentUser[]>>(`/enroll/course/${course_id}`),
}

// Admin APIs
export const adminApi = {
  getUsers: (params?: { keyword?: string; page?: number; pageSize?: number }) =>
    api.get<ApiResponse<UserListResponse>>("/admin/users", { params }),

  deleteUser: (id: number) => api.delete<ApiResponse>(`/admin/user/${id}`),

  updateUserRole: (id: number, role: User["role"]) =>
    api.put<ApiResponse>(`/admin/user/${id}/role`, { role }),
}

export const activityApi = {
  getUpcoming: (limit = 20) => api.get<ApiResponse<Activity[]>>("/activities", { params: { limit } }),
  create: (data: Omit<Activity, "activityId" | "publisherId" | "publisherName">) =>
    api.post<ApiResponse<{ activityId: number }>>("/activities", data),
  delete: (id: number) => api.delete<ApiResponse>(`/activities/${id}`),
}

export const careApi = {
  getElders: () => api.get<ApiResponse<User[]>>("/care/users"),
  getRecords: (userId: number) => api.get<ApiResponse<CareRecord[]>>(`/care-records/user/${userId}`),
  createRecord: (data: {
    userId: number
    physicalStatus: string
    mentalStatus: string
    checkDetails?: string
    checkedAt?: string
    advice?: string
  }) => api.post<ApiResponse<{ recordId: number }>>("/care-records", data),
  deleteRecord: (recordId: number) => api.delete<ApiResponse>(`/care-records/${recordId}`),
}

// Upload API
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post<ApiResponse<UploadResponse>>("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then(response => {
      // 如果上传成功，自动拼接完整的图片URL
      if (response.data.code === 200 && response.data.data.image_url) {
        const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ""
        response.data.data.image_url = imageBaseUrl + response.data.data.image_url
      }
      return response
    })
  },
}

export default api
