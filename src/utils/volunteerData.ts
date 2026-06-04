import {ComplaintPriority} from '@appTypes/api';
import {TranslationKey} from '@constants/i18n';

export type TaskStatus = 'assigned' | 'in_progress' | 'done';

export type VolunteerTask = {
  id: string;
  ticketId: string;
  title: string;
  ward: string;
  area: string;
  priority: ComplaintPriority;
  status: TaskStatus;
  ago: string;
};

export const MOCK_TASKS: VolunteerTask[] = [
  {id: 'vt1', ticketId: 'JAN-002301', title: 'Overflowing garbage near market', ward: 'Ward 5', area: 'Ganapathy', priority: 'high', status: 'assigned', ago: '1h'},
  {id: 'vt2', ticketId: 'JAN-002298', title: 'Broken street light pole', ward: 'Ward 5', area: 'East Street', priority: 'medium', status: 'in_progress', ago: '4h'},
  {id: 'vt3', ticketId: 'JAN-002284', title: 'Water stagnation after rain', ward: 'Ward 8', area: 'Bus Stand Rd', priority: 'high', status: 'assigned', ago: '1d'},
  {id: 'vt4', ticketId: 'JAN-002270', title: 'Park bench repair', ward: 'Ward 5', area: 'VOC Park', priority: 'low', status: 'done', ago: '2d'},
];

export type HouseLean = 'supporter' | 'neutral' | 'opposition' | null;

export type FieldHouse = {
  id: string;
  doorNo: string;
  street: string;
  voters: number;
  visited: boolean;
  lean: HouseLean;
};

export const MOCK_HOUSES: FieldHouse[] = [
  {id: 'h1', doorNo: '12/4', street: 'East Car Street', voters: 4, visited: true, lean: 'supporter'},
  {id: 'h2', doorNo: '14', street: 'East Car Street', voters: 3, visited: true, lean: 'neutral'},
  {id: 'h3', doorNo: '16/A', street: 'East Car Street', voters: 5, visited: false, lean: null},
  {id: 'h4', doorNo: '21', street: 'North Street', voters: 2, visited: false, lean: null},
  {id: 'h5', doorNo: '23', street: 'North Street', voters: 6, visited: true, lean: 'opposition'},
];

export type VolunteerBroadcast = {
  id: string;
  from: string;
  message: string;
  ago: string;
};

export const MOCK_BROADCASTS: VolunteerBroadcast[] = [
  {id: 'vb1', from: 'Suresh Babu', message: 'Focus on Ward 5 garbage complaints today — target 10 resolutions before 5 PM.', ago: '30m'},
  {id: 'vb2', from: 'MLA Office', message: 'Door-to-door drive in East Car Street this evening. Carry voter slips.', ago: '3h'},
];

export type VolunteerStat = {key: string; labelKey: TranslationKey; value: string; icon: string; tone: 'info' | 'warning' | 'success'};

export const MOCK_VOLUNTEER_STATS: VolunteerStat[] = [
  {key: 'assigned', labelKey: 'assignedTasks', value: '3', icon: 'clipboard-list-outline', tone: 'info'},
  {key: 'progress', labelKey: 'inProgress', value: '1', icon: 'progress-wrench', tone: 'warning'},
  {key: 'resolved', labelKey: 'resolvedToday', value: '7', icon: 'check-circle-outline', tone: 'success'},
];
