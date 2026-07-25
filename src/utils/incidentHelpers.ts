export const getIconForAffectation = (type: string): string => {
  const normalized = (type || '').trim().toLowerCase();
  if (normalized === 'total' || normalized === '❌') return '❌';
  if (normalized === 'parcial' || normalized === '⚠️') return '⚠️';
  return '✅';
};

export const normalizeAffectationType = (type: string): string => {
  const normalized = (type || '').trim().toLowerCase();
  if (normalized === 'total' || normalized === '❌') return 'Total';
  if (normalized === 'parcial' || normalized === '⚠️') return 'Parcial';
  return 'OK';
};

export const validateDateFormat = (dateStr: string): boolean => {
  const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4} ([01][0-9]|2[0-3]):([0-5][0-9])$/;
  return regex.test(dateStr);
};

export const formatDateTimeIfNeeded = (inputVal: string): string => {
  const digits = inputVal.replace(/\D/g, '');
  if (digits.length === 12) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} ${digits.slice(8, 10)}:${digits.slice(10, 12)}`;
  }
  return inputVal;
};

export const getCurrentFormattedDate = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};