// FBLA Connect - Calendar Slice
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type EventType =
    | 'meeting'
    | 'competition'
    | 'conference'
    | 'deadline'
    | 'workshop'
    | 'social'
    | 'service'
    | 'other';

export type EventLevel = 'chapter' | 'district' | 'regional' | 'state' | 'national';

export interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    type: EventType;
    level: EventLevel;
    location?: string;
    virtualLink?: string;
    startDate: string;
    endDate: string;
    allDay: boolean;
    reminderEnabled: boolean;
    reminderTime?: string; // ISO string
    registrationDeadline?: string;
    registrationUrl?: string;
    isRSVPed: boolean;
    attendeeCount?: number;
    organizer: string;
    tags: string[];
    chapterId?: string;
    stateId?: string;
}

export interface Reminder {
    id: string;
    eventId: string;
    title: string;
    scheduledTime: string;
    isTriggered: boolean;
}

interface CalendarState {
    events: CalendarEvent[];
    reminders: Reminder[];
    selectedDate: string | null;
    filters: {
        types: EventType[];
        levels: EventLevel[];
        showRSVPedOnly: boolean;
    };
    isLoading: boolean;
    error: string | null;
}

const initialState: CalendarState = {
    events: [],
    reminders: [],
    selectedDate: null,
    filters: {
        types: [],
        levels: [],
        showRSVPedOnly: false,
    },
    isLoading: false,
    error: null,
};

const calendarSlice = createSlice({
    name: 'calendar',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setEvents: (state, action: PayloadAction<CalendarEvent[]>) => {
            state.events = action.payload;
            state.isLoading = false;
        },
        addEvent: (state, action: PayloadAction<CalendarEvent>) => {
            state.events.push(action.payload);
        },
        updateEvent: (state, action: PayloadAction<CalendarEvent>) => {
            const index = state.events.findIndex(e => e.id === action.payload.id);
            if (index !== -1) {
                state.events[index] = action.payload;
            }
        },
        toggleRSVP: (state, action: PayloadAction<string>) => {
            const event = state.events.find(e => e.id === action.payload);
            if (event) {
                event.isRSVPed = !event.isRSVPed;
            }
        },
        setSelectedDate: (state, action: PayloadAction<string | null>) => {
            state.selectedDate = action.payload;
        },
        setFilters: (state, action: PayloadAction<Partial<CalendarState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        addReminder: (state, action: PayloadAction<Reminder>) => {
            state.reminders.push(action.payload);
        },
        removeReminder: (state, action: PayloadAction<string>) => {
            state.reminders = state.reminders.filter(r => r.id !== action.payload);
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
    },
});

export const {
    setLoading,
    setEvents,
    addEvent,
    updateEvent,
    toggleRSVP,
    setSelectedDate,
    setFilters,
    addReminder,
    removeReminder,
    setError,
} = calendarSlice.actions;

export default calendarSlice.reducer;
