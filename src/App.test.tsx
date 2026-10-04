import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import {
  fireTypeResponse,
  indexResponse,
  pokemonResponse,
  speciesResponse,
} from './test/fixtures';

type Handler = (path: string) => unknown;

/** Default API: everything succeeds. Individual tests override per path. */
const defaultHandler: Handler = (path) => {
  if (path.startsWith('pokemon-species?')) return indexResponse;
  if (path.startsWith('pokemon-species/')) return speciesResponse(Number(path.split('/')[1]));
  if (path.startsWith('pokemon/')) return pokemonResponse(Number(path.split('/')[1]));
  if (path === 'type/fire') return fireTypeResponse;
  throw new Error(`Unhandled request: ${path}`);
};

let handler: Handler;
const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
  const path = String(input).replace('https://pokeapi.co/api/v2/', '');
  const body = handler(path);
  if (body instanceof Response) return body;
  return new Response(JSON.stringify(body), { status: 200 });
});

const requestsTo = (prefix: string) =>
  fetchMock.mock.calls.filter(([input]) => String(input).includes(prefix)).length;

class FakeAudio {
  static instances: FakeAudio[] = [];
  src = '';
  preload = '';
  volume = 1;
  currentTime = 0;
  onplaying: (() => void) | null = null;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  play = vi.fn(async () => {
    this.onplaying?.();
  });
  pause = vi.fn();
  constructor() {
    FakeAudio.instances.push(this);
  }
}

/**
 * Web Audio stand-in. The app keeps a single audio context for the life of
 * the page, so the stub is shared too: `notesPlayed` counts oscillator starts.
 */
const notesPlayed = vi.fn();
class FakeAudioContext {
  state = 'running';
  currentTime = 0;
  destination = {};
  createOscillator = () => ({
    frequency: {},
    connect: (node: unknown) => node,
    start: () => notesPlayed(),
    stop: () => {},
  });
  createGain = () => ({ gain: { setValueAtTime: () => {} }, connect: (node: unknown) => node });
}

/** Renders the app as a returning visitor: device already open. */
function renderOpen() {
  window.localStorage.setItem('pokedex:intro-seen', '1');
  return render(<App />);
}

const list = () => screen.findByRole('list', { name: 'Pokémon' });
const entry = () => screen.getByRole('region', { name: 'Pokémon entry' });

beforeEach(() => {
  handler = defaultHandler;
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('Audio', FakeAudio);
  vi.stubGlobal('AudioContext', FakeAudioContext);
  notesPlayed.mockClear();
});

describe('index', () => {
  it('shows a loading state, then the Pokémon from the API', async () => {
    renderOpen();
    expect(screen.getByText('Scanning Pokédex database…')).toBeInTheDocument();

    const rows = within(await list()).getAllByRole('button');
    expect(rows).toHaveLength(5);
    expect(rows[0]).toHaveTextContent('001');
    expect(rows[0]).toHaveTextContent('Bulbasaur');
    expect(screen.getByText('5 entries')).toBeInTheDocument();
  });

  it('asks the API for the original 151 only', async () => {
    renderOpen();
    await list();
    expect(requestsTo('/pokemon-species?limit=151')).toBe(1);
    expect(screen.getByRole('region', { name: 'Pokémon entry' })).toHaveTextContent(/Kanto/);
  });

  it('shows an error with a working retry when the API fails', async () => {
    handler = () => new Response('', { status: 503 });
    renderOpen();

    // A 5xx is retried once (after ~1s) before the error is shown.
    const alert = await screen.findByRole('alert', {}, { timeout: 4000 });
    expect(alert).toHaveTextContent('Pokédex connection error');

    handler = defaultHandler;
    await userEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
    expect(within(await list()).getAllByRole('button')).toHaveLength(5);
  });
});

describe('search', () => {
  it('filters by name, case-insensitively, and can be cleared', async () => {
    renderOpen();
    await list();
    const search = screen.getByRole('textbox', { name: /search pokémon/i });

    await userEvent.type(search, 'SAUR');
    await waitFor(() => expect(screen.getByText('3 matches')).toBeInTheDocument());
    expect(screen.queryByText('Charmander')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(search).toHaveValue('');
    await waitFor(() => expect(screen.getByText('5 entries')).toBeInTheDocument());
  });

  it('finds Pokémon by number and by a name typed with spaces', async () => {
    renderOpen();
    await list();
    const search = screen.getByRole('textbox', { name: /search pokémon/i });

    await userEvent.type(search, '#004');
    await waitFor(() => expect(screen.getByText('1 match')).toBeInTheDocument());
    expect(screen.getByText('Charmander')).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'mr mime');
    await waitFor(() => expect(screen.getByText('Mr. Mime')).toBeInTheDocument());
    expect(screen.getByText('1 match')).toBeInTheDocument();
  });

  it('shows an empty state when nothing matches', async () => {
    renderOpen();
    await list();
    await userEvent.type(screen.getByRole('textbox', { name: /search pokémon/i }), 'zzz');
    expect(await screen.findByText('No Pokémon found')).toBeInTheDocument();
  });

  it('opens the first result on Enter', async () => {
    renderOpen();
    await list();
    await userEvent.type(screen.getByRole('textbox', { name: /search pokémon/i }), 'char{Enter}');
    expect(await screen.findByRole('heading', { name: 'Species 4' })).toBeInTheDocument();
  });

  it('filters by type using the type endpoint, only once asked', async () => {
    renderOpen();
    await list();
    expect(requestsTo('/type/')).toBe(0);

    await userEvent.click(screen.getByRole('button', { name: 'Fire' }));
    // The endpoint also lists #155 and a mega form; neither is in this dex.
    await waitFor(() => expect(screen.getByText('1 match')).toBeInTheDocument());
    expect(screen.getByText('Charmander')).toBeInTheDocument();
  });
});

describe('entry', () => {
  it('shows a Pokémon when it is selected from the list', async () => {
    renderOpen();
    await userEvent.click(within(await list()).getByRole('button', { name: /Bulbasaur/ }));

    expect(await screen.findByRole('heading', { name: 'Bulbasaur' })).toBeInTheDocument();
    const view = within(entry());
    // Types in slot order, each with a text label.
    const types = within(view.getByRole('list', { name: 'Types' })).getAllByRole('listitem');
    expect(types.map((type) => type.textContent)).toEqual(['Grass', 'Poison']);
    // Units converted from the API's decimetres / hectograms.
    expect(view.getByText('0.7 m')).toBeInTheDocument();
    expect(view.getByText('6.9 kg')).toBeInTheDocument();
    // The Red-version description, with game line breaks removed.
    expect(
      await view.findByText('A strange seed was planted on its back at birth.'),
    ).toBeInTheDocument();
    expect(view.getByText('Seed')).toBeInTheDocument();
    expect(view.getByText('No.')).toBeInTheDocument();
    expect(window.location.hash).toBe('#/pokemon/1');
  });

  it('shows Generation I typing and stats where they have since changed', async () => {
    window.location.hash = '#/pokemon/2';
    renderOpen();
    await screen.findByRole('heading', { name: 'Species 2' });
    const view = within(entry());

    // The oldest recorded typing wins over both today's and Gen V's.
    const types = within(view.getByRole('list', { name: 'Types' })).getAllByRole('listitem');
    expect(types.map((type) => type.textContent)).toEqual(['Psychic']);

    // One Special stat instead of Sp. Atk / Sp. Def; Attack as it was then.
    const stats = view.getAllByRole('term').map((term) => term.textContent);
    expect(stats).toEqual(expect.arrayContaining(['HP', 'Attack', 'Special']));
    expect(view.getByText('Special').nextElementSibling).toHaveTextContent('077');
    expect(view.getByText('Attack').nextElementSibling).toHaveTextContent('040');
  });

  it('steps to the next and previous Pokémon with buttons and arrow keys', async () => {
    window.location.hash = '#/pokemon/2';
    renderOpen();
    expect(await screen.findByRole('heading', { name: 'Species 2' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Next: Venusaur' }));
    expect(await screen.findByRole('heading', { name: 'Species 3' })).toBeInTheDocument();

    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(await screen.findByRole('heading', { name: 'Bulbasaur' })).toBeInTheDocument();
  });

  it('wraps between #001 and #151 instead of leaving the dex', async () => {
    window.location.hash = '#/pokemon/1';
    renderOpen();
    await screen.findByRole('heading', { name: 'Bulbasaur' });

    await userEvent.keyboard('{ArrowLeft}');
    expect(await screen.findByRole('heading', { name: 'Species 151' })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/pokemon/151');

    await userEvent.click(screen.getByRole('button', { name: /^Next/ }));
    expect(await screen.findByRole('heading', { name: 'Bulbasaur' })).toBeInTheDocument();
  });

  it('serves a revisited Pokémon from the cache without refetching', async () => {
    renderOpen();
    const rows = within(await list());

    await userEvent.click(rows.getByRole('button', { name: /Bulbasaur/ }));
    await screen.findByRole('heading', { name: 'Bulbasaur' });
    await userEvent.click(rows.getByRole('button', { name: /Ivysaur/ }));
    await screen.findByRole('heading', { name: 'Species 2' });
    await userEvent.click(rows.getByRole('button', { name: /Bulbasaur/ }));
    await screen.findByRole('heading', { name: 'Bulbasaur' });

    expect(requestsTo('/pokemon/1')).toBe(1);
    expect(requestsTo('/pokemon-species/1')).toBe(1);
    expect(requestsTo('/pokemon-species?')).toBe(1);
  });

  it('treats #152 and beyond as not found without asking the API', async () => {
    window.location.hash = '#/pokemon/152';
    renderOpen();

    const alert = await within(entry()).findByRole('alert');
    expect(alert).toHaveTextContent('No data found');
    expect(alert).toHaveTextContent('001–151');
    expect(within(alert).queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Adjacent Pokémon' })).not.toBeInTheDocument();
    expect(requestsTo('/pokemon/152')).toBe(0);
    expect(requestsTo('/pokemon-species/152')).toBe(0);
  });
});

describe('favourites', () => {
  it('stores a favourite and filters the list to it', async () => {
    renderOpen();
    await userEvent.click(within(await list()).getByRole('button', { name: /Ivysaur/ }));
    await screen.findByRole('heading', { name: 'Species 2' });

    await userEvent.click(screen.getByRole('button', { name: 'Add Species 2 to favourites' }));
    expect(JSON.parse(window.localStorage.getItem('pokedex:favorites') ?? '')).toEqual([2]);
    expect(
      screen.getByRole('button', { name: 'Remove Species 2 from favourites' }),
    ).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Registered' }));
    await waitFor(() => expect(screen.getByText('1 match')).toBeInTheDocument());
    expect(within(await list()).getByRole('button')).toHaveTextContent('Ivysaur');
  });

  it('explains an empty favourites list', async () => {
    renderOpen();
    await list();
    await userEvent.click(screen.getByRole('button', { name: 'Registered' }));
    expect(await screen.findByText('None registered')).toBeInTheDocument();
  });
});

describe('cry', () => {
  it('creates no audio until asked, then plays and can be stopped', async () => {
    FakeAudio.instances = [];
    window.location.hash = '#/pokemon/1';
    renderOpen();

    const play = await screen.findByRole('button', { name: "Play Bulbasaur's cry" });
    expect(FakeAudio.instances).toHaveLength(0);

    await userEvent.click(play);
    const [audio] = FakeAudio.instances;
    expect(audio?.src).toBe('https://audio.test/1.ogg');
    expect(audio?.play).toHaveBeenCalledOnce();

    const stop = await screen.findByRole('button', { name: "Stop Bulbasaur's cry" });
    await userEvent.click(stop);
    expect(audio?.pause).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: "Play Bulbasaur's cry" })).toBeInTheDocument();
  });

  it('shows no player for a Pokémon without a cry', async () => {
    handler = (path) => (path === 'pokemon/1' ? pokemonResponse(1, false) : defaultHandler(path));
    window.location.hash = '#/pokemon/1';
    renderOpen();

    await screen.findByRole('heading', { name: 'Bulbasaur' });
    expect(screen.queryByRole('button', { name: /cry/i })).not.toBeInTheDocument();
  });
});

describe('device', () => {
  it('starts closed on a first visit and opens from the cover', async () => {
    render(<App />);
    const index = screen.getByRole('region', { name: 'Pokémon index' });
    expect(index).toHaveAttribute('inert');

    const [cover] = screen.getAllByRole('button', { name: 'Open Pokédex' });
    await userEvent.click(cover!);

    expect(index).not.toHaveAttribute('inert');
    expect(window.localStorage.getItem('pokedex:intro-seen')).toBe('1');
  });

  it('starts open for a returning visitor and can be closed again', async () => {
    renderOpen();
    const index = screen.getByRole('region', { name: 'Pokémon index' });
    expect(index).not.toHaveAttribute('inert');

    await userEvent.click(screen.getByRole('button', { name: 'Close Pokédex' }));
    expect(index).toHaveAttribute('inert');
  });

  it('keeps sound effects off until switched on, and remembers the choice', async () => {
    renderOpen();
    const toggle = screen.getByRole('button', { name: 'Sound effects' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    // Muted: interacting makes no sound.
    await userEvent.click(within(await list()).getByRole('button', { name: /Bulbasaur/ }));
    expect(notesPlayed).not.toHaveBeenCalled();

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(window.localStorage.getItem('pokedex:sfx')).toBe('on');
    // Switching on confirms itself with a single beep.
    expect(notesPlayed).toHaveBeenCalledOnce();
  });
});

describe('display mode', () => {
  const device = () => document.querySelector('.device');
  const key = (name: string) => screen.getByRole('button', { name });
  const sprite = async () =>
    (await within(entry()).findByRole('img', { name: /Red and Blue/ })).getAttribute('src');

  it('defaults to Classic with the monochrome Red/Blue sprites', async () => {
    window.location.hash = '#/pokemon/1';
    renderOpen();

    expect(device()).toHaveAttribute('data-display', 'classic');
    expect(key('Classic LCD display')).toHaveAttribute('aria-pressed', 'true');
    expect(key('Monochrome display')).toHaveAttribute('aria-pressed', 'false');
    expect(key('Color display')).toHaveAttribute('aria-pressed', 'false');
    expect(await sprite()).toMatch(/red-blue\/transparent\/gray\/1\.png$/);
    // Nothing is stored until the visitor actually chooses.
    expect(window.localStorage.getItem('pokedex-display-mode')).toBeNull();
  });

  it('switches to Monochrome: a grey panel, same sprites', async () => {
    window.location.hash = '#/pokemon/1';
    renderOpen();
    await userEvent.click(key('Monochrome display'));

    expect(device()).toHaveAttribute('data-display', 'mono');
    expect(key('Monochrome display')).toHaveAttribute('aria-pressed', 'true');
    expect(key('Classic LCD display')).toHaveAttribute('aria-pressed', 'false');
    expect(window.localStorage.getItem('pokedex-display-mode')).toBe('mono');
    expect(await sprite()).toMatch(/transparent\/gray\/1\.png$/);
  });

  it('switches to Color: Gen 1 colour sprites in the entry and the list', async () => {
    window.location.hash = '#/pokemon/1';
    renderOpen();
    const rows = await list();
    const listSprites = () =>
      [...rows.querySelectorAll('img')].map((image) => image.getAttribute('src'));
    // Until Color is chosen, no colour sprite is referenced anywhere.
    expect(listSprites().every((src) => src?.includes('/transparent/gray/'))).toBe(true);

    await userEvent.click(key('Color display'));

    expect(device()).toHaveAttribute('data-display', 'color');
    expect(window.localStorage.getItem('pokedex-display-mode')).toBe('color');
    expect(await sprite()).toMatch(/generation-i\/red-blue\/1\.png$/);
    expect(listSprites().every((src) => /red-blue\/\d+\.png$/.test(src ?? ''))).toBe(true);
  });

  it('restores the saved mode on the next visit', async () => {
    window.localStorage.setItem('pokedex-display-mode', 'color');
    window.location.hash = '#/pokemon/1';
    renderOpen();

    expect(device()).toHaveAttribute('data-display', 'color');
    expect(key('Color display')).toHaveAttribute('aria-pressed', 'true');
    expect(await sprite()).toMatch(/red-blue\/1\.png$/);
  });

  it('falls back to Classic when the stored value is not a mode', () => {
    window.localStorage.setItem('pokedex-display-mode', 'hologram');
    renderOpen();

    expect(device()).toHaveAttribute('data-display', 'classic');
    expect(key('Classic LCD display')).toHaveAttribute('aria-pressed', 'true');
  });

  it('plays the LCD refresh only when the mode actually changes', async () => {
    renderOpen();
    const refreshing = () => document.querySelectorAll('.lcd-refresh').length;
    expect(refreshing()).toBe(0);

    await userEvent.click(key('Classic LCD display'));
    expect(refreshing()).toBe(0);

    await userEvent.click(key('Monochrome display'));
    // One per screen.
    expect(refreshing()).toBe(2);
  });

  it('is silent with sound effects off, and beeps with them on', async () => {
    renderOpen();

    await userEvent.click(key('Monochrome display'));
    expect(notesPlayed).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Sound effects' }));
    notesPlayed.mockClear();
    await userEvent.click(key('Color display'));
    expect(notesPlayed).toHaveBeenCalledTimes(2);

    // Pressing the mode that is already active does nothing.
    notesPlayed.mockClear();
    await userEvent.click(key('Color display'));
    expect(notesPlayed).not.toHaveBeenCalled();
  });
});
