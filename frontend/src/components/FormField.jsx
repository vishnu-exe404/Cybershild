import React, { useState } from 'react';
import { IconEye, IconEyeOff } from './icons.jsx';

export function IconInput({ icon: Icon, invalid, ...inputProps }) {
  return (
    <div className="input-wrap">
      <Icon className="input-icon" />
      <input className={invalid ? 'invalid' : ''} {...inputProps} />
    </div>
  );
}

export function PasswordInput({ icon: Icon, invalid, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-wrap">
      <Icon className="input-icon" />
      <input type={visible ? 'text' : 'password'} className={invalid ? 'invalid' : ''} {...inputProps} />
      <button
        type="button"
        className="toggle-pass"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <IconEyeOff /> : <IconEye />}
      </button>
    </div>
  );
}
