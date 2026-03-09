import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function EventModal({ initialDate, event, colors, onSave, onClose }) {
    const [title, setTitle] = useState(event?.title || '');
    const [date, setDate] = useState(event?.date || initialDate || '');
    const [startTime, setStartTime] = useState(event?.startTime || '09:00');
    const [endTime, setEndTime] = useState(event?.endTime || '10:00');
    const [description, setDescription] = useState(event?.description || '');
    const [color, setColor] = useState(event?.color || colors[0]);

    const titleRef = useRef(null);
    const backdropRef = useRef(null);

    // Focus title on mount
    useEffect(() => {
        setTimeout(() => titleRef.current?.focus(), 100);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !date) return;
        onSave({ title: title.trim(), date, startTime, endTime, description: description.trim(), color });
    };

    const handleBackdropClick = (e) => {
        if (e.target === backdropRef.current) onClose();
    };

    return (
        <div className="modal-backdrop" ref={backdropRef} onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{event ? 'Edit Event' : 'New Event'}</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="event-title">Title</label>
                        <input
                            ref={titleRef}
                            id="event-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Event name..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="event-date">Date</label>
                        <input
                            id="event-date"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="event-start">Start</label>
                            <input
                                id="event-start"
                                type="time"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="event-end">End</label>
                            <input
                                id="event-end"
                                type="time"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="event-desc">Description</label>
                        <textarea
                            id="event-desc"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Optional description..."
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label>Color</label>
                        <div className="color-picker">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`color-swatch ${color === c ? 'selected' : ''}`}
                                    style={{ '--swatch-color': c }}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="modal-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="modal-save">
                            {event ? 'Update' : 'Create'} Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
