import React, { useState, useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import OrbViewer from './components/orb/OrbViewer';
import CalendarView from './components/calendar/CalendarView';

function App() {
  const [activeTab, setActiveTab] = useState('orb'); // 'orb' or 'calendar'
  const [voiceActivity, setVoiceActivity] = useState(0);
  const [orbColor, setOrbColor] = useState('orange');

  // Cycle orb color slowly over time
  useEffect(() => {
    const colors = ['orange', 'cyan', 'pink', 'green'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % colors.length;
      setOrbColor(colors[idx]);
    }, 5000); // Change color every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Slowly decay the voice activity back to 0 so it pulses
  // Actually, ParticleSphere handles the decay of the uniform, 
  // but we can also decay it at app level to be safe
  useEffect(() => {
    if (voiceActivity > 0) {
      const timer = setTimeout(() => {
        setVoiceActivity(Math.max(0, voiceActivity - 0.1));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [voiceActivity]);

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onVoiceActivity={setVoiceActivity}
      orbColor={orbColor}
    >
      {activeTab === 'orb' && (
        <OrbViewer voiceActivity={voiceActivity} color={orbColor} />
      )}
      {activeTab === 'calendar' && (
        <CalendarView />
      )}
    </AppShell>
  );
}

export default App;
