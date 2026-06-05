import {Complaint, Poll, Petition, Volunteer, SentimentData, Notification} from '@appTypes/api';

// Civic announcements shown to citizens (power cuts, water supply, roadwork, etc.).
export type AnnouncementCategory =
  | 'power'
  | 'water'
  | 'roadwork'
  | 'health'
  | 'weather'
  | 'event'
  | 'general';

export interface CitizenAnnouncement {
  id: string;
  category: AnnouncementCategory;
  title: string;
  body: string;
  area: string;
  createdAt: string;
}

export const MOCK_CITIZEN_ANNOUNCEMENTS: CitizenAnnouncement[] = [
  {
    id: 'an-1',
    category: 'power',
    title: 'Scheduled power cut today',
    body: 'Power supply will be shut down from 10:00 AM to 2:00 PM for maintenance work on the main transformer.',
    area: 'Anna Nagar',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'an-2',
    category: 'water',
    title: 'Water supply interruption',
    body: 'Drinking water supply will be disrupted tomorrow morning due to pipeline repair near the junction.',
    area: 'T. Nagar',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'an-3',
    category: 'roadwork',
    title: 'Road re-laying work begins',
    body: 'Main road re-laying starts Monday. Expect minor traffic diversions for about one week.',
    area: 'Adyar',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'an-4',
    category: 'health',
    title: 'Free medical camp this Sunday',
    body: 'Free health check-up and medicines at the community hall from 9:00 AM to 4:00 PM. All residents welcome.',
    area: 'Velachery',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'an-5',
    category: 'weather',
    title: 'Heavy rain alert',
    body: 'Heavy rainfall expected over the next 48 hours. Avoid low-lying areas and keep emergency numbers handy.',
    area: 'Coimbatore',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'an-6',
    category: 'event',
    title: 'Ward grievance meeting',
    body: 'Public grievance meeting with the local representative on Saturday at 10:00 AM in the community hall.',
    area: 'Singanallur',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: '1',
    ticketId: 'JAN-001234-001',
    category: 'road',
    subCategory: 'Pothole',
    description: 'Large pothole on main road causing accidents near bus stop. Needs immediate repair.',
    status: 'in_progress',
    priority: 'high',
    images: [],
    location: {latitude: 11.0168, longitude: 76.9558, address: 'Anna Nagar, Chennai'},
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    ticketId: 'JAN-001234-002',
    category: 'water',
    subCategory: 'Water leakage',
    description: 'Pipe leakage on street corner causing water wastage for 3 days.',
    status: 'submitted',
    priority: 'medium',
    images: [],
    location: {latitude: 11.0168, longitude: 76.9558, address: 'T. Nagar, Chennai'},
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: '3',
    ticketId: 'JAN-001234-003',
    category: 'electricity',
    subCategory: 'Street light',
    description: 'Street lights not working in residential area for past 2 weeks.',
    status: 'resolved',
    priority: 'low',
    images: [],
    location: {latitude: 11.0168, longitude: 76.9558, address: 'Adyar, Chennai'},
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const MOCK_POLLS: Poll[] = [
  {
    id: '1',
    question: 'Which area needs road repair most urgently?',
    options: [
      {id: 'a', text: 'Anna Nagar Main Road', votes: 245, percentage: 42},
      {id: 'b', text: 'T. Nagar Ring Road', votes: 180, percentage: 31},
      {id: 'c', text: 'Adyar Bridge Road', votes: 98, percentage: 17},
      {id: 'd', text: 'Velachery Highway', votes: 58, percentage: 10},
    ],
    endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    totalVotes: 581,
    hasVoted: false,
    status: 'active',
  },
  {
    id: '2',
    question: 'Should new parks be built in this constituency?',
    options: [
      {id: 'a', text: 'Yes, strongly agree', votes: 892, percentage: 68},
      {id: 'b', text: 'Yes, but later', votes: 210, percentage: 16},
      {id: 'c', text: 'No, not needed', votes: 130, percentage: 10},
      {id: 'd', text: 'Neutral', votes: 78, percentage: 6},
    ],
    endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    totalVotes: 1310,
    hasVoted: true,
    votedOptionId: 'a',
    status: 'active',
  },
];

export const MOCK_PETITIONS: Petition[] = [
  {
    id: '1',
    title: 'Install speed breakers near Government School',
    description: 'Multiple accidents have occurred near the school. Requesting immediate installation of speed breakers.',
    category: 'Road Safety',
    targetSignatures: 500,
    currentSignatures: 342,
    constituency: 'Anna Nagar',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    createdBy: 'Citizen User',
  },
  {
    id: '2',
    title: 'Demand 24-hour water supply in Ward 14',
    description: 'Residents face severe water shortage. Requesting government action for regular water supply.',
    category: 'Water',
    targetSignatures: 1000,
    currentSignatures: 876,
    constituency: 'T. Nagar',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    createdBy: 'Citizens Forum',
  },
];

export const MOCK_VOLUNTEERS: Volunteer[] = [
  {id: '1', name: 'Arjun Rajan', area: 'Anna Nagar', phone: '9876543210', email: 'arjun@example.com', activeComplaints: 3, totalResolved: 45, isAvailable: true, performanceScore: 4.5},
  {id: '2', name: 'Priya Sundaram', area: 'T. Nagar', phone: '9876543211', email: 'priya@example.com', activeComplaints: 1, totalResolved: 32, isAvailable: true, performanceScore: 4.8},
  {id: '3', name: 'Karthik Kumar', area: 'Adyar', phone: '9876543212', email: 'karthik@example.com', activeComplaints: 5, totalResolved: 67, isAvailable: false, performanceScore: 4.2},
];

export const MOCK_SENTIMENT_DATA: SentimentData = {
  overallScore: 68,
  trend: [
    {date: '2024-01-01', score: 55},
    {date: '2024-02-01', score: 58},
    {date: '2024-03-01', score: 62},
    {date: '2024-04-01', score: 65},
    {date: '2024-05-01', score: 68},
  ],
  byCategory: [
    {category: 'Road', score: 52, count: 234},
    {category: 'Water', score: 71, count: 189},
    {category: 'Electricity', score: 75, count: 145},
    {category: 'Sanitation', score: 48, count: 312},
  ],
  topComments: [
    {id: '1', text: 'The road repair work done last month is excellent!', sentiment: 'positive', score: 0.92},
    {id: '2', text: 'Water shortage issue still not resolved despite multiple complaints.', sentiment: 'negative', score: 0.15},
    {id: '3', text: 'Volunteer response time has improved significantly.', sentiment: 'positive', score: 0.88},
  ],
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {id: '1', title: 'Complaint Update', body: 'Your complaint JAN-001234-001 is now In Progress', type: 'complaint_update', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString()},
  {id: '2', title: 'New Poll Available', body: 'Vote on the new road development poll in your area', type: 'poll_new', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString()},
  {id: '3', title: 'Petition Milestone', body: 'Your petition reached 300 signatures!', type: 'petition_update', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString()},
];

// Community feed posts shown on the citizen/volunteer Home feed.
export type FeedComment = {id: string; author: string; text: string};
export type FeedAccent = 'tileGreen' | 'tileTeal' | 'tileAmber' | 'tileBlue' | 'tilePurple';

export interface CommunityPost {
  id: string;
  author: string;
  role: string;
  area: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  accent: FeedAccent;
  imageUris?: string[];
  comments: FeedComment[];
}

export const SAMPLE_POST_IMAGE = 'https://images.unsplash.com/photo-1541919329513-35f7af297129?w=900&q=80';

export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'Meena K',
    role: 'Resident',
    area: 'Anna Nagar',
    content: 'Street lights near 4th Avenue are working again tonight. Thanks to everyone who reported and followed up.',
    createdAt: '18 min',
    likes: 42,
    isLiked: false,
    accent: 'tileGreen',
    comments: [
      {id: 'c1', author: 'Arun', text: 'Great update. This area feels safer now.'},
      {id: 'c2', author: 'Priya', text: 'We should check the next lane too.'},
    ],
  },
  {
    id: 'post-2',
    author: 'Ward Volunteer',
    role: 'Volunteer',
    area: 'T. Nagar',
    content: 'Water tanker schedule for tomorrow: 7:30 AM near the community hall and 8:15 AM near West Street.',
    createdAt: '1 hr',
    likes: 87,
    isLiked: true,
    accent: 'tileTeal',
    imageUris: [SAMPLE_POST_IMAGE],
    comments: [
      {id: 'c3', author: 'Siva', text: 'Please add South Street if possible.'},
    ],
  },
  {
    id: 'post-3',
    author: 'JANANAYAGAN Desk',
    role: 'Official',
    area: 'City Updates',
    content: 'Public poll is open for pedestrian crossing improvements. Share your vote before Friday evening.',
    createdAt: '3 hr',
    likes: 126,
    isLiked: false,
    accent: 'tileAmber',
    comments: [],
  },
];
