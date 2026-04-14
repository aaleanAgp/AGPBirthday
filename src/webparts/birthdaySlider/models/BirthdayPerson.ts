export interface IBirthdayPerson {
  id: number;
  name: string;
  jobTitle: string;
  email: string;
  areaId?: string;
  areaName?: string;
  birthdayDate: Date;
  birthdayDay: number;
  birthdayMonth: number;
  isActive: boolean;
}
