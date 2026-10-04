import { useCallback, useEffect, useState } from 'react';

export type CryStatus = 'idle' | 'loading' | 'playing' | 'error';

/**
 * One audio element for the whole app, created on the first play request.
 * Nothing is downloaded until the user asks: the element has no source
 * until then, and replays of the same cry come from the browser's cache.
 */
let sharedAudio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = 'none';
    // Cries are mastered loud; half volume is closer to the rest of the web.
    sharedAudio.volume = 0.5;
  }
  return sharedAudio;
}

function release(audio: HTMLAudioElement) {
  audio.onplaying = audio.onended = audio.onerror = null;
  audio.pause();
}

let oggSupport: boolean | null = null;

/** PokéAPI only publishes Ogg Vorbis; older Safari cannot decode it. */
export function canPlayCries(): boolean {
  oggSupport ??= document.createElement('audio').canPlayType('audio/ogg; codecs="vorbis"') !== '';
  return oggSupport;
}

/**
 * Playback for a single cry. Mount with `key={pokemon.id}` so the state
 * resets — and the previous cry stops — when the Pokémon changes.
 */
export function useCry(url: string | null) {
  const [status, setStatus] = useState<CryStatus>('idle');

  useEffect(
    () => () => {
      if (sharedAudio) release(sharedAudio);
    },
    [],
  );

  const toggle = useCallback(() => {
    if (!url) return;
    const audio = getAudio();

    if (status === 'loading' || status === 'playing') {
      release(audio);
      setStatus('idle');
      return;
    }

    audio.onplaying = () => setStatus('playing');
    audio.onended = () => setStatus('idle');
    audio.onerror = () => setStatus('error');
    if (audio.src !== url) audio.src = url;
    else audio.currentTime = 0;
    setStatus('loading');
    audio.play().catch((error: unknown) => {
      // AbortError just means we paused before playback began.
      if (!(error instanceof DOMException && error.name === 'AbortError')) setStatus('error');
    });
  }, [url, status]);

  return { status, toggle };
}
