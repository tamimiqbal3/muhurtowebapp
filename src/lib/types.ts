/** Category slugs are data-driven (admins can add categories). The five launch categories are listed in CORE_CATEGORY_SLUGS. */
export type CategorySlug = string;

export type Role = "customer" | "admin" | "agent";

export interface ImageRef {
  src: string;
  alt: string;
}

export interface Subcategory {
  slug: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn?: string;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  nameBn: string;
  tagline: string;
  taglineBn?: string;
  description: string;
  descriptionBn?: string;
  accent: string;
  route: string;
  hero: ImageRef;
  card: ImageRef;
  subcategories: Subcategory[];
}

/** "per50" = price for every 50 guests (quantity is the guest count, billed in blocks of 50). */
export type PriceUnit = "per50" | "event" | "guest" | "plate" | "cup" | "hour";

export interface CustomizationOption {
  id: string;
  label: string;
  labelBn?: string;
  /** Added to the unit price when selected. */
  priceDelta: number;
}

export interface Vendor {
  id: string;
  name: string;
  tagline: string;
  city: string;
  address: string;
  since: number;
  verified: boolean;
  phone: string;
  email: string;
  specialties: CategorySlug[];
  isDemo: boolean;
  active?: boolean;
}

export interface Service {
  id: string;
  categorySlug: CategorySlug;
  subcategorySlug: string;
  name: string;
  nameBn?: string;
  shortDescription: string;
  shortDescriptionBn?: string;
  description: string;
  descriptionBn?: string;
  includesBn?: string[];
  startingPrice: number;
  unit: PriceUnit;
  minQuantity: number;
  /** Largest guest count this listing is designed for (if limited). */
  maxGuests?: number;
  vendorId: string;
  city: string;
  serviceAreas: string[];
  images: ImageRef[];
  options: CustomizationOption[];
  themes: string[];
  includes: string[];
  rating: number;
  reviewCount: number;
  tags: string[];
  featured?: boolean;
  active?: boolean;
  isDemo: boolean;
}

export interface Review {
  id: string;
  serviceId: string;
  author: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
  isDemo: boolean;
  hidden?: boolean;
}

/* ─── Plans, bookings, payments ───────────────────────────────────────── */

export interface PlanItemInput {
  serviceId: string;
  quantity: number;
  optionIds: string[];
}

export interface PricedLine {
  serviceId: string;
  serviceName: string;
  categorySlug: CategorySlug;
  subcategorySlug: string;
  vendorId: string;
  vendorName: string;
  unit: PriceUnit;
  basePrice: number;
  optionIds: string[];
  optionLabels: string[];
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface PriceBreakdown {
  subtotal: number;
  platformFeeRate: number;
  platformFee: number;
  total: number;
  currency: "BDT";
}

export interface EventDetails {
  categorySlug: CategorySlug;
  date: string;
  city: string;
  venue: string;
  guests: number;
  theme: string;
  notes: string;
}

export interface ContactDetails {
  name: string;
  phone: string;
  email: string;
}

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancellation_requested"
  | "cancelled"
  | "rejected";

export type PaymentStatus = "unpaid" | "processing" | "paid" | "failed" | "refund_pending" | "refunded";

export type MonitoringStatus = "not_started" | "pending_assignment" | "assigned" | "active" | "completed";

export interface BookingRequest {
  type: "cancellation" | "modification";
  message: string;
  status: "open" | "resolved";
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface Booking {
  id: string;
  code: string;
  customerId: string;
  contact: ContactDetails;
  event: EventDetails;
  lines: PricedLine[];
  pricing: PriceBreakdown;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  monitoring: {
    status: MonitoringStatus;
    agentId?: string | null;
    agentName?: string | null;
    agentPhone?: string | null;
  };
  requests: BookingRequest[];
  customizationRequestId?: string | null;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export type PaymentRecordStatus = "initiated" | "paid" | "failed" | "cancelled" | "superseded" | "duplicate_refund_required";

export interface PaymentRecord {
  id: string; // also used as SSLCommerz tran_id
  bookingId: string;
  bookingCode: string;
  customerId: string;
  gateway: "sslcommerz";
  mode: "sandbox" | "live";
  amount: number;
  breakdown: PriceBreakdown;
  status: PaymentRecordStatus;
  sessionKey?: string;
  preferredMethod?: string;
  valId?: string;
  bankTranId?: string;
  cardType?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

/* ─── Customisation ──────────────────────────────────────────────────── */

export type CustomizationStatus = "submitted" | "in_review" | "responded" | "changes_requested" | "accepted" | "closed";

export interface CustomizationMessage {
  from: "customer" | "admin";
  text: string;
  at: string;
}

export interface CustomizationRequest {
  id: string;
  customerId: string;
  contact: ContactDetails;
  event: EventDetails;
  lines: PricedLine[];
  estimate: PriceBreakdown;
  specialInstructions: string;
  status: CustomizationStatus;
  messages: CustomizationMessage[];
  revisedPlan?: {
    lines: PricedLine[];
    pricing: PriceBreakdown;
    message: string;
    respondedAt: string;
    respondedBy: string;
  } | null;
  bookingId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/* ─── Monitoring ─────────────────────────────────────────────────────── */

export type MilestoneStatus = "pending" | "in_progress" | "done";
export type VendorProgressStatus = "pending" | "confirmed" | "preparing" | "on_site" | "completed" | "issue";

export interface Milestone {
  key: string;
  label: string;
  status: MilestoneStatus;
  updatedAt?: string;
}

export interface VendorProgress {
  serviceId: string;
  serviceName: string;
  vendorName: string;
  status: VendorProgressStatus;
  updatedAt?: string;
}

export interface MonitoringAgent {
  id: string; // = user uid
  name: string;
  email: string;
  phone: string;
  cities: string[];
  active: boolean;
  activeAssignments: number;
  createdAt: string;
}

export interface MonitoringAssignment {
  id: string; // = bookingId
  bookingId: string;
  bookingCode: string;
  customerId: string;
  eventDate: string;
  city: string;
  categorySlug: CategorySlug;
  status: "pending" | "assigned" | "active" | "completed";
  agentId: string | null;
  agentName: string | null;
  milestones: Milestone[];
  vendorProgress: VendorProgress[];
  assignedAt?: string;
  assignedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventUpdate {
  id: string;
  bookingId: string;
  authorId: string;
  authorName: string;
  type: "milestone" | "vendor" | "note" | "issue" | "status" | "system";
  visibility: "customer" | "internal";
  message: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  city: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

/* ─── AI planner ─────────────────────────────────────────────────────── */

export interface PlannerRequirements {
  categorySlug: CategorySlug | null;
  date: string | null;
  city: string | null;
  budget: number | null;
  guests: number | null;
  theme: string | null;
  services: string[]; // subcategory slugs
  preferences: string | null;
}

export interface PlannerRecommendationItem {
  serviceId: string;
  quantity: number;
  optionIds: string[];
  reason: string;
}

export interface PlannerResult {
  source: "gemini" | "rules";
  summary: string;
  items: Array<PlannerRecommendationItem & { line: PricedLine }>;
  estimate: PriceBreakdown;
  budget: number | null;
  withinBudget: boolean | null;
  notes: string[];
}

/** A Dhaka area customers can choose for their event. */
export interface Location {
  id: string;
  name: string;
  nameBn: string;
  active: boolean;
}
