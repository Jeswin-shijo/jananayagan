import {ComplaintStatus, ComplaintPriority, ComplaintCategory} from '@appTypes/api';
import {Colors} from '@constants/colors';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

export const formatPhone = (phone: string): string => {
  return phone.replace(/(\d{5})(\d{5})/, '$1 $2');
};

export const getStatusColor = (status: ComplaintStatus): string => {
  const map: Record<ComplaintStatus, string> = {
    submitted: Colors.statusSubmitted,
    under_review: Colors.statusUnderReview,
    in_progress: Colors.statusInProgress,
    resolved: Colors.statusResolved,
    rejected: Colors.statusRejected,
  };
  return map[status];
};

export const getStatusLabel = (status: ComplaintStatus): string => {
  const map: Record<ComplaintStatus, string> = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
  };
  return map[status];
};

export const getPriorityColor = (priority: ComplaintPriority): string => {
  const map: Record<ComplaintPriority, string> = {
    low: Colors.priorityLow,
    medium: Colors.priorityMedium,
    high: Colors.priorityHigh,
  };
  return map[priority];
};

export const getCategoryIcon = (category: ComplaintCategory): string => {
  const map: Record<ComplaintCategory, string> = {
    road: '🛣️',
    water: '💧',
    electricity: '⚡',
    sanitation: '🗑️',
    other: '📋',
  };
  return map[category];
};

export const getCategoryLabel = (category: ComplaintCategory): string => {
  const map: Record<ComplaintCategory, string> = {
    road: 'Road',
    water: 'Water',
    electricity: 'Electricity',
    sanitation: 'Sanitation',
    other: 'Other',
  };
  return map[category];
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const generateTicketId = (): string => {
  const prefix = 'JAN';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};
