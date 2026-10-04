import type { CSSProperties } from 'react';
import type { PokemonStat, StatName } from '../types';

const STAT_LABELS: Record<StatName, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  speed: 'Speed',
  special: 'Special',
};

/** Each block is 16 points, so 16 blocks span the 0–255 base-stat range. */
const BLOCKS = 16;
const POINTS_PER_BLOCK = 16;

/**
 * Base stats as rows of blocks: `ATTACK  055 ▮▮▮▯▯▯…`. The number carries
 * the information; the blocks are a decorative echo, hidden from screen readers.
 */
export function StatBars({ stats }: { stats: PokemonStat[] }) {
  return (
    <dl className="grid grid-cols-[auto_auto_1fr] items-center gap-x-3 gap-y-2.5">
      {stats.map((stat, index) => {
        const filled = Math.min(BLOCKS, Math.max(1, Math.round(stat.value / POINTS_PER_BLOCK)));
        return (
          <div key={stat.name} className="contents">
            <dt className="font-display text-2xs text-ink uppercase">{STAT_LABELS[stat.name]}</dt>
            <dd className="text-right font-display text-2xs text-ink">
              {String(stat.value).padStart(3, '0')}
            </dd>
            <dd aria-hidden="true" className="relative flex h-3 gap-0.5">
              <Blocks count={BLOCKS} className="bg-highlight" />
              {/* Filled blocks overlay the empty ones and tick in left to right. */}
              <span
                className="absolute inset-0 flex animate-fill gap-0.5"
                style={{ animationDelay: `${index * 60}ms` } as CSSProperties}
              >
                <Blocks count={BLOCKS} filled={filled} className="bg-ink" />
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function Blocks({ count, filled = count, className }: { count: number; filled?: number; className: string }) {
  return Array.from({ length: count }, (_, block) => (
    <span key={block} className={`flex-1 ${block < filled ? className : ''}`} />
  ));
}
