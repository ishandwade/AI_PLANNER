import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceAssistant({ onActivity }) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const recognitionRef = useRef(null);

    // Throttle the pulse events to avoid overwhelming the shader
    const lastPulseRef = useRef(0);

    useEffect(() => {
        // Check if the browser supports SpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("SpeechRecognition API not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            // Auto-restart if we want continuous listening, but here we'll let user toggle
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            // Trigger visual pulse when sound is detected
            const now = Date.now();
            if (now - lastPulseRef.current > 100) { // Max 10 pulses per second
                onActivity(1.0); // Signal maximum activity
                lastPulseRef.current = now;
            }

            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }

            setTranscript(currentTranscript);

            // If the result is final, send to Ollama
            if (event.results[event.results.length - 1].isFinal) {
                handleFinalTranscript(event.results[event.results.length - 1][0].transcript);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onActivity]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setResponse(''); // Clear previous response
            try {
                recognitionRef.current?.start();
            } catch (e) {
                console.error("Could not start recognition", e);
            }
        }
    };

    const handleFinalTranscript = async (text) => {
        if (!text.trim()) return;

        setResponse('Thinking...');

        try {
            // Connect to local Ollama instance
            const res = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama3', // Or another model you have installed
                    prompt: `You are an AI assistant for a drone builder. Keep your answer brief and helpful. The user says: "${text}"`,
                    stream: false
                }),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            setResponse(data.response);

            // Pulse to show we're "speaking" back
            onActivity(0.8);

        } catch (error) {
            console.error("Error communicating with Ollama:", error);
            setResponse("Could not connect to Ollama. Ensure it is running on localhost:11434.");
        }
    };

    return (
        <>
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

            {/* Show transcript/response only if they exist and we're active or just finished */}
            {(transcript || response) && (
                <div className="ollama-response neon-border" style={{ borderColor: 'var(--neon-pink)' }}>
                    <p>
                        {response ? (
                            <span style={{ color: 'var(--neon-cyan)' }}>{response}</span>
                        ) : (
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>"{transcript}"</span>
                        )}
                    </p>
                </div>
            )}
        </>
    );
}
