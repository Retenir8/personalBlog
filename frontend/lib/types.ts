// API Response wrapper
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// User role type
export type UserRole = "admin" | "teacher" | "caregiver" | "user"

// User types
export interface User {
  userId: number
  name: string
  gender?: "男" | "女" |string
  age?: number
  phone?: string
  avatarUrl?: string
  hobbies?: string
  healthCondition?: string
  emergencyContact?: string
  last_login_time?: string
  status: number
  role?: UserRole
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RegisterResponse {
  userId: number
  accessToken: string
  refreshToken: string
}

// Course types
export interface Course {
  course_id: number
  title: string
  category: string
  description: string
  start_date?: string
  end_date?: string
  class_time: string
  location: string
  capacity: number
  enrolled: number
  status: 0 | 1 | 2 // 0=未开始, 1=进行中, 2=已结课
  image_url?: string
  contact_phone?: string
  create_time?: string
  update_time?: string
}

export interface CourseListResponse {
  list: Course[]
  total: number
}

// Enrollment types
export interface EnrolledCourse {
  enrollment_id: number
  course_id: number
  title: string
  class_time: string
  location: string
  status: number
  imageUrl?: string
}

export interface EnrollmentUser {
  userId: number
  user_id: number
  name: string
  gender?: string
  avatarUrl?: string
  avatar_url?: string
  hobbies?: string
  health_condition?: string
}

// Admin types
export interface UserListResponse {
  list: User[]
  total: number
}

// Upload types
export interface UploadResponse {
  image_url: string
}

export interface Activity {
  activityId: number
  title: string
  summary?: string
  activityDate: string
  location: string
  contactPhone?: string
  publisherId: number
  publisherName: string
}

export interface CareRecord {
  recordId: number
  userId: number
  elderName: string
  recorderId: number
  recorderName: string
  physicalStatus: string
  mentalStatus: string
  checkDetails?: string
  checkedAt: string
  advice?: string
  createdAt: string
}
