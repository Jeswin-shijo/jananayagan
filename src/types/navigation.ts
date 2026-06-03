import type {NavigatorScreenParams} from '@react-navigation/native';

export type UserRole = 'citizen' | 'politician' | 'admin' | 'volunteer';

export type RootStackParamList = {
  Auth: undefined;
  App: { role: UserRole };
};

export type AuthStackParamList = {
  Login: undefined;
  OTPVerification: { phone: string };
};

export type CitizenTabParamList = {
  CitizenHome: undefined;
  MyComplaints: undefined;
  SubmitPetition: {mode?: 'browse' | 'create'} | undefined;
  PublicPoll: undefined;
  CommunityFeed: {newPost?: CommunityPostParam} | undefined;
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
  ReportProblem: undefined;
  ComplaintTicket: { ticketId: string };
  ComplaintDetail: { ticketId: string };
  CreatePost: undefined;
};

export type PoliticianStackParamList = {
  PoliticianDashboard: undefined;
  VolunteerManagement: undefined;
  AISentimentDashboard: undefined;
  ElectionMode: undefined;
  ReportProblem: undefined;
  ComplaintTicket: { ticketId: string };
  SubmitPetition: {mode?: 'browse' | 'create'} | undefined;
  CommunityFeed: {newPost?: CommunityPostParam} | undefined;
  CreatePost: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
};
