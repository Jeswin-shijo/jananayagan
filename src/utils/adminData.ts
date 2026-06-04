import {UserRole} from '@appTypes/navigation';
import {TranslationKey} from '@constants/i18n';

export type AdminStat = {
  key: string;
  labelKey: TranslationKey;
  value: string;
  icon: string;
  tone: 'info' | 'success' | 'warning' | 'purple';
};

export const MOCK_ADMIN_STATS: AdminStat[] = [
  {key: 'users', labelKey: 'totalUsers', value: '48,210', icon: 'account-multiple-outline', tone: 'info'},
  {key: 'politicians', labelKey: 'politicians', value: '124', icon: 'bank-outline', tone: 'purple'},
  {key: 'volunteers', labelKey: 'volunteers', value: '3,540', icon: 'hand-heart-outline', tone: 'success'},
  {key: 'constituencies', labelKey: 'constituencies', value: '38', icon: 'map-outline', tone: 'warning'},
];

export type UserStatus = 'active' | 'pending' | 'suspended';

export type ManagedUser = {
  id: string;
  name: string;
  role: UserRole;
  constituency: string;
  status: UserStatus;
  joined: string;
};

export const MOCK_USERS: ManagedUser[] = [
  {id: 'u1', name: 'Arul Kumar', role: 'politician', constituency: 'Nagercoil', status: 'active', joined: 'Jan 2024'},
  {id: 'u2', name: 'Meena Krishnan', role: 'volunteer', constituency: 'Nagercoil', status: 'active', joined: 'Mar 2024'},
  {id: 'u3', name: 'Suresh Babu', role: 'volunteer', constituency: 'Colachel', status: 'pending', joined: 'May 2024'},
  {id: 'u4', name: 'Priya Sundaram', role: 'citizen', constituency: 'Nagercoil', status: 'active', joined: 'Feb 2024'},
  {id: 'u5', name: 'Ravi Anand', role: 'politician', constituency: 'Padmanabhapuram', status: 'pending', joined: 'May 2024'},
  {id: 'u6', name: 'Deepa Mohan', role: 'citizen', constituency: 'Colachel', status: 'suspended', joined: 'Dec 2023'},
];

export type ConstituencyItem = {
  id: string;
  name: string;
  mla: string;
  wards: number;
  complaints: number;
  resolvedPct: number;
};

export const MOCK_CONSTITUENCIES: ConstituencyItem[] = [
  {id: 'c1', name: 'Nagercoil', mla: 'Arul Kumar', wards: 14, complaints: 12842, resolvedPct: 75},
  {id: 'c2', name: 'Colachel', mla: 'Ravi Anand', wards: 11, complaints: 8420, resolvedPct: 68},
  {id: 'c3', name: 'Padmanabhapuram', mla: 'Vacant', wards: 9, complaints: 5310, resolvedPct: 71},
  {id: 'c4', name: 'Killiyoor', mla: 'S. Mohan', wards: 12, complaints: 6890, resolvedPct: 64},
];

export type ModerationType = 'post' | 'petition' | 'comment';

export type ModerationItem = {
  id: string;
  type: ModerationType;
  author: string;
  snippet: string;
  reports: number;
  ago: string;
};

export const MOCK_MODERATION: ModerationItem[] = [
  {id: 'mod1', type: 'post', author: 'Anonymous', snippet: 'Spam: repeated promotional links posted across ward feeds.', reports: 12, ago: '1h'},
  {id: 'mod2', type: 'comment', author: 'user_8821', snippet: 'Abusive language reported on a road-repair update.', reports: 7, ago: '3h'},
  {id: 'mod3', type: 'petition', author: 'Citizens Forum', snippet: 'Possibly duplicate petition about water supply in Ward 8.', reports: 4, ago: '6h'},
];
