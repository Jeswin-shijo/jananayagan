import {ComplaintStatus} from '@appTypes/api';
import {TranslationKey} from '@constants/i18n';

export type HeatIntensity = 'very_high' | 'high' | 'medium' | 'low' | 'very_low';

export type WardHeat = {
  id: string;
  name: string;
  intensity: HeatIntensity;
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  // Real geographic coordinates (centred on Coimbatore)
  lat: number;
  lng: number;
};

// Map centre + default zoom for the constituency (Nagercoil area)
export const CONSTITUENCY_CENTER = {lat: 8.1700, lng: 77.4200, zoom: 13};

// Heat weight per intensity (0-1) used by the map heat layer
export const INTENSITY_WEIGHT: Record<HeatIntensity, number> = {
  very_high: 1.0,
  high: 0.75,
  medium: 0.5,
  low: 0.32,
  very_low: 0.16,
};

export const MOCK_WARDS: WardHeat[] = [
  {id: 'w5', name: 'Ward 5', intensity: 'very_high', total: 1254, pending: 452, inProgress: 210, resolved: 592, lat: 8.1820, lng: 77.4050},
  {id: 'w8', name: 'Ward 8', intensity: 'very_high', total: 1187, pending: 398, inProgress: 187, resolved: 602, lat: 8.1410, lng: 77.4150},
  {id: 'w1', name: 'Ward 1', intensity: 'high', total: 876, pending: 210, inProgress: 126, resolved: 540, lat: 8.1950, lng: 77.4100},
  {id: 'w3', name: 'Ward 3', intensity: 'high', total: 982, pending: 256, inProgress: 142, resolved: 584, lat: 8.1550, lng: 77.4350},
  {id: 'w13', name: 'Ward 13', intensity: 'low', total: 451, pending: 98, inProgress: 72, resolved: 281, lat: 8.2050, lng: 77.4450},
  {id: 'w12', name: 'Ward 12', intensity: 'low', total: 451, pending: 98, inProgress: 72, resolved: 281, lat: 8.1750, lng: 77.3850},
  {id: 'w14', name: 'Ward 14', intensity: 'very_low', total: 312, pending: 64, inProgress: 41, resolved: 207, lat: 8.1350, lng: 77.3950},
  {id: 'w2', name: 'Ward 2', intensity: 'medium', total: 688, pending: 168, inProgress: 102, resolved: 418, lat: 8.1650, lng: 77.4400},
];

export type ConstituencyStat = {
  key: string;
  labelKey: TranslationKey;
  value: string;
  delta: string;
  trendUp: boolean;
  tone: 'danger' | 'warning' | 'success' | 'info';
  icon: string;
};

export const MOCK_CONSTITUENCY_STATS: ConstituencyStat[] = [
  {key: 'total', labelKey: 'totalComplaints', value: '12,842', delta: '12.5%', trendUp: true, tone: 'danger', icon: 'clipboard-text-outline'},
  {key: 'pending', labelKey: 'pending', value: '3,214', delta: '8.3%', trendUp: true, tone: 'warning', icon: 'clock-outline'},
  {key: 'resolved', labelKey: 'resolved', value: '9,628', delta: '15.7%', trendUp: true, tone: 'success', icon: 'check-circle-outline'},
  {key: 'inProgress', labelKey: 'inProgress', value: '1,782', delta: '5.2%', trendUp: true, tone: 'info', icon: 'progress-wrench'},
];

export type TopIssue = {
  id: string;
  labelKey: TranslationKey;
  percentage: number;
  icon: string;
  tone: 'info' | 'warning' | 'purple' | 'success' | 'neutral';
};

export const MOCK_TOP_ISSUES: TopIssue[] = [
  {id: 'water', labelKey: 'waterSupply', percentage: 45, icon: 'water-outline', tone: 'info'},
  {id: 'roads', labelKey: 'roadsStreets', percentage: 25, icon: 'road-variant', tone: 'warning'},
  {id: 'lights', labelKey: 'streetLights', percentage: 15, icon: 'lightbulb-outline', tone: 'purple'},
  {id: 'drainage', labelKey: 'drainage', percentage: 10, icon: 'pipe', tone: 'success'},
  {id: 'others', labelKey: 'others', percentage: 5, icon: 'dots-horizontal', tone: 'neutral'},
];

export type PriorityIssue = {
  id: string;
  title: string;
  ward: string;
  area: string;
  ago: string;
  status: ComplaintStatus;
};

export const MOCK_PRIORITY_ISSUES: PriorityIssue[] = [
  {id: 'p1', title: 'Water leakage in main road', ward: 'Ward 5', area: 'Ganapathy', ago: '2h', status: 'submitted'},
  {id: 'p2', title: 'Street light not working', ward: 'Ward 8', area: 'Singanallur', ago: '3h', status: 'in_progress'},
  {id: 'p3', title: 'Drainage overflow', ward: 'Ward 5', area: 'Near Bus Stand', ago: '5h', status: 'submitted'},
  {id: 'p4', title: 'Road damaged', ward: 'Ward 8', area: 'Kuppakonam Pudur', ago: '6h', status: 'submitted'},
];

export type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  ago: string;
  audienceKey: TranslationKey;
  pinned: boolean;
};

export const MOCK_ANNOUNCEMENTS: AnnouncementItem[] = [
  {id: 'a1', title: 'Free medical camp this Sunday', body: 'Free health check-up and medicines at the community hall, Ward 5, from 9 AM to 4 PM.', ago: '1h', audienceKey: 'allWards', pinned: true},
  {id: 'a2', title: 'Water tanker schedule updated', body: 'Tankers will reach Ward 8 and Ward 12 at 7:30 AM daily until the pipeline repair completes.', ago: '6h', audienceKey: 'wardLevel', pinned: false},
  {id: 'a3', title: 'Road re-laying work begins', body: 'Main road re-laying in Ward 5 starts Monday. Expect minor diversions for one week.', ago: '1d', audienceKey: 'allWards', pinned: false},
];

export type BoothItem = {
  id: string;
  name: string;
  ward: string;
  agent: string;
  voters: number;
  coveragePct: number;
};

export const MOCK_BOOTHS: BoothItem[] = [
  {id: 'b1', name: 'Booth 12 - Govt School', ward: 'Ward 5', agent: 'Arjun Rajan', voters: 1240, coveragePct: 82},
  {id: 'b2', name: 'Booth 18 - Community Hall', ward: 'Ward 8', agent: 'Priya Sundaram', voters: 1110, coveragePct: 67},
  {id: 'b3', name: 'Booth 7 - Panchayat Office', ward: 'Ward 3', agent: 'Karthik Kumar', voters: 980, coveragePct: 91},
  {id: 'b4', name: 'Booth 22 - Library', ward: 'Ward 13', agent: 'Meena K', voters: 760, coveragePct: 54},
];

export type SurveyItem = {
  id: string;
  title: string;
  responses: number;
  target: number;
  status: 'active' | 'closed';
  ago: string;
};

export const MOCK_SURVEYS: SurveyItem[] = [
  {id: 's1', title: 'Drinking water satisfaction', responses: 842, target: 1000, status: 'active', ago: '2d'},
  {id: 's2', title: 'Road quality feedback', responses: 1000, target: 1000, status: 'closed', ago: '1w'},
  {id: 's3', title: 'Public transport needs', responses: 318, target: 800, status: 'active', ago: '4h'},
];

export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  ward: string;
  rsvp: number;
};

export const MOCK_EVENTS: EventItem[] = [
  {id: 'e1', title: 'Ward 5 grievance meeting', date: 'Jun 8', time: '10:00 AM', venue: 'Community Hall', ward: 'Ward 5', rsvp: 124},
  {id: 'e2', title: 'Tree plantation drive', date: 'Jun 12', time: '7:00 AM', venue: 'VOC Park', ward: 'Ward 3', rsvp: 86},
  {id: 'e3', title: 'Youth job fair', date: 'Jun 20', time: '9:30 AM', venue: 'Town Hall', ward: 'Ward 8', rsvp: 342},
];

export type MediaItem = {
  id: string;
  title: string;
  typeKey: TranslationKey;
  ago: string;
  views: number;
  icon: string;
};

export const MOCK_MEDIA: MediaItem[] = [
  {id: 'm1', title: 'Inauguration of new water tank', typeKey: 'photo', ago: '2d', views: 2400, icon: 'image-outline'},
  {id: 'm2', title: 'MLA address on road project', typeKey: 'video', ago: '5d', views: 8800, icon: 'play-circle-outline'},
  {id: 'm3', title: 'Press release: budget allocation', typeKey: 'document', ago: '1w', views: 1200, icon: 'file-document-outline'},
];

export type TeamMember = {
  id: string;
  name: string;
  roleKey: TranslationKey;
  area: string;
  phone: string;
  online: boolean;
};

export const MOCK_TEAM: TeamMember[] = [
  {id: 't1', name: 'Suresh Babu', roleKey: 'wardLeader', area: 'Ward 5', phone: '9876543220', online: true},
  {id: 't2', name: 'Lakshmi Narayanan', roleKey: 'coordinator', area: 'Ward 8', phone: '9876543221', online: true},
  {id: 't3', name: 'Ramesh Pillai', roleKey: 'boothAgent', area: 'Ward 3', phone: '9876543222', online: false},
  {id: 't4', name: 'Divya Mohan', roleKey: 'mediaManager', area: 'Constituency', phone: '9876543223', online: true},
];

export type ReportItem = {
  id: string;
  title: string;
  periodKey: TranslationKey;
  icon: string;
};

export const MOCK_REPORTS: ReportItem[] = [
  {id: 'r1', title: 'Monthly complaints summary', periodKey: 'thisMonth', icon: 'chart-box-outline'},
  {id: 'r2', title: 'Ward performance report', periodKey: 'thisQuarter', icon: 'chart-bar'},
  {id: 'r3', title: 'Volunteer activity report', periodKey: 'thisMonth', icon: 'account-group-outline'},
  {id: 'r4', title: 'Resolution time analysis', periodKey: 'thisYear', icon: 'timer-outline'},
];
