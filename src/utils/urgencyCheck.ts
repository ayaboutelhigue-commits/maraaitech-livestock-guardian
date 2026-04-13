import { Animal } from '@/data/mockData';

/**
 * Returns true if the animal has dangerous symptoms requiring immediate vet attention.
 * Dangerous = very high temp (>40.5), very low temp (<35), extreme HR (>120 or <40),
 * or combination of high temp + idle + high HR.
 */
export function isDangerous(animal: Animal): boolean {
  const { temperature: temp, heartRate: hr, motion } = animal;

  // Very high fever
  if (temp > 40.5) return true;

  // Hypothermia
  if (temp < 35) return true;

  // Extreme heart rate
  if (hr > 120 || hr < 40) return true;

  // High temp + high HR + no movement (collapse risk)
  if (temp >= 40 && hr >= 100 && motion === 'idle') return true;

  return false;
}
