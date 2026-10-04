const NAME_OVERRIDES: Record<string, string> = {
  'nidoran-f': 'Nidoran♀',
  'nidoran-m': 'Nidoran♂',
  'mr-mime': 'Mr. Mime',
  farfetchd: 'Farfetch’d',
};

/** `mr-mime` → `Mr. Mime`. */
export function formatSlug(slug: string): string {
  return (
    NAME_OVERRIDES[slug] ??
    slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  );
}

/** `25` → `025`, as the original Pokédex numbers its pages. */
export function formatDexNumber(id: number): string {
  return String(id).padStart(3, '0');
}

export function formatHeight(metres: number): string {
  return `${metres.toFixed(1)} m`;
}

export function formatWeight(kilograms: number): string {
  return `${kilograms.toFixed(1)} kg`;
}

const ROMAN: Record<string, number> = {
  i: 1,
  ii: 2,
  iii: 3,
  iv: 4,
  v: 5,
  vi: 6,
  vii: 7,
  viii: 8,
  ix: 9,
  x: 10,
};

/** `generation-iv` → `4`. */
export function parseGeneration(name: string): number | null {
  return ROMAN[name.replace('generation-', '')] ?? null;
}

/** Game text is hard-wrapped with newlines, form feeds and soft hyphens. */
export function cleanFlavorText(text: string): string {
  return text
    .replace(/­\s*/g, '')
    .replace(/[\f\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
