import React from 'react';
import { Calendar, Orbit } from 'lucide-react';

export default function Navigation({ activeTab, onTabChange }) {
  return (
    <nav className="navigation">
      <button
        className={`tab-btn ${activeTab === 'orb' ? 'active' : ''}`}
        onClick={() => onTabChange('orb')}
        title="Orb View"
      >
        <Orbit size={28} />
      </button>
      <button
        className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
        onClick={() => onTabChange('calendar')}
        title="Calendar View"
      >
        <Calendar size={28} />
      </button>
    </nav>
  );
}
