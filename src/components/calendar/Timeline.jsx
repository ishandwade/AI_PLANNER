import React, { useState, useEffect } from 'react';

import mockPlans from '../../data/mock_drone_plan.json';

export default function Timeline() {
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        setPlans(mockPlans);
    }, []);

    return (
        <div className="timeline-container">
            <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '1rem', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                Drone Build Plan
            </h2>

            {plans.map((week) => (
                <div key={week.week} className="timeline-week neon-border">
                    <h3>{week.title}</h3>
                    <div className="tasks-list">
                        {week.tasks.map(task => (
                            <div key={task.id} className="timeline-task">
                                <h4>
                                    {task.name}
                                    <span className={`status-badge status-${task.status}`}>
                                        {task.status.replace('-', ' ')}
                                    </span>
                                </h4>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                    {task.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
