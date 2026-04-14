import { IBirthdayPerson } from '../models/BirthdayPerson';
import { daysUntilBirthday } from './dateUtils';

export function isGreetingEnabled(person: IBirthdayPerson): boolean {
  return daysUntilBirthday(person.birthdayDay, person.birthdayMonth) === 0;
}

export function getUpcomingBirthdays(
  people: IBirthdayPerson[],
  limit = 10
): IBirthdayPerson[] {
  return people
    .filter(p => p.isActive)
    .map(p => ({
      person: p,
      daysUntil: daysUntilBirthday(p.birthdayDay, p.birthdayMonth)
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, limit)
    .map(item => item.person);
}
