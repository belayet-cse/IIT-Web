const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = options
  const isFormData = rest.body instanceof FormData

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const message = Array.isArray(body?.message) ? body.message.join(" ") : body?.message
    throw new ApiError(res.status, message || `Request failed with status ${res.status}`)
  }

  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  name: string
  email: string
  role: "ADMIN" | "ALUMNI" | "USER"
  emailVerified: boolean
}

export function registerUser(data: { name: string; email: string; password: string }) {
  return apiFetch<{ accessToken: string; user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function loginUser(data: { email: string; password: string }) {
  return apiFetch<{ accessToken: string; user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function forgotPassword(email: string) {
  return apiFetch<{ success: boolean }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export function resetPassword(data: { token: string; password: string }) {
  return apiFetch<{ success: boolean }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// ── Alumni (public) ──────────────────────────────────────────────────────────

export interface AlumniStats {
  registeredAlumni: number
  certifiedAlumni: number
  countries: number
}

export interface AlumniPreviewEntry {
  initials: string
  name: string
  role: string
  org: string
}

export interface AlumniDirectoryEntry {
  initials: string
  name: string
  role: string
  org: string
  badgeVariant: "verified" | "honorary"
  avatarColor?: string
  country?: string
  certification?: string
  contact: { email: string; phone?: string }
}

export function getAlumniStats() {
  return apiFetch<AlumniStats>("/alumni/stats")
}

export function getAlumniPreview() {
  return apiFetch<AlumniPreviewEntry[]>("/alumni/preview")
}

export function getAlumniDirectory(
  token: string,
  params: { search?: string; certification?: string; country?: string } = {}
) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v) as [string, string][]
  ).toString()
  return apiFetch<AlumniDirectoryEntry[]>(`/alumni${query ? `?${query}` : ""}`, { token })
}

export interface ApplicationFormFields {
  fullName: string
  email: string
  phone: string
  linkedin?: string
  designation: string
  organization: string
  yearsExperience?: string
  careerStage?: string
  certification: string
  yearCompleted: string
}

export interface MyApplicationStatus {
  id: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  appliedAt: string
  rejectionReason?: string
}

export function getMyApplication(token: string) {
  return apiFetch<MyApplicationStatus | null>("/alumni/applications/me", { token })
}

export function submitAlumniApplication(fields: ApplicationFormFields, proofFile?: File | null) {
  const formData = new FormData()
  Object.entries(fields).forEach(([key, value]) => {
    if (value) formData.append(key, value)
  })
  if (proofFile) formData.append("proof", proofFile)

  return apiFetch<{ id: string }>("/alumni/applications", {
    method: "POST",
    body: formData,
  })
}

// ── Alumni (admin) ────────────────────────────────────────────────────────────

export interface PendingApplicationRow {
  id: string
  initials: string
  name: string
  email: string
  org: string
  cert: string
  applied: string
  proofFileUrl?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
}

export function getPendingApplications(token: string, status?: string) {
  const query = status ? `?status=${status}` : ""
  return apiFetch<PendingApplicationRow[]>(`/alumni/admin/applications${query}`, { token })
}

export function approveApplication(token: string, id: string) {
  return apiFetch(`/alumni/admin/applications/${id}/approve`, { method: "PATCH", token })
}

export function rejectApplication(token: string, id: string, reason?: string) {
  return apiFetch(`/alumni/admin/applications/${id}/reject`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ reason }),
  })
}

export interface AdminDirectoryRow {
  id: string
  initials: string
  avatarColor?: string
  name: string
  email: string
  org: string
  type: "verified" | "honorary"
  typeLabel: string
  batch: string
  status: "verified"
}

export function getAdminDirectory(token: string) {
  return apiFetch<AdminDirectoryRow[]>("/alumni/admin/directory", { token })
}

export function updateAlumni(
  token: string,
  id: string,
  data: { designation?: string; organization?: string; batch?: string; country?: string; certification?: string }
) {
  return apiFetch(`/alumni/admin/${id}`, { method: "PATCH", token, body: JSON.stringify(data) })
}

export interface HonoraryFormFields {
  name: string
  email: string
  designation: string
  organization: string
  bio?: string
}

export function createHonoraryAlumni(token: string, fields: HonoraryFormFields, photo?: File | null) {
  const formData = new FormData()
  Object.entries(fields).forEach(([key, value]) => {
    if (value) formData.append(key, value)
  })
  if (photo) formData.append("photo", photo)

  return apiFetch("/alumni/admin/honorary", { method: "POST", token, body: formData })
}

export interface PrivilegeRow {
  id: string
  initials: string
  avatarColor?: string
  name: string
  sub: string
  certDiscountPercent: number
  freeCertifications: string
  blogAccess: boolean
  forumAccess: boolean
}

export function getPrivilegesList(token: string, search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : ""
  return apiFetch<PrivilegeRow[]>(`/alumni/admin/privileges${query}`, { token })
}

export function updatePrivileges(
  token: string,
  id: string,
  data: Partial<Pick<PrivilegeRow, "certDiscountPercent" | "freeCertifications" | "blogAccess" | "forumAccess">>
) {
  return apiFetch(`/alumni/admin/${id}/privileges`, { method: "PATCH", token, body: JSON.stringify(data) })
}

export interface PrivilegeDefaults {
  certDiscountPercent: number
  blogDiscountPercent: number
}

export function getPrivilegeDefaults(token: string) {
  return apiFetch<PrivilegeDefaults>("/alumni/admin/privileges/defaults", { token })
}

export function updatePrivilegeDefaults(token: string, data: Partial<PrivilegeDefaults>) {
  return apiFetch<PrivilegeDefaults>("/alumni/admin/privileges/defaults", {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  })
}

// ── Blogs (public) ────────────────────────────────────────────────────────────

export type BlogStatus = "DRAFT" | "PUBLISHED"

export interface BlogSummary {
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  category: string | null
  readingTime: number
  price: number
  views: number
  author: string
  publishedAt: string | null
}

export interface BlogListResult {
  data: BlogSummary[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface PublicBlogDetail {
  title: string
  slug: string
  excerpt: string | null
  content: string
  featuredImage: string | null
  metaTitle: string | null
  metaDescription: string | null
  category: string | null
  readingTime: number
  price: number
  views: number
  author: string
  publishedAt: string | null
}

export function getBlogs(params: { search?: string; category?: string; page?: number; limit?: number } = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v).map(([k, v]) => [k, String(v)])
  ).toString()
  return apiFetch<BlogListResult>(`/blogs${query ? `?${query}` : ""}`)
}

export function getBlogBySlug(slug: string) {
  return apiFetch<PublicBlogDetail>(`/blogs/${slug}`)
}

// ── Blogs (admin) ─────────────────────────────────────────────────────────────

export interface AdminBlogRow {
  id: string
  title: string
  slug: string
  featuredImage: string | null
  category: string | null
  status: BlogStatus
  views: number
  readingTime: number
  author: string
  publishedAt: string | null
  updatedAt: string
}

export interface BlogDetail {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featuredImage: string | null
  metaTitle: string | null
  metaDescription: string | null
  category: string | null
  status: BlogStatus
  price: number
  readingTime: number
  views: number
  authorId: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface BlogFormFields {
  title: string
  slug?: string
  excerpt?: string
  content: string
  featuredImage?: string
  metaTitle?: string
  metaDescription?: string
  category?: string
  status?: BlogStatus
  price?: number
  readingTime?: number
}

export function getAdminBlogs(token: string, params: { search?: string; status?: BlogStatus } = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v) as [string, string][]
  ).toString()
  return apiFetch<AdminBlogRow[]>(`/blogs/admin${query ? `?${query}` : ""}`, { token })
}

export function getAdminBlog(token: string, id: string) {
  return apiFetch<BlogDetail>(`/blogs/admin/${id}`, { token })
}

export function createBlog(token: string, data: BlogFormFields) {
  return apiFetch<BlogDetail>("/blogs/admin", { method: "POST", token, body: JSON.stringify(data) })
}

export function updateBlog(token: string, id: string, data: Partial<BlogFormFields>) {
  return apiFetch<BlogDetail>(`/blogs/admin/${id}`, { method: "PATCH", token, body: JSON.stringify(data) })
}

export function deleteBlog(token: string, id: string) {
  return apiFetch<{ id: string }>(`/blogs/admin/${id}`, { method: "DELETE", token })
}

export function fileUrl(path?: string | null) {
  if (!path) return undefined
  const base = API_URL.replace(/\/api$/, "")
  return `${base}${path}`
}
