import { ArrowLeft, Power, ScanLine } from 'lucide-react';
import { lazy, Suspense, useCallback, useRef, useState, type ReactNode } from 'react';
import { IconButton } from '../../../components/IconButton';
import { ScreenMessage } from '../../../components/ScreenMessage';
import { setDisplayMode, useDisplayMode, type DisplayMode } from '../../../lib/displayMode';
import { playSfx } from '../../../lib/sfx';
import { useMediaQuery } from '../../../lib/useMediaQuery';
import {
  PokemonBrowser,
  type PokemonBrowserHandle,
} from '../../pokemon/components/PokemonBrowser';
import { DEX, isInDex, nextInDex, previousInDex } from '../../pokemon/dex';
import { useDeviceOpen } from '../hooks/useDeviceOpen';
import { useSelectedPokemon } from '../hooks/useSelectedPokemon';
import { ActionKeys } from './ActionKeys';
import { DeviceCover } from './DeviceCover';
import { DisplayModeControl } from './DisplayModeControl';
import { DPad, type PadDirection } from './DPad';
import { Engraving, Leds, Lens, StatusReadout, Vents } from './Hardware';
import { SoundToggle } from './SoundToggle';

// The entry screen is only needed once a Pokémon is picked.
const PokemonDetail = lazy(() => import('../../pokemon/components/PokemonDetail'));

/** Matches the `md` breakpoint the fold layout switches on in index.css. */
const FOLDING_LAYOUT = '(min-width: 48rem)';

/**
 * The device. At `md` and up it is two halves around a hinge, both visible.
 * Below that it is a handheld with one screen: the list, or the entry
 * sliding over it. See index.css for the fold mechanics and the hardware.
 */
export function Pokedex() {
  const { open, animating, boot, openDevice, closeDevice, skipBoot } = useDeviceOpen();
  const booting = boot.phase !== 'done';
  const browserRef = useRef<PokemonBrowserHandle>(null);
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
    // Pressing the cover mid-boot skips the rest of it.
    if (booting) return skipBoot();
    playSfx('open');
    openDevice();
  };
  const handleClose = () => {
    playSfx('close');
    closeDevice();
  };

  const handlePad = (direction: PadDirection) => {
    if (direction === 'up') return browserRef.current?.step(-1);
    if (direction === 'down') return browserRef.current?.step(1);
    const id =
      selectedId === null || !isInDex(selectedId)
        ? DEX.first
        : direction === 'left'
          ? previousInDex(selectedId)
          : nextInDex(selectedId);
    handleSelect(id, { replace: selectedId !== null });
  };

  const view = selectedId === null ? 'list' : 'detail';
  // Whatever is covered or off-screen is taken out of the tab order.
  const listHidden = !open || (!folding && view === 'detail');
  const detailHidden = !open || (!folding && view === 'list');

  return (
    <main className="stage">
      <p role="status" className="sr-only">
        {booting && 'Pokédex starting up'}
      </p>
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
          className="shell device-half device-half-left flex flex-col gap-3 rounded-2xl p-3 md:rounded-l-3xl md:rounded-r-lg md:p-5"
        >
          <header className="flex items-center gap-3">
            <Lens className="size-11" />
            <Leds powered={boot.phase !== 'off'} />
            <h1 className="font-display text-xs text-body-ink uppercase sm:text-sm">
              Pokédex
            </h1>
            <div className="ml-auto flex gap-2">
              <SoundToggle />
              <IconButton label="Close Pokédex" onClick={handleClose}>
                <Power className="size-5" aria-hidden="true" />
              </IconButton>
            </div>
          </header>
          <Screen refreshes={refreshes}>
            <PokemonBrowser ref={browserRef} selectedId={selectedId} onSelect={handleSelect} />
          </Screen>
          <div className="flex flex-col justify-center gap-4 md:h-32">
            <DisplayModeControl mode={displayMode} onChange={handleDisplayMode} />
            <div className="flex items-center justify-between max-md:hidden">
              <Vents />
              <Engraving>{`${DEX.region} edition`}</Engraving>
            </div>
          </div>
        </section>

        <div className="device-half device-half-right">
          <section
            aria-label="Pokémon entry"
            inert={detailHidden}
            className="shell device-face flex flex-col gap-3 rounded-2xl p-3 md:rounded-l-lg md:rounded-r-3xl md:p-5"
          >
            <header className="flex h-11 items-center gap-3">
              <IconButton label="Back to list" onClick={handleBack} className="md:hidden">
                <ArrowLeft className="size-5" aria-hidden="true" />
              </IconButton>
              <StatusReadout />
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
            {/* The control cluster: D-pad, then the two action keys. Too short
                for the pad (a phone on its side)? The screen keeps the room. */}
            <div className="flex items-center gap-4 md:h-32">
              <DPad onPress={handlePad} />
              <ActionKeys selectedId={selectedId} />
              <div className="ml-auto flex flex-col items-end gap-3 max-[26rem]:hidden md:max-lg:hidden">
                <Vents />
                <Engraving>Pokédex</Engraving>
              </div>
            </div>
          </section>

          {/* Outside of the right half: the cover you see when it is folded shut. */}
          <div className="device-face device-face-back max-md:hidden" inert={open}>
            <DeviceCover boot={boot} onOpen={handleOpen} />
          </div>
        </div>

        {/* Hinge between the halves: three knuckles on one pin. */}
        <div aria-hidden="true" className="hinge max-md:hidden">
          <span className="flex-1" />
          <span className="flex-2" />
          <span className="flex-1" />
        </div>

        {/* Handheld: the same cover, as a lid over the single screen. */}
        <div className="device-lid" inert={open}>
          <DeviceCover boot={boot} onOpen={handleOpen} />
        </div>
      </div>
    </main>
  );
}

/** A display recessed into the shell: dark bezel, then the LCD panel. */
function Screen({ children, refreshes }: { children: ReactNode; refreshes: number }) {
  return (
    <div className="bezel min-h-0 flex-1 rounded-xl rounded-br-4xl p-2 md:p-3">
      <div className="lcd h-full overflow-hidden rounded-sm">
        {children}
        {/* Remounted per display change, which restarts its one-shot animation. */}
        {refreshes > 0 && <span key={refreshes} aria-hidden="true" className="lcd-refresh" />}
      </div>
    </div>
  );
}
