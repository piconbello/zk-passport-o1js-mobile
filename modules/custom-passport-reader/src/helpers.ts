export const pad = (value: string, length: number) => {
  return value.padEnd(length, '<').substring(0, length);
}

export const calcCheckSum = (checkString: string): number => {
  const multipliers = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < checkString.length; i++) {
    const number = parseInt(checkString[i], 36) || 0;
    sum += number * multipliers[i % multipliers.length];
  }
  return (sum % 10);
}