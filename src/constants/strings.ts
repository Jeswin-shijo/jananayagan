export const AppStrings = {
  appName: 'JANANAYAGAN',
  tagline: 'Voice of the People',

  // Common
  submit: 'Submit',
  cancel: 'Cancel',
  retry: 'Retry',
  loading: 'Loading...',
  save: 'Save',
  edit: 'Edit',
  delete: 'Delete',
  confirm: 'Confirm',
  back: 'Back',
  next: 'Next',
  done: 'Done',
  search: 'Search',
  filter: 'Filter',
  viewAll: 'View All',

  // Auth
  loginTitle: 'Welcome to JANANAYAGAN',
  loginSubtitle: 'Voice of the People',
  enterPhone: 'Enter your mobile number',
  sendOTP: 'Send OTP',
  enterOTP: 'Enter OTP',
  verifyOTP: 'Verify OTP',
  resendOTP: 'Resend OTP',
  selectRole: 'Select your role',

  // Roles
  citizen: 'Citizen',
  politician: 'Politician',
  admin: 'Admin',
  volunteer: 'Volunteer',

  // Complaints
  reportProblem: 'Report a Problem',
  myComplaints: 'My Complaints',
  complaintSubmitted: 'Complaint Submitted!',
  ticketId: 'Ticket ID',
  noComplaints: 'No complaints yet',
  noComplaintsSubtitle: 'Report a problem to get started',

  // Petitions
  submitPetition: 'Submit a Petition',
  myPetitions: 'My Petitions',
  noPetitions: 'No petitions yet',
  signatures: 'signatures',

  // Polls
  publicPoll: 'Public Polls',
  voteNow: 'Vote Now',
  viewResults: 'View Results',
  noPolls: 'No active polls',

  // Errors
  errorGeneric: 'Something went wrong. Please try again.',
  errorNetwork: 'No internet connection',
  errorOffline: "You're offline. Some features may not work.",
  errorRequired: 'This field is required',
  errorInvalidPhone: 'Enter a valid 10-digit phone number',
  errorInvalidOTP: 'OTP must be 6 digits',
  errorMinLength: (min: number) => `Minimum ${min} characters required`,
  errorMaxLength: (max: number) => `Maximum ${max} characters allowed`,
};
