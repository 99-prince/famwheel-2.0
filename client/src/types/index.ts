// ── SHARED TYPESCRIPT TYPES ────────────────────────────────────────────────

export type Role = 'FARMER' | 'BUYER' | 'TRANSPORT' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
export type PayStatus = 'PENDING' | 'PAID' | 'REFUNDED';
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'EXPIRED';
export type TransportStatus = 'OPEN' | 'BIDDING' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
export type Category = 'GRAIN' | 'VEGETABLE' | 'FRUIT' | 'PULSE' | 'OILSEED' | 'SPICE' | 'DAIRY' | 'OTHER';
export type NotificationType = 'OFFER' | 'ORDER' | 'TRANSPORT' | 'REVIEW' | 'PAYMENT' | 'SYSTEM';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role;
  state?: string;
  city?: string;
  bio?: string;
  avatar?: string;
  verified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { crops?: number; ordersAsFarmer?: number; ordersAsBuyer?: number; reviewsReceived?: number; };
}

export interface Crop {
  id: number;
  name: string;
  emoji: string;
  category: Category;
  quality: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  minOrderQty: number;
  images: string;
  isAvailable: boolean;
  farmerId: number;
  farmer?: Partial<User>;
  createdAt: string;
  _count?: { orders?: number; offers?: number; };
}

export interface Order {
  id: string;
  cropId: number;
  crop?: Partial<Crop>;
  farmerId: number;
  farmer?: Partial<User>;
  buyerId: number;
  buyer?: Partial<User>;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PayStatus;
  deliveryAddress?: string;
  notes?: string;
  deliveryDate?: string;
  createdAt: string;
  transport?: TransportRequest;
}

export interface Offer {
  id: number;
  cropId: number;
  crop?: Partial<Crop>;
  fromId: number;
  from?: Partial<User>;
  toId: number;
  to?: Partial<User>;
  offerPrice: number;
  quantity: number;
  totalAmount: number;
  message?: string;
  status: OfferStatus;
  createdAt: string;
}

export interface Message {
  id: number;
  fromId: number;
  from?: Partial<User>;
  toId: number;
  to?: Partial<User>;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  partner: Partial<User>;
  lastMessage: Message;
  unreadCount: number;
}

export interface TransportProvider {
  id: number;
  userId: number;
  user?: Partial<User>;
  vehicleType: string;
  vehicleNo: string;
  capacity: number;
  isAvailable: boolean;
  currentLoc?: string;
}

export interface TransportRequest {
  id: number;
  orderId: string;
  order?: Partial<Order>;
  fromLocation: string;
  toLocation: string;
  distance?: number;
  weight?: number;
  requiredBy?: string;
  status: TransportStatus;
  providerId?: number;
  provider?: TransportProvider;
  bidAmount?: number;
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: number;
  fromId: number;
  from?: Partial<User>;
  toId: number;
  rating: number;
  comment: string;
  cropName?: string;
  orderId?: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  text: string;
  icon: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface MarketPrice {
  id: number;
  name: string;
  emoji: string;
  category: string;
  region: string;
  price: number;
  unit: string;
  minPrice: number;
  maxPrice: number;
  updatedAt: string;
}

// API Response wrappers
export interface ApiResponse<T> { success: boolean; data?: T; error?: string; }
export interface PaginatedResponse<T> { success: boolean; items?: T[]; total?: number; page?: number; pages?: number; }
