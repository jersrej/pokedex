import { Volume2, VolumeOff } from 'lucide-react';
import { IconButton } from '../../../components/IconButton';
import { playSfx, setSfxEnabled, useSfxEnabled } from '../../../lib/sfx';

/** Interface blips on/off. Off until switched on; cries are unaffected. */
export function SoundToggle() {
  const enabled = useSfxEnabled();
  const Icon = enabled ? Volume2 : VolumeOff;

  return (
    <IconButton
      label="Sound effects"
      aria-pressed={enabled}
      onClick={() => {
        setSfxEnabled(!enabled);
        // Confirms the switch audibly — and only when it was just turned on.
        playSfx('confirm');
      }}
    >
      <Icon className="size-5" aria-hidden="true" />
    </IconButton>
  );
}
