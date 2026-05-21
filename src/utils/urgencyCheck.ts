import { Animal } from '@/data/mockData';

/**
 * Returns true if the animal has dangerous symptoms requiring immediate vet attention.
 * Dangerous = very high temp (>40.5), very low temp (<35), extreme HR (>120 or <40),
 * or combination of high temp + idle + high HR.
 */
export function isDangerous(animal: Animal): boolean {
  const { temperature: temp, heartRate: hr, motion } = animal;
  if (temp == null || hr == null) return false;

  if (temp > 40.5) return true;
  if (temp < 35) return true;
  if (hr > 120 || hr < 40) return true;
  if (temp >= 40 && hr >= 100 && motion === 'idle') return true;

  return false;
}

