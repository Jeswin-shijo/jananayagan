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
  SubmitPetition: undefined;
  PublicPoll: undefined;
  Profile: undefined;
};

export type CitizenStackParamList = {
  CitizenTabs: NavigatorScreenParams<CitizenTabParamList> | undefined;
  ReportProblem: undefined;
  ComplaintTicket: { ticketId: string };
  ComplaintDetail: { ticketId: string };
};

export type PoliticianStackParamList = {
  PoliticianDashboard: undefined;
  VolunteerManagement: undefined;
  AISentimentDashboard: undefined;
  ElectionMode: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
};
