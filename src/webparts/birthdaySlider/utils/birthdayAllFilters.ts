import { IBirthdayPerson } from '../models/BirthdayPerson';

export interface IDayMonthValue {
  day: number;
  month: number;
}

export function getAllBirthdaysSorted(people: IBirthdayPerson[]): IBirthdayPerson[] {
  return people
    .filter(person => person.isActive)
    .slice()
    .sort((left, right) => {
      if (left.birthdayMonth !== right.birthdayMonth) {
        return left.birthdayMonth - right.birthdayMonth;
      }

      return left.birthdayDay - right.birthdayDay;
    });
}

export function parseDayMonthInput(value: string): IDayMonthValue | null {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!match) {
    return null;
  }

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);

  if (month < 1 || month > 12) {
    return null;
  }

  const maxDay = new Date(2000, month, 0).getDate();
  if (day < 1 || day > maxDay) {
    return null;
  }

  return { day, month };
}

export function matchesBirthdaySearch(person: IBirthdayPerson, query: string): boolean {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    person.name,
    person.email,
    person.jobTitle,
    person.areaName || ''
  ].map(normalizeText).join(' ');

  return haystack.indexOf(normalizedQuery) >= 0;
}

export function isBirthdayWithinRange(
  person: IBirthdayPerson,
  start: IDayMonthValue | null,
  end: IDayMonthValue | null
): boolean {
  if (!start && !end) {
    return true;
  }

  const value = toDayOfYear({ day: person.birthdayDay, month: person.birthdayMonth });

  if (start && end) {
    const startValue = toDayOfYear(start);
    const endValue = toDayOfYear(end);

    if (startValue <= endValue) {
      return value >= startValue && value <= endValue;
    }

    return value >= startValue || value <= endValue;
  }

  if (start) {
    return value >= toDayOfYear(start);
  }

  return value <= toDayOfYear(end as IDayMonthValue);
}

export function filterBirthdays(
  people: IBirthdayPerson[],
  query: string,
  start: IDayMonthValue | null,
  end: IDayMonthValue | null
): IBirthdayPerson[] {
  return getAllBirthdaysSorted(people).filter(person => (
    matchesBirthdaySearch(person, query) && isBirthdayWithinRange(person, start, end)
  ));
}

function normalizeText(value: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function toDayOfYear(value: IDayMonthValue): number {
  const date = new Date(2000, value.month - 1, value.day);
  const start = new Date(2000, 0, 1);
  return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}
