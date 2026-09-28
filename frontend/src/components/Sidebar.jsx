import React from 'react';
import { IconGrid, IconUsers, IconLogout } from './icons.jsx';

export default function Sidebar({ section, onSectionChange, onLogout, open, onClose }) {
  const items = [
    { key: 'overview', label: 'Overview', icon: IconGrid },
    { key: 'users', label: 'Users', icon: IconUsers },
  ];

  return (
    <>
      {open && <div className="sidebar-scrim" onClick={onClose} />}
      <aside className={open ? 'sidebar open' : 'sidebar'}>
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            className={section === key ? 'sidebar-link active' : 'sidebar-link'}
            onClick={() => {
              onSectionChange(key);
              onClose();
            }}
          >
            <Icon width={17} height={17} /> {label}
          </button>
        ))}
        <button type="button" className="sidebar-link danger" onClick={onLogout} style={{ marginTop: 'auto' }}>
          <IconLogout width={17} height={17} /> Log out
        </button>
      </aside>
    </>
  );
}
