import React from 'react';
import Navigation from './Navigation';
import VoiceAssistant from '../voice/VoiceAssistant';

export default function AppShell({ activeTab, onTabChange, children, onVoiceActivity, orbColor }) {
    return (
        <div className="app-shell">
            <div className="main-content neon-border" style={{
                boxShadow: `
          0 0 5px rgba(${orbColor === 'cyan' ? '0, 255, 255' : orbColor === 'purple' ? '176, 0, 255' : '255, 0, 255'}, 0.2),
          0 0 10px rgba(${orbColor === 'cyan' ? '0, 255, 255' : orbColor === 'purple' ? '176, 0, 255' : '255, 0, 255'}, 0.2),
          inset 0 0 5px rgba(${orbColor === 'cyan' ? '0, 255, 255' : orbColor === 'purple' ? '176, 0, 255' : '255, 0, 255'}, 0.1)
        `,
                borderColor: `rgba(${orbColor === 'cyan' ? '0, 255, 255' : orbColor === 'purple' ? '176, 0, 255' : '255, 0, 255'}, 0.2)`
            }}>
                {/* Voice Assistant Overlay */}
                <VoiceAssistant onActivity={onVoiceActivity} />

                {/* Main Content Area (Orb or Calendar) */}
                {children}
            </div>

            {/* Tab Navigation Menu */}
            <Navigation activeTab={activeTab} onTabChange={onTabChange} />
        </div>
    );
}
