import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Calendar, Zap } from 'lucide-react';

const API_BASE = 'http://localhost:8002';

export default function VoiceAssistant({ onActivity }) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [task, setTask] = useState(null);           // Single task from backend
    const [goal, setGoal] = useState('');             // Original spoken goal
    const [scheduling, setScheduling] = useState({    // date/time/loading/result
        date: '', time: '', loading: false, result: null
    });
    const recognitionRef = useRef(null);
    const lastPulseRef = useRef(0);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("SpeechRecognition API not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event) => {
            const now = Date.now();
            if (now - lastPulseRef.current > 100) {
                onActivity(1.0);
                lastPulseRef.current = now;
            }

            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);

            if (event.results[event.results.length - 1].isFinal) {
                handleFinalTranscript(event.results[event.results.length - 1][0].transcript);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        return () => recognitionRef.current?.stop();
    }, [onActivity]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setResponse('');
            setTask(null);
            setGoal('');
            setScheduling({ date: '', time: '', loading: false, result: null });
            try {
                recognitionRef.current?.start();
            } catch (e) {
                console.error("Could not start recognition", e);
            }
        }
    };

    const handleFinalTranscript = async (text) => {
        if (!text.trim()) return;
        setResponse('Processing your goal...');
        setTask(null);

        try {
            const res = await fetch(`${API_BASE}/api/plan-task`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal: text }),
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const singleTask = await res.json();
            setTask(singleTask);
            setGoal(text);
            setResponse('');
            onActivity(0.8);

            // Default to today's date + current time
            const now = new Date();
            setScheduling({
                date: now.toISOString().split('T')[0],
                time: now.toTimeString().slice(0, 5),
                loading: false,
                result: null,
            });

        } catch (error) {
            console.error("Error communicating with backend:", error);
            setResponse("Could not connect to the backend. Ensure it is running on localhost:8002.");
        }
    };

    const handleSchedule = async () => {
        setScheduling(prev => ({ ...prev, loading: true, result: null }));

        try {
            const res = await fetch(`${API_BASE}/api/calendar/create-event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task,
                    goal,
                    scheduled_date: scheduling.date,
                    scheduled_time: scheduling.time,
                }),
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const result = await res.json();

            setScheduling(prev => ({ ...prev, loading: false, result }));
            onActivity(0.6);

        } catch (error) {
            console.error("Scheduling error:", error);
            setScheduling(prev => ({
                ...prev,
                loading: false,
                result: { status: 'error', message: 'Failed to schedule. Is the backend running?' }
            }));
        }
    };

    const energyColor = (level) => {
        const colors = ['', '#39ff14', '#a8ff3e', '#ffd700', '#ff8c00', '#ff3131'];
        return colors[level] || '#fff';
    };

    const isScheduled = scheduling.result?.status === 'confirmed';
    const isError = scheduling.result?.status === 'error';

    return (
        <>
            {/* Mic Toggle */}
            <div
                className={`voice-indicator ${isListening ? 'listening' : 'neon-border'}`}
                onClick={toggleListening}
                title={isListening ? "Stop Listening" : "Start Listening"}
            >
                {isListening ? (
                    <Mic className="mic-icon active" size={20} />
                ) : (
                    <MicOff className="mic-icon" size={20} color="rgba(255, 255, 255, 0.5)" />
                )}
                <span style={{ fontSize: '0.8rem', color: isListening ? 'var(--neon-pink)' : 'rgba(255,255,255,0.5)' }}>
                    {isListening ? 'Listening...' : 'Mic Off'}
                </span>
            </div>

            {/* Interim transcript */}
            {transcript && !task && (
                <div className="ollama-response neon-border" style={{ borderColor: 'var(--neon-pink)' }}>
                    <p>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>"{transcript}"</span>
                    </p>
                </div>
            )}

            {/* Loading state */}
            {response && (
                <div className="ollama-response neon-border" style={{ borderColor: 'var(--neon-pink)' }}>
                    <p><span style={{ color: 'var(--neon-cyan)' }}>{response}</span></p>
                </div>
            )}

            {/* Single Task Card */}
            {task && (
                <div className="ollama-response neon-border" style={{ borderColor: 'var(--neon-cyan)', padding: '1rem' }}>
                    <div style={{
                        padding: '0.6rem 0.8rem',
                        borderLeft: `3px solid ${energyColor(task.energy_required)}`,
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: '4px',
                    }}>
                        {/* Title + energy */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>
                                {task.title}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: energyColor(task.energy_required) }}>
                                <Zap size={12} />
                                {task.energy_required}/5
                            </span>
                        </div>

                        {/* Duration */}
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', margin: '0.25rem 0 0.5rem' }}>
                            {task.duration_minutes} min + 20% buffer = {task.buffer_time} min
                        </p>

                        {/* Date + Time pickers */}
                        {!isScheduled && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input
                                    type="date"
                                    value={scheduling.date}
                                    onChange={(e) => setScheduling(prev => ({ ...prev, date: e.target.value, result: null }))}
                                    style={inputStyle}
                                />
                                <input
                                    type="time"
                                    value={scheduling.time}
                                    onChange={(e) => setScheduling(prev => ({ ...prev, time: e.target.value, result: null }))}
                                    style={inputStyle}
                                />
                                <button
                                    onClick={handleSchedule}
                                    disabled={scheduling.loading}
                                    style={buttonStyle(scheduling.loading)}
                                >
                                    <Calendar size={12} />
                                    {scheduling.loading ? 'Scheduling...' : 'Schedule'}
                                </button>
                            </div>
                        )}

                        {/* Success */}
                        {isScheduled && (
                            <p style={{ color: '#39ff14', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                                ✅ Scheduled!{' '}
                                <a href={scheduling.result.htmlLink} target="_blank" rel="noreferrer"
                                    style={{ color: 'var(--neon-cyan)' }}>
                                    Open in Calendar
                                </a>
                            </p>
                        )}

                        {/* Error */}
                        {isError && (
                            <p style={{ color: '#ff3131', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                                ❌ {scheduling.result.message}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

const inputStyle = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '4px',
    color: '#fff',
    padding: '3px 6px',
    fontSize: '0.75rem',
    colorScheme: 'dark',
};

const buttonStyle = (loading) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: loading ? 'rgba(255,255,255,0.1)' : 'rgba(0, 255, 255, 0.15)',
    border: '1px solid var(--neon-cyan)',
    borderRadius: '4px',
    color: 'var(--neon-cyan)',
    padding: '3px 10px',
    fontSize: '0.75rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
});