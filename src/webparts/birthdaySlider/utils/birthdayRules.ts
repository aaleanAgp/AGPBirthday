import { IBirthdayPerson } from '../models/BirthdayPerson';
import { daysUntilBirthday } from './dateUtils';

/**
 * Determines whether the "Send Greeting" button should be enabled
 * for a given person.
 *
 * TODO: Confirm exact business rule with stakeholders. Current assumption:
 *   - Button is enabled ONLY on the exact birthday (daysUntil === 0).
 *
 * Possible variants to confirm:
 *   - Enable N days before/after?
 *   - Block if greeting was already sent today?
 *   - Show different text when enabled vs. disabled?
 */
export function isGreetingEnabled(person: IBirthdayPerson): boolean {
  return daysUntilBirthday(person.birthdayDay, person.birthdayMonth) === 0;
}

/**
 * Returns people sorted by proximity of their next birthday to today,
 * filtered to active records only, capped at `limit`.
 *
 * TODO: Confirm whether NUMBER_BIRHTDAY from Configuracion should override
 * the `limit` parameter here or be applied earlier.
 */
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
