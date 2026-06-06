import type {NavigatorScreenParams} from '@react-navigation/native';

export type UserRole = 'citizen' | 'politician' | 'admin' | 'volunteer';
export type Gender = 'male' | 'female' | 'other';

export type RootStackParamList = {
  Auth: undefined;
  App: { role: UserRole };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: {
    phone: string;
    role: UserRole;
    gender?: Gender;
    registrationData?: {name: string; dob: string; wardNumber: string};
  };
};

export type CitizenTabParamList = {
  // The Community feed is the "Home" tab. Dashboard/Petition/Polls/Notifications are
  // pushed stack screens (see CitizenStackParamList) so they get proper back navigation.
  CommunityFeed: {newPost?: CommunityPostParam} | undefined;
  MyComplaints: undefined;
  Petition: undefined;
  Profile: undefined;
};

export type CommunityPostParam = {
  id: string;
  author: string;
  role: string;
  area: string;
  content: string;
  createdAt: string;
  imageUris: string[];
};

export type CitizenStackParamList = {
  CitizenTabs: NavigatorScreenParams<CitizenTabParamList> | undefined;
  Dashboard: undefined;
  SubmitPetition: {mode?: 'browse' | 'create'} | undefined;
  PublicPoll: undefined;
  Announcements: undefined;
  WomenSafety: undefined;
  Notifications: undefined;
  ReportProblem: undefined;
  SilentReport: undefined;
  NearbyHelp: undefined;
  RideTracker: undefined;
  SafeRoute: undefined;
  ComplaintTicket: { ticketId: string };
  PetitionDetail: { petitionId: string };
  Success: { kind: 'complaint' | 'petition'; refId: string };
  ComplaintDetail: { ticketId: string };
  CreatePost: undefined;
};

// Drawer = the politician's main navigation hub (mirrors the web sidebar)
export type PoliticianDrawerParamList = {
  PoliticianDashboard: undefined;
  HeatMap: undefined;
  Complaints: undefined;
  Announcements: undefined;
  PublicPolls: undefined;
  VolunteerManagement: undefined;
  BoothManagement: undefined;
  Surveys: undefined;
  Events: undefined;
  MediaCenter: undefined;
  Reports: undefined;
  AISentimentDashboard: undefined;
  ElectionMode: undefined;
  Profile: undefined;
  Team: undefined;
  Settings: undefined;
  SupportHelp: undefined;
};

// Stack wraps the drawer so detail screens can be pushed over it
export type PoliticianStackParamList = {
  PoliticianDrawer: NavigatorScreenParams<PoliticianDrawerParamList> | undefined;
  ReportProblem: undefined;
  ComplaintTicket: { ticketId: string };
  Success: { kind: 'complaint' | 'petition'; refId: string };
  SubmitPetition: {mode?: 'browse' | 'create'} | undefined;
  CommunityFeed: {newPost?: CommunityPostParam} | undefined;
  CreatePost: undefined;
  WomenSafety: undefined;
  SafeRoute: undefined;
  RideTracker: undefined;
  SilentReport: undefined;
  NearbyHelp: undefined;
  Notifications: undefined;
};

export type VolunteerTabParamList = {
  // Community feed is the "Home" tab; Dashboard holds the volunteer overview.
  CommunityFeed: {newPost?: CommunityPostParam} | undefined;
  Dashboard: undefined;
  VolunteerTasks: undefined;
  FieldWork: undefined;
  Profile: undefined;
};

export type VolunteerStackParamList = {
  VolunteerTabs: NavigatorScreenParams<VolunteerTabParamList> | undefined;
  ReportProblem: undefined;
  ComplaintTicket: { ticketId: string };
  Success: { kind: 'complaint' | 'petition'; refId: string };
  SubmitPetition: {mode?: 'browse' | 'create'} | undefined;
  CreatePost: undefined;
  WomenSafety: undefined;
  SafeRoute: undefined;
  RideTracker: undefined;
  SilentReport: undefined;
  NearbyHelp: undefined;
  Notifications: undefined;
};

export type AdminDrawerParamList = {
  AdminDashboard: undefined;
  UserManagement: undefined;
  Constituencies: undefined;
  Moderation: undefined;
  Complaints: undefined;
  Announcements: undefined;
  Reports: undefined;
  Profile: undefined;
  Settings: undefined;
  SupportHelp: undefined;
};

export type AdminStackParamList = {
  AdminDrawer: NavigatorScreenParams<AdminDrawerParamList> | undefined;
  ComplaintTicket: { ticketId: string };
  Success: { kind: 'complaint' | 'petition'; refId: string };
  WomenSafety: undefined;
  SafeRoute: undefined;
  RideTracker: undefined;
  SilentReport: undefined;
  NearbyHelp: undefined;
  Notifications: undefined;
};
