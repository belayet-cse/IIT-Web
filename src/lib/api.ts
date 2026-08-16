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

export type UserRole = "ADMIN" | "ALUMNI" | "GENERAL" | "PREMIUM" | "RESEARCHER"
export type MembershipTier = "BASIC" | "PRO" | "ELITE"
export type RegistrationType = "GENERAL" | "PREMIUM" | "ALUMNI"
export type AlumniVerificationStatus = "NONE" | "PENDING" | "VERIFIED"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  emailVerified: boolean
  organization: string | null
  mustChangePassword: boolean
  alumniVerificationStatus: AlumniVerificationStatus
  desiredMembershipTier: MembershipTier | null
  membershipTier: MembershipTier | null
}

export interface RegisterFields {
  name: string
  email: string
  password: string
  phone?: string
  organization?: string
  registrationType: RegistrationType
  membershipTier?: MembershipTier
}

export function registerUser(data: RegisterFields) {
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

export interface MyProfile extends AuthUser {
  phone: string | null
  address: string | null
}

export function getMyProfile(token: string) {
  return apiFetch<MyProfile>("/auth/me", { token })
}

export function updateMyProfile(
  token: string,
  data: { name?: string; phone?: string; address?: string; organization?: string }
) {
  return apiFetch<MyProfile>("/auth/me", { method: "PATCH", token, body: JSON.stringify(data) })
}

export function changeMyPassword(token: string, data: { currentPassword: string; newPassword: string }) {
  return apiFetch<{ success: boolean }>("/auth/change-password", {
    method: "PATCH",
    token,
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

// ── Researchers ──────────────────────────────────────────────────────────────

export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface ResearcherApplicationFields {
  name: string
  email: string
  organization: string
  currentRole: string
  certifications?: string[]
  expertiseAreas?: string[]
  bio: string
  linkedinUrl?: string
}

export function submitResearcherApplication(data: ResearcherApplicationFields) {
  return apiFetch<{ id: string }>("/researchers/applications", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export interface MyResearcherApplicationStatus {
  id: string
  status: ApplicationStatus
  appliedAt: string
  reviewNote?: string
}

export function getMyResearcherApplication(token: string) {
  return apiFetch<MyResearcherApplicationStatus | null>("/researchers/applications/me", { token })
}

export interface ResearcherApplicationRow {
  id: string
  initials: string
  name: string
  email: string
  organization: string
  currentRole: string
  certifications: string[]
  expertiseAreas: string[]
  bio: string
  linkedinUrl?: string
  applied: string
  status: ApplicationStatus
}

export function getResearcherApplications(token: string, status?: ApplicationStatus) {
  const query = status ? `?status=${status}` : ""
  return apiFetch<ResearcherApplicationRow[]>(`/researchers/admin/applications${query}`, { token })
}

export function approveResearcherApplication(token: string, id: string) {
  return apiFetch<{ success: boolean }>(`/researchers/admin/applications/${id}/approve`, {
    method: "PATCH",
    token,
  })
}

export function rejectResearcherApplication(token: string, id: string, reviewNote?: string) {
  return apiFetch(`/researchers/admin/applications/${id}/reject`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ reviewNote }),
  })
}

// ── Membership ───────────────────────────────────────────────────────────────

export interface MembershipPlan {
  tier: MembershipTier
  displayName: string
  priceBdt: number
  priceUsd: number
  discountPercent: number
  updatedAt: string
}

export function getMembershipPlans() {
  return apiFetch<MembershipPlan[]>("/membership/plans")
}

export function updateMembershipPlan(
  token: string,
  tier: MembershipTier,
  data: { displayName?: string; priceBdt?: number; priceUsd?: number; discountPercent?: number }
) {
  return apiFetch<MembershipPlan>(`/membership/admin/plans/${tier}`, { method: "PATCH", token, body: JSON.stringify(data) })
}

export interface PriceCalculation {
  originalPrice: number
  discountPercent: number
  discountAmount: number
  finalPrice: number
}

export function calculatePrice(token: string, price: number) {
  return apiFetch<PriceCalculation>("/membership/calculate-price", { method: "POST", token, body: JSON.stringify({ price }) })
}

export function expressMembershipInterest(token: string, membershipTier: MembershipTier) {
  return apiFetch<{ desiredMembershipTier: MembershipTier }>("/membership/express-interest", {
    method: "POST",
    token,
    body: JSON.stringify({ membershipTier }),
  })
}

export function runMembershipExpiryCheck(token: string) {
  return apiFetch<{ remindersSent: number; downgraded: number }>("/membership/admin/run-expiry-check", {
    method: "POST",
    token,
  })
}

// ── Payments ─────────────────────────────────────────────────────────────────

export type PaymentCurrency = "BDT" | "USD"
export type PaymentGateway = "SSLCOMMERZ" | "STRIPE" | "MANUAL"
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED"

export interface Payment {
  id: string
  type: "MEMBERSHIP" | "BLOG" | "RESEARCH" | "PROGRAM"
  membershipTier: MembershipTier | null
  blogId: string | null
  paperId: string | null
  programId: string | null
  currency: PaymentCurrency
  amount: number
  status: PaymentStatus
  message: string
  checkoutUrl: string | null
  live: boolean
  finalPrice?: number
}

export interface AdminPaymentRow {
  id: string
  userName: string
  userEmail: string
  type: "MEMBERSHIP" | "BLOG" | "RESEARCH" | "PROGRAM"
  membershipTier: MembershipTier | null
  blogTitle: string | null
  paperTitle: string | null
  programTitle: string | null
  currency: PaymentCurrency
  amount: number
  discountPercent: number
  gateway: PaymentGateway | null
  status: PaymentStatus
  note: string | null
  createdAt: string
}

export function getSuggestedCurrency() {
  return apiFetch<{ currency: PaymentCurrency }>("/payments/suggested-currency")
}

export function createCheckout(token: string, membershipTier: MembershipTier, currency: PaymentCurrency) {
  return apiFetch<Payment>("/payments/checkout", {
    method: "POST",
    token,
    body: JSON.stringify({ type: "MEMBERSHIP", membershipTier, currency }),
  })
}

export function createBlogCheckout(token: string, blogId: string, currency: PaymentCurrency) {
  return apiFetch<Payment>("/payments/checkout", {
    method: "POST",
    token,
    body: JSON.stringify({ type: "BLOG", blogId, currency }),
  })
}

export function createResearchCheckout(token: string, paperId: string, currency: PaymentCurrency) {
  return apiFetch<Payment>("/payments/checkout", {
    method: "POST",
    token,
    body: JSON.stringify({ type: "RESEARCH", paperId, currency }),
  })
}

export function createProgramCheckout(token: string, programId: string, currency: PaymentCurrency) {
  return apiFetch<Payment>("/payments/checkout", {
    method: "POST",
    token,
    body: JSON.stringify({ type: "PROGRAM", programId, currency }),
  })
}

export function getAdminPayments(token: string, status?: PaymentStatus) {
  return apiFetch<AdminPaymentRow[]>(`/payments/admin${status ? `?status=${status}` : ""}`, { token })
}

export function markPaymentPaid(token: string, id: string, note?: string) {
  return apiFetch<{ success: boolean }>(`/payments/admin/${id}/mark-paid`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ note }),
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
  tags: string[]
  readingTime: number
  priceBdt: number
  priceUsd: number
  views: number
  author: string
  publishedAt: string | null
}

export interface BlogListResult {
  data: BlogSummary[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface PublicBlogDetail {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  locked: boolean
  featuredImage: string | null
  metaTitle: string | null
  metaDescription: string | null
  category: string | null
  tags: string[]
  readingTime: number
  priceBdt: number
  priceUsd: number
  discountPercent: number
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

export function getBlogBySlug(slug: string, token?: string) {
  return apiFetch<PublicBlogDetail>(`/blogs/${slug}`, { token })
}

// ── Blogs (admin) ─────────────────────────────────────────────────────────────

export interface AdminBlogRow {
  id: string
  title: string
  slug: string
  featuredImage: string | null
  category: string | null
  tags: string[]
  sequence: number
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
  tags: string[]
  status: BlogStatus
  priceBdt: number
  priceUsd: number
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
  tags?: string[]
  status?: BlogStatus
  priceBdt?: number
  priceUsd?: number
  readingTime?: number
}

export function getAdminBlogs(
  token: string,
  params: { search?: string; status?: BlogStatus; category?: string } = {}
) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v) as [string, string][]
  ).toString()
  return apiFetch<AdminBlogRow[]>(`/blogs/admin${query ? `?${query}` : ""}`, { token })
}

export function reorderBlogs(token: string, category: string, orderedIds: string[]) {
  return apiFetch<AdminBlogRow[]>("/blogs/admin/reorder", {
    method: "PATCH",
    token,
    body: JSON.stringify({ category, orderedIds }),
  })
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

// ── Research Papers (public) ───────────────────────────────────────────────────

export type Certification = "CDCS" | "CSDG" | "CITF" | "CTFP" | "OTHER"

export interface ResearchPaperSummary {
  title: string
  slug: string
  abstract: string
  featuredImage: string | null
  category: string | null
  tags: string[]
  readingTime: number
  priceBdt: number
  priceUsd: number
  certification: Certification | null
  views: number
  author: string
  publishedAt: string | null
}

export interface ResearchPaperListResult {
  data: ResearchPaperSummary[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface PublicResearchPaperDetail {
  id: string
  title: string
  slug: string
  abstract: string
  content: string | null
  locked: boolean
  featuredImage: string | null
  category: string | null
  tags: string[]
  readingTime: number
  priceBdt: number
  priceUsd: number
  certification: Certification | null
  discountPercent: number
  views: number
  author: string
  publishedAt: string | null
}

export function getResearchPapers(params: { search?: string; category?: string; page?: number; limit?: number } = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v).map(([k, v]) => [k, String(v)])
  ).toString()
  return apiFetch<ResearchPaperListResult>(`/research${query ? `?${query}` : ""}`)
}

export function getResearchPaperBySlug(slug: string, token?: string) {
  return apiFetch<PublicResearchPaperDetail>(`/research/${slug}`, { token })
}

// ── Research Papers (admin) ─────────────────────────────────────────────────────

export interface AdminResearchPaperRow {
  id: string
  title: string
  slug: string
  featuredImage: string | null
  category: string | null
  tags: string[]
  status: BlogStatus
  priceBdt: number
  priceUsd: number
  views: number
  readingTime: number
  author: string
  publishedAt: string | null
  updatedAt: string
}

export interface ResearchPaperDetail {
  id: string
  title: string
  slug: string
  abstract: string
  content: string
  featuredImage: string | null
  category: string | null
  tags: string[]
  status: BlogStatus
  priceBdt: number
  priceUsd: number
  certification: Certification | null
  readingTime: number
  views: number
  authorId: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ResearchPaperFormFields {
  title: string
  slug?: string
  abstract: string
  content: string
  featuredImage?: string
  category?: string
  tags?: string[]
  status?: BlogStatus
  priceBdt?: number
  priceUsd?: number
  certification?: Certification
  readingTime?: number
}

export function getAdminResearchPapers(
  token: string,
  params: { search?: string; status?: BlogStatus; category?: string } = {}
) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v) as [string, string][]
  ).toString()
  return apiFetch<AdminResearchPaperRow[]>(`/research/admin${query ? `?${query}` : ""}`, { token })
}

export function getAdminResearchPaper(token: string, id: string) {
  return apiFetch<ResearchPaperDetail>(`/research/admin/${id}`, { token })
}

export function createResearchPaper(token: string, data: ResearchPaperFormFields) {
  return apiFetch<ResearchPaperDetail>("/research/admin", { method: "POST", token, body: JSON.stringify(data) })
}

export function updateResearchPaper(token: string, id: string, data: Partial<ResearchPaperFormFields>) {
  return apiFetch<ResearchPaperDetail>(`/research/admin/${id}`, { method: "PATCH", token, body: JSON.stringify(data) })
}

export function deleteResearchPaper(token: string, id: string) {
  return apiFetch<{ id: string }>(`/research/admin/${id}`, { method: "DELETE", token })
}

// ── Programs ─────────────────────────────────────────────────────────────────

export type ProgramType = "INTERNATIONAL" | "PROPRIETARY"

export interface ProgramSummary {
  title: string
  slug: string
  code: string | null
  type: ProgramType
  overview: string
  featuredImage: string | null
  priceBdt: number
  priceUsd: number
  featured: boolean
  author: string
  publishedAt: string | null
}

export interface ProgramListResult {
  data: ProgramSummary[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface ProgramModuleInfo {
  id: string
  title: string
  videoUrl: string | null
}

export interface PublicProgramDetail {
  id: string
  title: string
  slug: string
  code: string | null
  type: ProgramType
  overview: string
  whoItsFor: string | null
  examInfo: string | null
  featuredImage: string | null
  priceBdt: number
  priceUsd: number
  discountPercent: number
  finalPriceBdt: number
  finalPriceUsd: number
  author: string
  publishedAt: string | null
  enrolled: boolean
  modules: ProgramModuleInfo[]
  completedModuleIds: string[]
  completedAt: string | null
}

export function getPrograms(params: { type?: string; page?: number; limit?: number } = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v).map(([k, v]) => [k, String(v)])
  ).toString()
  return apiFetch<ProgramListResult>(`/programs${query ? `?${query}` : ""}`)
}

export function getProgramBySlug(slug: string, token?: string) {
  return apiFetch<PublicProgramDetail>(`/programs/${slug}`, { token })
}

export function enrollInProgram(token: string, programId: string) {
  return apiFetch<{ enrolled: boolean }>(`/programs/${programId}/enroll`, { method: "POST", token })
}

export function completeProgramModule(token: string, programId: string, moduleId: string) {
  return apiFetch<{ completed: boolean }>(`/programs/${programId}/modules/${moduleId}/complete`, {
    method: "POST",
    token,
  })
}

export async function downloadCertificate(token: string, programId: string, filename: string) {
  const res = await fetch(`${API_URL}/programs/${programId}/certificate`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body?.message || `Request failed with status ${res.status}`)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

// ── Programs (admin) ─────────────────────────────────────────────────────────

export interface AdminProgramRow {
  id: string
  title: string
  slug: string
  code: string | null
  type: ProgramType
  status: BlogStatus
  priceBdt: number
  priceUsd: number
  featured: boolean
  enrollmentCount: number
  author: string
  updatedAt: string
}

export interface ProgramModuleFormFields {
  title: string
  videoUrl?: string
  sequence?: number
}

export interface ProgramDetail {
  id: string
  title: string
  slug: string
  code: string | null
  type: ProgramType
  overview: string
  whoItsFor: string | null
  examInfo: string | null
  featuredImage: string | null
  priceBdt: number
  priceUsd: number
  freeForBasic: boolean
  freeForPro: boolean
  freeForElite: boolean
  featured: boolean
  status: BlogStatus
  authorId: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  modules: { id: string; title: string; videoUrl: string | null; sequence: number }[]
}

export interface ProgramFormFields {
  title: string
  slug?: string
  code?: string
  type: ProgramType
  overview: string
  whoItsFor?: string
  examInfo?: string
  featuredImage?: string
  priceBdt?: number
  priceUsd?: number
  freeForBasic?: boolean
  freeForPro?: boolean
  freeForElite?: boolean
  featured?: boolean
  status?: BlogStatus
  modules?: ProgramModuleFormFields[]
}

export function getAdminPrograms(
  token: string,
  params: { search?: string; status?: BlogStatus; type?: string } = {}
) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v) as [string, string][]
  ).toString()
  return apiFetch<AdminProgramRow[]>(`/programs/admin${query ? `?${query}` : ""}`, { token })
}

export function getAdminProgram(token: string, id: string) {
  return apiFetch<ProgramDetail>(`/programs/admin/${id}`, { token })
}

export function createProgram(token: string, data: ProgramFormFields) {
  return apiFetch<ProgramDetail>("/programs/admin", { method: "POST", token, body: JSON.stringify(data) })
}

export function updateProgram(token: string, id: string, data: Partial<ProgramFormFields>) {
  return apiFetch<ProgramDetail>(`/programs/admin/${id}`, { method: "PATCH", token, body: JSON.stringify(data) })
}

export function deleteProgram(token: string, id: string) {
  return apiFetch<{ id: string }>(`/programs/admin/${id}`, { method: "DELETE", token })
}

// ── Events (public) ────────────────────────────────────────────────────────────

export type EventFormat = "IN_PERSON" | "VIRTUAL" | "HYBRID"

export interface EventSummary {
  title: string
  slug: string
  description: string
  startAt: string
  location: string | null
  format: EventFormat
  featuredImage: string | null
  featured: boolean
  author: string
}

export interface EventListResult {
  data: EventSummary[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export function getEvents(
  params: { when?: "upcoming" | "past"; featured?: boolean; page?: number; limit?: number } = {}
) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== false).map(([k, v]) => [k, String(v)])
  ).toString()
  return apiFetch<EventListResult>(`/events${query ? `?${query}` : ""}`)
}

export function getEventBySlug(slug: string) {
  return apiFetch<EventSummary>(`/events/${slug}`)
}

// ── Events (admin) ────────────────────────────────────────────────────────────

export interface AdminEventRow {
  id: string
  title: string
  slug: string
  startAt: string
  location: string | null
  format: EventFormat
  featured: boolean
  status: BlogStatus
  author: string
  updatedAt: string
}

export interface EventDetail {
  id: string
  title: string
  slug: string
  description: string
  startAt: string
  location: string | null
  format: EventFormat
  featuredImage: string | null
  featured: boolean
  status: BlogStatus
  authorId: string
  createdAt: string
  updatedAt: string
}

export interface EventFormFields {
  title: string
  slug?: string
  description: string
  startAt: string
  location?: string
  format?: EventFormat
  featuredImage?: string
  featured?: boolean
  status?: BlogStatus
}

export function getAdminEvents(token: string, params: { search?: string; status?: BlogStatus } = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v) as [string, string][]
  ).toString()
  return apiFetch<AdminEventRow[]>(`/events/admin${query ? `?${query}` : ""}`, { token })
}

export function getAdminEvent(token: string, id: string) {
  return apiFetch<EventDetail>(`/events/admin/${id}`, { token })
}

export function createEvent(token: string, data: EventFormFields) {
  return apiFetch<EventDetail>("/events/admin", { method: "POST", token, body: JSON.stringify(data) })
}

export function updateEvent(token: string, id: string, data: Partial<EventFormFields>) {
  return apiFetch<EventDetail>(`/events/admin/${id}`, { method: "PATCH", token, body: JSON.stringify(data) })
}

export function deleteEvent(token: string, id: string) {
  return apiFetch<{ id: string }>(`/events/admin/${id}`, { method: "DELETE", token })
}

// ── Partners ─────────────────────────────────────────────────────────────────

export interface Partner {
  id: string
  name: string
  logoUrl: string
  websiteUrl: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export function getPartners() {
  return apiFetch<Partner[]>("/partners")
}

export function createPartner(token: string, data: { name: string; logoUrl: string; websiteUrl?: string }) {
  return apiFetch<Partner>("/partners/admin", { method: "POST", token, body: JSON.stringify(data) })
}

export function updatePartner(
  token: string,
  id: string,
  data: Partial<{ name: string; logoUrl: string; websiteUrl: string }>
) {
  return apiFetch<Partner>(`/partners/admin/${id}`, { method: "PATCH", token, body: JSON.stringify(data) })
}

export function deletePartner(token: string, id: string) {
  return apiFetch<{ id: string }>(`/partners/admin/${id}`, { method: "DELETE", token })
}

export function reorderPartners(token: string, orderedIds: string[]) {
  return apiFetch<Partner[]>("/partners/admin/reorder", {
    method: "PATCH",
    token,
    body: JSON.stringify({ orderedIds }),
  })
}

// ── Analytics ────────────────────────────────────────────────────────────────

export interface AdminAnalytics {
  viewsByDay: { date: string; count: number }[]
  topBlogs: { title: string; slug: string; views: number }[]
  topResearch: { title: string; slug: string; views: number }[]
}

export function getAdminAnalytics(token: string) {
  return apiFetch<AdminAnalytics>("/admin/analytics", { token })
}

// ── Forum ────────────────────────────────────────────────────────────────────

export interface ForumThreadSummary {
  id: string
  title: string
  category: string | null
  author: string
  pinned: boolean
  locked: boolean
  replyCount: number
  views: number
  lastActivityAt: string
  createdAt: string
}

export interface ForumThreadListResult {
  data: ForumThreadSummary[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface ForumReply {
  id: string
  content: string
  author: string
  createdAt: string
}

export interface ForumThreadDetail {
  id: string
  title: string
  content: string
  category: string | null
  author: string
  pinned: boolean
  locked: boolean
  replyCount: number
  views: number
  lastActivityAt: string
  createdAt: string
  replies: ForumReply[]
}

export function getForumThreads(
  token: string,
  params: { category?: string; page?: number; limit?: number } = {}
) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v).map(([k, v]) => [k, String(v)])
  ).toString()
  return apiFetch<ForumThreadListResult>(`/forum/threads${query ? `?${query}` : ""}`, { token })
}

export function getForumThread(token: string, id: string) {
  return apiFetch<ForumThreadDetail>(`/forum/threads/${id}`, { token })
}

export function createForumThread(token: string, data: { title: string; content: string; category?: string }) {
  return apiFetch<{ id: string }>("/forum/threads", { method: "POST", token, body: JSON.stringify(data) })
}

export function createForumReply(token: string, threadId: string, content: string) {
  return apiFetch<{ id: string }>(`/forum/threads/${threadId}/replies`, {
    method: "POST",
    token,
    body: JSON.stringify({ content }),
  })
}

export interface AdminForumThreadRow {
  id: string
  title: string
  category: string | null
  authorName: string
  authorEmail: string
  pinned: boolean
  locked: boolean
  replyCount: number
  views: number
  createdAt: string
  lastActivityAt: string
}

export function getAdminForumThreads(token: string, params: { search?: string; category?: string } = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v) as [string, string][]
  ).toString()
  return apiFetch<AdminForumThreadRow[]>(`/forum/admin/threads${query ? `?${query}` : ""}`, { token })
}

export function updateForumThread(token: string, id: string, data: { pinned?: boolean; locked?: boolean }) {
  return apiFetch<AdminForumThreadRow>(`/forum/admin/threads/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  })
}

export function deleteForumThread(token: string, id: string) {
  return apiFetch<{ id: string }>(`/forum/admin/threads/${id}`, { method: "DELETE", token })
}

export function deleteForumPost(token: string, id: string) {
  return apiFetch<{ id: string }>(`/forum/admin/posts/${id}`, { method: "DELETE", token })
}

// ── Admin dashboard ───────────────────────────────────────────────────────────

export interface AdminStats {
  totalBlogs: number
  publishedBlogs: number
  totalUsers: number
  totalAlumni: number
  pendingApplications: number
  recentBlogs: {
    id: string
    title: string
    slug: string
    status: BlogStatus
    views: number
    createdAt: string
  }[]
}

export function getAdminStats(token: string) {
  return apiFetch<AdminStats>("/admin/stats", { token })
}

// ── Go-live bulk rollout ─────────────────────────────────────────────────────

export interface GoLiveEntry {
  name: string
  email: string
}

export interface GoLivePreview {
  newEntries: GoLiveEntry[]
  alreadyExistsEmails: string[]
}

export function previewGoLive(token: string, file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return apiFetch<GoLivePreview>("/admin/go-live/preview", { method: "POST", token, body: formData })
}

export function confirmGoLive(token: string, entries: GoLiveEntry[]) {
  return apiFetch<{ created: number; skipped: number }>("/admin/go-live/confirm", {
    method: "POST",
    token,
    body: JSON.stringify({ entries }),
  })
}

// ── Categories ────────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export function getCategories() {
  return apiFetch<Category[]>("/categories")
}

export function createCategory(token: string, name: string) {
  return apiFetch<Category>("/categories/admin", { method: "POST", token, body: JSON.stringify({ name }) })
}

export function updateCategory(token: string, id: string, name: string) {
  return apiFetch<Category>(`/categories/admin/${id}`, { method: "PATCH", token, body: JSON.stringify({ name }) })
}

export function deleteCategory(token: string, id: string) {
  return apiFetch<{ id: string }>(`/categories/admin/${id}`, { method: "DELETE", token })
}

export function reorderCategories(token: string, orderedIds: string[]) {
  return apiFetch<Category[]>("/categories/admin/reorder", {
    method: "PATCH",
    token,
    body: JSON.stringify({ orderedIds }),
  })
}

// ── Users ────────────────────────────────────────────────────────────────────

export interface AdminUserRow {
  id: string
  name: string
  email: string
  phone: string | null
  role: UserRole
  emailVerified: boolean
  desiredMembershipTier: MembershipTier | null
  membershipTier: MembershipTier | null
  membershipExpiresAt: string | null
  createdAt: string
}

export function getAdminUsers(token: string, search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : ""
  return apiFetch<AdminUserRow[]>(`/users/admin${query}`, { token })
}

export interface UpdateUserFields {
  name?: string
  email?: string
  phone?: string
  address?: string
  role?: UserRole
  emailVerified?: boolean
}

export function updateAdminUser(token: string, id: string, data: UpdateUserFields) {
  return apiFetch<AdminUserRow>(`/users/admin/${id}`, { method: "PATCH", token, body: JSON.stringify(data) })
}

export interface AlumniCsvPreview {
  matchedEmails: string[]
  alreadyAlumniEmails: string[]
  unmatchedEmails: string[]
  skippedPrivilegedEmails: string[]
  pendingNotMatchedEmails: string[]
}

export function previewAlumniCsv(token: string, file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return apiFetch<AlumniCsvPreview>("/users/admin/alumni-csv/preview", { method: "POST", token, body: formData })
}

export function confirmAlumniCsv(
  token: string,
  data: { matchedEmails: string[]; pendingNotMatchedEmails: string[] }
) {
  return apiFetch<{ activated: number; notified: number }>("/users/admin/alumni-csv/confirm", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  })
}

// ── Contact ──────────────────────────────────────────────────────────────────

export interface ContactInquiry {
  name: string
  email: string
  phone?: string
  category: string
  subject: string
  message: string
}

export function submitContactInquiry(data: ContactInquiry) {
  return apiFetch<{ success: boolean }>("/contact", { method: "POST", body: JSON.stringify(data) })
}
