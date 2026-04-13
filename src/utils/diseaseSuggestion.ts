import { Animal } from '@/data/mockData';
import { Lang } from '@/contexts/LanguageContext';

interface DiseaseSuggestion {
  key: string;
  name: Record<Lang, string>;
}

const diseases: DiseaseSuggestion[] = [
  { key: 'mastitis', name: { en: 'Mastitis', ar: 'التهاب الضرع', fr: 'Mammite' } },
  { key: 'fmd', name: { en: 'Foot-and-Mouth Disease', ar: 'الحمى القلاعية', fr: 'Fièvre aphteuse' } },
  { key: 'brucellosis', name: { en: 'Brucellosis', ar: 'البروسيلا', fr: 'Brucellose' } },
  { key: 'heat_stress', name: { en: 'Heat Stress', ar: 'الإجهاد الحراري', fr: 'Stress thermique' } },
  { key: 'milk_fever', name: { en: 'Milk Fever', ar: 'نقص الكالسيوم', fr: 'Fièvre de lait' } },
  { key: 'ketosis', name: { en: 'Ketosis / Metabolic Disorder', ar: 'الكيتوز واضطرابات التمثيل الغذائي', fr: 'Cétose / Trouble métabolique' } },
];

export function suggestDiseases(animal: Animal, lang: Lang): string[] {
  const { temperature: temp, heartRate: hr, motion } = animal;
  const isIdle = motion === 'idle';
  const suggestions: string[] = [];

  // Mastitis: temp 39.5–41, reduced movement
  if (temp >= 39.5 && temp <= 41 && isIdle) {
    suggestions.push(diseases.find(d => d.key === 'mastitis')!.name[lang]);
  }

  // Foot-and-Mouth: temp 40–42, high HR, low movement
  if (temp >= 40 && temp <= 42 && hr >= 90 && isIdle) {
    suggestions.push(diseases.find(d => d.key === 'fmd')!.name[lang]);
  }

  // Brucellosis: temp 39–40, almost normal movement
  if (temp >= 39 && temp <= 40 && !isIdle) {
    suggestions.push(diseases.find(d => d.key === 'brucellosis')!.name[lang]);
  }

  // Heat Stress: temp >39.5, very high HR, stress/irregular
  if (temp > 39.5 && hr >= 100) {
    suggestions.push(diseases.find(d => d.key === 'heat_stress')!.name[lang]);
  }

  // Milk Fever: temp normal or low (<39), very low/no movement
  if (temp < 39 && isIdle) {
    suggestions.push(diseases.find(d => d.key === 'milk_fever')!.name[lang]);
  }

  // Ketosis: temp normal, reduced activity, slight HR changes
  if (temp >= 37.5 && temp <= 39.5 && isIdle && hr >= 55 && hr <= 80) {
    suggestions.push(diseases.find(d => d.key === 'ketosis')!.name[lang]);
  }

  return suggestions;
}
