import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Trash2, Edit3, X } from 'lucide-react';
import EventModal from './EventModal';
import './CalendarView.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const EVENT_COLORS = [
    '#00d4ff', // cyan
    '#ff6a00', // orange
    '#ff2d8a', // pink
    '#00e676', // green
    '#b366ff', // purple
    '#ffcc00', // yellow
];

// Generate a unique id
let _eventId = 100;
const nextId = () => `evt_${_eventId++}`;

// Seed some demo events so the calendar isn't empty
function getSeedEvents() {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();

    return [
        {
            id: nextId(),
            title: 'Team Standup',
            date: new Date(y, m, d).toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '09:30',
            color: EVENT_COLORS[0],
            description: 'Daily sync with the team',
        },
        {
            id: nextId(),
            title: 'AI Agent Review',
            date: new Date(y, m, d + 1).toISOString().split('T')[0],
            startTime: '14:00',
            endTime: '15:00',
            color: EVENT_COLORS[3],
            description: 'Review voice assistant progress',
        },
        {
            id: nextId(),
            title: 'Calendar Integration',
            date: new Date(y, m, d + 2).toISOString().split('T')[0],
            startTime: '10:00',
            endTime: '12:00',
            color: EVENT_COLORS[1],
            description: 'Integrate Google Calendar API',
        },
        {
            id: nextId(),
            title: 'Design Review',
            date: new Date(y, m, d + 5).toISOString().split('T')[0],
            startTime: '16:00',
            endTime: '17:00',
            color: EVENT_COLORS[2],
            description: 'Review orb UI design iterations',
        },
    ];
}

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
    const [events, setEvents] = useState(getSeedEvents);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [expandedDay, setExpandedDay] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Navigate months/weeks
    const navigate = useCallback((dir) => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            if (viewMode === 'month') {
                d.setMonth(d.getMonth() + dir);
            } else {
                d.setDate(d.getDate() + dir * 7);
            }
            return d;
        });
    }, [viewMode]);

    const goToToday = useCallback(() => setCurrentDate(new Date()), []);

    // Build calendar grid
    const calendarDays = useMemo(() => {
        if (viewMode === 'month') {
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();

            const days = [];

            // Previous month padding
            for (let i = firstDay - 1; i >= 0; i--) {
                days.push({
                    date: new Date(year, month - 1, daysInPrevMonth - i),
                    isCurrentMonth: false,
                });
            }

            // Current month
            for (let i = 1; i <= daysInMonth; i++) {
                days.push({
                    date: new Date(year, month, i),
                    isCurrentMonth: true,
                });
            }

            // Next month padding (fill to 42 = 6 rows)
            const remaining = 42 - days.length;
            for (let i = 1; i <= remaining; i++) {
                days.push({
                    date: new Date(year, month + 1, i),
                    isCurrentMonth: false,
                });
            }

            return days;
        } else {
            // Week view: 7 days from start of the week containing currentDate
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const days = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(startOfWeek);
                d.setDate(d.getDate() + i);
                days.push({ date: d, isCurrentMonth: true });
            }
            return days;
        }
    }, [year, month, currentDate, viewMode]);

    // Get events for a specific date
    const getEventsForDate = useCallback((date) => {
        const dateStr = date.toISOString().split('T')[0];
        return events
            .filter(e => e.date === dateStr)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [events]);

    // Check if a date is today
    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Event handlers
    const handleAddEvent = (date) => {
        setSelectedDate(date.toISOString().split('T')[0]);
        setEditingEvent(null);
        setShowModal(true);
    };

    const handleEditEvent = (event, e) => {
        e.stopPropagation();
        setEditingEvent(event);
        setSelectedDate(event.date);
        setShowModal(true);
    };

    const handleDeleteEvent = (eventId, e) => {
        e.stopPropagation();
        setEvents(prev => prev.filter(ev => ev.id !== eventId));
    };

    const handleSaveEvent = (eventData) => {
        if (editingEvent) {
            // Update
            setEvents(prev => prev.map(e =>
                e.id === editingEvent.id ? { ...e, ...eventData } : e
            ));
        } else {
            // Create
            setEvents(prev => [...prev, { ...eventData, id: nextId() }]);
        }
        setShowModal(false);
        setEditingEvent(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingEvent(null);
    };

    // Expanded day sidebar (for day detail view)
    const handleDayClick = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        setExpandedDay(expandedDay === dateStr ? null : dateStr);
    };

    const headerLabel = viewMode === 'month'
        ? `${MONTHS[month]} ${year}`
        : (() => {
            const start = calendarDays[0]?.date;
            const end = calendarDays[6]?.date;
            if (!start || !end) return '';
            const fmt = (d) => `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
            return `${fmt(start)} — ${fmt(end)}, ${end.getFullYear()}`;
        })();

    return (
        <div className="calendar-container">
            {/* Header */}
            <div className="cal-header">
                <div className="cal-header-left">
                    <h2 className="cal-title">{headerLabel}</h2>
                    <button className="cal-today-btn" onClick={goToToday}>Today</button>
                </div>
                <div className="cal-header-right">
                    <div className="cal-view-toggle">
                        <button
                            className={`cal-view-btn ${viewMode === 'month' ? 'active' : ''}`}
                            onClick={() => setViewMode('month')}
                        >Month</button>
                        <button
                            className={`cal-view-btn ${viewMode === 'week' ? 'active' : ''}`}
                            onClick={() => setViewMode('week')}
                        >Week</button>
                    </div>
                    <div className="cal-nav-arrows">
                        <button className="cal-arrow" onClick={() => navigate(-1)}>
                            <ChevronLeft size={18} />
                        </button>
                        <button className="cal-arrow" onClick={() => navigate(1)}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    <button className="cal-add-btn" onClick={() => handleAddEvent(new Date())}>
                        <Plus size={16} />
                        <span>Add Event</span>
                    </button>
                </div>
            </div>

            {/* Day labels */}
            <div className={`cal-day-labels ${viewMode}`}>
                {DAYS.map(d => <div key={d} className="cal-day-label">{d}</div>)}
            </div>

            {/* Calendar grid */}
            <div className={`cal-grid ${viewMode}`}>
                {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                    const dayEvents = getEventsForDate(date);
                    const dateStr = date.toISOString().split('T')[0];
                    const isExpanded = expandedDay === dateStr;
                    const today = isToday(date);

                    return (
                        <div
                            key={idx}
                            className={`cal-cell ${!isCurrentMonth ? 'other-month' : ''} ${today ? 'today' : ''} ${isExpanded ? 'expanded' : ''} ${viewMode}`}
                            onClick={() => handleDayClick(date)}
                        >
                            <div className="cal-cell-header">
                                <span className={`cal-date-num ${today ? 'today-num' : ''}`}>
                                    {date.getDate()}
                                </span>
                                {isCurrentMonth && (
                                    <button
                                        className="cal-cell-add"
                                        onClick={(e) => { e.stopPropagation(); handleAddEvent(date); }}
                                        title="Add event"
                                    >
                                        <Plus size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="cal-cell-events">
                                {dayEvents.slice(0, viewMode === 'week' ? 10 : 3).map(ev => (
                                    <div
                                        key={ev.id}
                                        className="cal-event"
                                        style={{ '--event-color': ev.color }}
                                        onClick={(e) => handleEditEvent(ev, e)}
                                    >
                                        <span className="cal-event-dot" />
                                        <span className="cal-event-time">
                                            {ev.startTime}
                                        </span>
                                        <span className="cal-event-title">{ev.title}</span>
                                        <button
                                            className="cal-event-delete"
                                            onClick={(e) => handleDeleteEvent(ev.id, e)}
                                            title="Delete"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                {dayEvents.length > (viewMode === 'week' ? 10 : 3) && (
                                    <div className="cal-more">
                                        +{dayEvents.length - (viewMode === 'week' ? 10 : 3)} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Expanded day detail sidebar */}
            {expandedDay && (
                <div className="cal-day-detail">
                    <div className="cal-day-detail-header">
                        <h3>{new Date(expandedDay + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'long', month: 'long', day: 'numeric'
                        })}</h3>
                        <button className="cal-close-detail" onClick={() => setExpandedDay(null)}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="cal-day-detail-events">
                        {getEventsForDate(new Date(expandedDay + 'T00:00:00')).length === 0 ? (
                            <p className="cal-no-events">No events scheduled</p>
                        ) : (
                            getEventsForDate(new Date(expandedDay + 'T00:00:00')).map(ev => (
                                <div key={ev.id} className="cal-detail-event" style={{ '--event-color': ev.color }}>
                                    <div className="cal-detail-event-bar" />
                                    <div className="cal-detail-event-info">
                                        <h4>{ev.title}</h4>
                                        <div className="cal-detail-time">
                                            <Clock size={13} />
                                            <span>{ev.startTime} — {ev.endTime}</span>
                                        </div>
                                        {ev.description && (
                                            <p className="cal-detail-desc">{ev.description}</p>
                                        )}
                                    </div>
                                    <div className="cal-detail-actions">
                                        <button onClick={(e) => handleEditEvent(ev, e)} title="Edit">
                                            <Edit3 size={14} />
                                        </button>
                                        <button onClick={(e) => handleDeleteEvent(ev.id, e)} title="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                        <button
                            className="cal-detail-add-btn"
                            onClick={() => handleAddEvent(new Date(expandedDay + 'T00:00:00'))}
                        >
                            <Plus size={16} />
                            Add Event
                        </button>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <EventModal
                    initialDate={selectedDate}
                    event={editingEvent}
                    colors={EVENT_COLORS}
                    onSave={handleSaveEvent}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
