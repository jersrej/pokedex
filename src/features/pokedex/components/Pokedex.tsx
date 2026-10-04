import { ArrowLeft, Power, ScanLine } from 'lucide-react';
import { lazy, Suspense, useCallback, useState, type ReactNode } from 'react';
import { IconButton } from '../../../components/IconButton';
import { ScreenMessage } from '../../../components/ScreenMessage';
import { setDisplayMode, useDisplayMode, type DisplayMode } from '../../../lib/displayMode';
import { playSfx } from '../../../lib/sfx';
import { useMediaQuery } from '../../../lib/useMediaQuery';
import { PokemonBrowser } from '../../pokemon/components/PokemonBrowser';
import { useDeviceOpen } from '../hooks/useDeviceOpen';
import { useSelectedPokemon } from '../hooks/useSelectedPokemon';
import { DeviceCover } from './DeviceCover';
import { DisplayModeControl } from './DisplayModeControl';
import { Leds, Lens, StatusReadout, Vents } from './Hardware';
import { SoundToggle } from './SoundToggle';

// The entry screen is only needed once a Pokémon is picked.
const PokemonDetail = lazy(() => import('../../pokemon/components/PokemonDetail'));

/** Matches the `md` breakpoint the fold layout switches on in index.css. */
const FOLDING_LAYOUT = '(min-width: 48rem)';

/**
 * The device. At `md` and up it is two halves around a hinge, both visible.
 * Below that it is a handheld with one screen: the list, or the entry
 * sliding over it. See index.css for the fold mechanics.
 */
export function Pokedex() {
  const { open, animating, openDevice, closeDevice } = useDeviceOpen();
  const { selectedId, select, clear } = useSelectedPokemon();
  const folding = useMediaQuery(FOLDING_LAYOUT);

  // Sound effects (silent unless switched on) belong to deliberate presses
  // only, so the automatic first-visit unfold never makes a noise.
  const handleSelect = useCallback(
    (id: number, options?: { replace?: boolean }) => {
      playSfx(options?.replace ? 'move' : 'select');
      select(id, options);
    },
    [select],
  );
  const handleBack = useCallback(() => {
    playSfx('back');
    clear();
  }, [clear]);
  // Counts display changes; each one replays the LCD refresh on both screens.
  const displayMode = useDisplayMode();
  const [refreshes, setRefreshes] = useState(0);
  const handleDisplayMode = (mode: DisplayMode) => {
    if (mode === displayMode) return;
    playSfx('display');
    setDisplayMode(mode);
    setRefreshes((count) => count + 1);
  };

  const handleOpen = () => {
    playSfx('open');
    openDevice();
  };
  const handleClose = () => {
    playSfx('close');
    closeDevice();
  };

  const view = selectedId === null ? 'list' : 'detail';
  // Whatever is covered or off-screen is taken out of the tab order.
  const listHidden = !open || (!folding && view === 'detail');
  const detailHidden = !open || (!folding && view === 'list');

  return (
    <main className="stage">
      <div
        className="device"
        data-open={open}
        data-animating={animating}
        data-view={view}
        data-display={displayMode}
      >
        <section
          aria-label="Pokémon index"
          inert={listHidden}
          className="device-half device-half-left flex flex-col gap-3 border-body-dark bg-body p-3 md:rounded-l-3xl md:rounded-r-lg md:border-2 md:p-5"
        >
          <header className="flex items-center gap-3">
            <Lens className="size-11" />
            <Leds />
            <h1 className="font-display text-xs text-body-ink uppercase sm:text-sm">
              Pokédex
            </h1>
            <div className="ml-auto flex">
              <SoundToggle />
              <IconButton label="Close Pokédex" onClick={handleClose}>
                <Power className="size-5" aria-hidden="true" />
              </IconButton>
            </div>
          </header>
          <Screen refreshes={refreshes}>
            <PokemonBrowser selectedId={selectedId} onSelect={handleSelect} />
          </Screen>
          <DisplayModeControl mode={displayMode} onChange={handleDisplayMode} />
        </section>

        <div className="device-half device-half-right">
          <section
            aria-label="Pokémon entry"
            inert={detailHidden}
            className="device-face flex flex-col gap-3 border-body-dark bg-body p-3 md:rounded-l-lg md:rounded-r-3xl md:border-2 md:p-5"
          >
            <header className="flex h-11 items-center gap-3">
              <IconButton label="Back to list" onClick={handleBack} className="md:hidden">
                <ArrowLeft className="size-5" aria-hidden="true" />
              </IconButton>
              <StatusReadout />
              <div className="ml-auto">
                <Vents />
              </div>
            </header>
            <Screen refreshes={refreshes}>
              {selectedId === null ? (
                <ScreenMessage
                  role="status"
                  icon={<ScanLine className="size-8" aria-hidden="true" />}
                  title="Ready to scan"
                >
                  Select a Pokémon from the index to view its entry.
                </ScreenMessage>
              ) : (
                <Suspense fallback={<ScreenMessage role="status" title="Scanning…" busy />}>
                  <PokemonDetail id={selectedId} onSelect={handleSelect} onClose={handleBack} />
                </Suspense>
              )}
            </Screen>
          </section>

          {/* Outside of the right half: the cover you see when it is folded shut. */}
          <div className="device-face device-face-back max-md:hidden" inert={open}>
            <DeviceCover onOpen={handleOpen} />
          </div>
        </div>

        {/* Hinge between the halves. */}
        <div
          aria-hidden="true"
          className="absolute inset-y-6 left-1/2 z-10 w-3 -translate-x-1/2 rounded-full border-2 border-body-dark bg-body-light max-md:hidden"
        />

        {/* Handheld: the same cover, as a lid over the single screen. */}
        <div className="device-lid" inert={open}>
          <DeviceCover onOpen={handleOpen} />
        </div>
      </div>
    </main>
  );
}

/** A display set into the shell: dark bezel around an LCD panel. */
function Screen({ children, refreshes }: { children: ReactNode; refreshes: number }) {
  return (
    <div className="min-h-0 flex-1 rounded-xl rounded-br-4xl bg-bezel p-2 md:p-3">
      <div className="lcd h-full overflow-hidden rounded-sm">
        {children}
        {/* Remounted per display change, which restarts its one-shot animation. */}
        {refreshes > 0 && <span key={refreshes} aria-hidden="true" className="lcd-refresh" />}
      </div>
    </div>
  );
}
