import { parse, isValid, formatISO } from 'date-fns';

const MONTH_MAP: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

export function inferDateFromFileName(fileName: string): string {
  const match = fileName.match(/(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[-\s]?(\d{4})/i);

  if (!match) {
    return formatISO(new Date(), { representation: 'date' });
  }

  const monthRaw = match[1].slice(0, 3);
  const year = match[2];
  const month = MONTH_MAP[monthRaw[0].toUpperCase() + monthRaw.slice(1).toLowerCase()] ?? '01';
  return `${year}-${month}-01`;
}

export function toIsoDate(value: string): string {
  const parsed = parse(value, 'yyyy-MM-dd', new Date());
  if (!isValid(parsed)) {
    return formatISO(new Date(), { representation: 'date' });
  }
  return formatISO(parsed, { representation: 'date' });
}
