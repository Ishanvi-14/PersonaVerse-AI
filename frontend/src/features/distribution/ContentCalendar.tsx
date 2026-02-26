/**
 * Content Calendar Component
 * Month view calendar for scheduling and tracking content
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';

export type ContentStatus = 'planned' | 'published' | 'draft';

export interface ScheduledContent {
  id: string;
  title: string;
  content: string;
  scheduledDate: Date;
  status: ContentStatus;
  platform?: string;
}

interface ContentCalendarProps {
  contents?: ScheduledContent[];
  onSchedule?: (contentId: string, date: Date) => void;
  onStatusChange?: (contentId: string, status: ContentStatus) => void;
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  contents = [],
  onSchedule,
  onStatusChange,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const statusColors: Record<ContentStatus, string> = {
    planned: 'bg-blue-500',
    published: 'bg-green-500',
    draft: 'bg-gray-400',
  };

  const statusLabels: Record<ContentStatus, string> = {
    planned: 'Planned',
    published: 'Published',
    draft: 'Draft',
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Get contents for a specific date
  const getContentsForDate = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toDateString();

    return contents.filter(content => 
      new Date(content.scheduledDate).toDateString() === dateStr
    );
  };

  // Generate calendar days
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary-500" />
          <h2 className="text-2xl font-bold text-theme-text-primary">
            Content Calendar
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-theme-hover rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-theme-text-primary" />
          </button>
          <div className="px-4 py-2 bg-theme-surface border border-theme-border rounded-lg">
            <span className="font-semibold text-theme-text-primary">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
          </div>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-theme-hover rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-theme-text-primary" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 p-4 bg-theme-surface border border-theme-border rounded-lg">
        {Object.entries(statusLabels).map(([status, label]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusColors[status as ContentStatus]}`} />
            <span className="text-sm text-theme-text-secondary">{label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="card">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-theme-text-secondary py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dayContents = getContentsForDate(day);
            const isToday = 
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square p-2 rounded-lg border-2 transition-all
                  ${isToday 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-theme-border hover:border-theme-border/60 bg-theme-surface'
                  }
                  hover:shadow-md
                `}
              >
                <div className="text-sm font-semibold text-theme-text-primary mb-1">
                  {day}
                </div>
                <div className="space-y-1">
                  {dayContents.slice(0, 3).map(content => (
                    <div
                      key={content.id}
                      className={`w-full h-1 rounded-full ${statusColors[content.status]}`}
                      title={content.title}
                    />
                  ))}
                  {dayContents.length > 3 && (
                    <div className="text-xs text-theme-text-secondary">
                      +{dayContents.length - 3}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-theme-text-primary">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Schedule Content
            </button>
          </div>

          {getContentsForDate(selectedDate.getDate()).length > 0 ? (
            <div className="space-y-3">
              {getContentsForDate(selectedDate.getDate()).map(content => (
                <div
                  key={content.id}
                  className="p-4 bg-theme-bg-tertiary rounded-lg border border-theme-border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-theme-text-primary">
                        {content.title}
                      </h4>
                      {content.platform && (
                        <span className="text-xs text-theme-text-secondary">
                          {content.platform}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusColors[content.status]}`} />
                      <span className="text-sm text-theme-text-secondary">
                        {statusLabels[content.status]}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-theme-text-secondary line-clamp-2">
                    {content.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-theme-text-secondary">
              No content scheduled for this date
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📅</span>
          <div className="text-sm text-blue-800">
            <strong>Tip:</strong> Click on any date to view or schedule content. 
            Drag and drop functionality coming soon!
          </div>
        </div>
      </div>
    </div>
  );
};
