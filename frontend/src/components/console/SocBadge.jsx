import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../services/userAuth.jsx';
import { useToast } from '../../services/toast.jsx';
import { isSoundEnabled, setSoundEnabled, playClickSound } from '../../utils/sound.js';
import { IconUser, IconClose } from '../icons.jsx';

export default function SocBadge() {
  const { user, logout } = useUserAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  function toggleSound() {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playClickSound();
  }

  async function endSession() {
    await logout();
    showToast('Session ended.', 'info');
    navigate('/login');
  }

  return (
    <div className="soc-badge-row">
      <button type="button" className="theme-toggle" onClick={toggleSound} aria-label={soundOn ? 'Mute sound effects' : 'Unmute sound effects'} title={soundOn ? 'Sound on' : 'Sound off'}>
        {soundOn ? '🔊' : '🔇'}
      </button>
      <div className="soc-badge">
        <IconUser width={16} height={16} />
        <div className="soc-badge-text">
          <span>SOC Analyst</span>
          <strong>{user.name}</strong>
        </div>
        <button type="button" className="soc-badge-end" onClick={endSession} aria-label="End session">
          <IconClose width={14} height={14} />
        </button>
      </div>
    </div>
  );
}
