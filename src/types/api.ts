export type ComplaintStatus = 'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';
export type ComplaintPriority = 'low' | 'medium' | 'high';
export type ComplaintCategory = 'road' | 'water' | 'electricity' | 'sanitation' | 'other';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: import('./navigation').UserRole;
  gender?: import('./navigation').Gender;
  constituency?: string;
  avatarUrl?: string;
}

export interface Complaint {
  id: string;
  ticketId: string;
  category: ComplaintCategory;
  subCategory: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  images: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
  assignedVolunteer?: Volunteer;
}

export interface Petition {
  id: string;
  title: string;
  description: string;
  category: string;
  targetSignatures: number;
  currentSignatures: number;
  constituency: string;
  status: 'active' | 'closed' | 'approved';
  createdAt: string;
  createdBy: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  endDate: string;
  totalVotes: number;
  hasVoted: boolean;
  votedOptionId?: string;
  status: 'active' | 'ended';
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface Volunteer {
  id: string;
  name: string;
  area: string;
  phone: string;
  email: string;
  activeComplaints: number;
  totalResolved: number;
  isAvailable: boolean;
  performanceScore: number;
}

export interface SentimentData {
  overallScore: number;
  trend: SentimentPoint[];
  byCategory: CategorySentiment[];
  topComments: SentimentComment[];
}

export interface SentimentPoint {
  date: string;
  score: number;
}

export interface CategorySentiment {
  category: string;
  score: number;
  count: number;
}

export interface SentimentComment {
  id: string;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'complaint_update' | 'petition_update' | 'poll_new' | 'general';
  isRead: boolean;
  createdAt: string;
  data?: Record<string, string>;
}
