/**
 * Enhanced Content Calendar
 * Full-featured calendar with scheduling, editing, and status management
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type ContentStatus = 'scheduled' | 'posted' | 'draft';
type Platform = 'linkedin' | 'instagram' | 'twitter' | 'facebook' | 'youtube';

interface ScheduledContent {
  scheduleId: string;
  userId: string;
  title: string;
  description: string;
  content: string;
  platform: Platform;
  scheduledDate: string;
  scheduledTime: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  postedAt?: string;
}

export const EnhancedContentCalendar: React.FC = () => {
  const { token, user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [schedules, setSchedules] = useState<ScheduledContent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    platform: 'linkedin' as Platform,
    scheduledDate: '',
    scheduledTime: '09:00',
    notificationEmail: '',
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const platformColors: Record<Platform, string> = {
    linkedin: 'bg-blue-500',
    instagram: 'bg-pink-500',
    twitter: 'bg-sky-500',
    facebook: 'bg-indigo-500',
    youtube: 'bg-red-500',
  };

  const statusColors: Record<ContentStatus, string> = {
    scheduled: 'bg-orange-500',
    posted: 'bg-green-500',
    draft: 'bg-gray-400',
  };

  const statusLabels: Record<ContentStatus, string> = {
    scheduled: 'Scheduled',
    posted: 'Posted',
    draft: 'Draft',
  };

  // Load schedules
  useEffect(() => {
    if (token && user) {
      loadSchedules();
    }
  }, [token, user]);

  const loadSchedules = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/calendar/schedules', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSchedules(data.schedules);
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingSchedule
        ? `http://localhost:3001/api/calendar/schedules/${editingSchedule.scheduleId}`
        : 'http://localhost:3001/api/calendar/schedule';

      const method = editingSchedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await loadSchedules();
        closeModal();
      } else {
        alert(data.error || 'Failed to save schedule');
      }
    } catch (error) {
      console.error('Failed to save schedule:', error);
      alert('Failed to save schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/calendar/schedules/${scheduleId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        await loadSchedules();
      } else {
        alert(data.error || 'Failed to delete schedule');
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      alert('Failed to delete schedule');
    }
  };

  const openModal = (date?: Date, schedule?: ScheduledContent) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        title: schedule.title,
        description: schedule.description,
        content: schedule.content,
        platform: schedule.platform,
        scheduledDate: schedule.scheduledDate,
        scheduledTime: schedule.scheduledTime,
        notificationEmail: user?.email || '',
      });
    } else {
      setEditingSchedule(null);
      const dateStr = date
        ? date.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      setFormData({
        title: '',
        description: '',
        content: '',
        platform: 'linkedin',
        scheduledDate: dateStr,
        scheduledTime: '09:00',
        notificationEmail: user?.email || '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      platform: 'linkedin',
      scheduledDate: '',
      scheduledTime: '09:00',
      notificationEmail: '',
    });
  };

  // Calendar navigation
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Get schedules for a specific date
  const getSchedulesForDate = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toISOString().split('T')[0];

    return schedules.filter(schedule => schedule.scheduledDate === dateStr);
  };

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-green-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Content Calendar</h2>
            <p className="text-sm text-gray-600">Schedule and manage your content</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Schedule Content
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <>
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="text-lg font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            {Object.entries(statusLabels).map(([status, label]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusColors[status as ContentStatus]}`} />
                <span className="text-sm text-gray-600">{label}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-700 py-2">
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

                const daySchedules = getSchedulesForDate(day);
                const isToday =
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <button
                    key={day}
                    onClick={() => {
                      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                      setSelectedDate(date);
                      openModal(date);
                    }}
                    className={`
                      aspect-square p-2 rounded-lg border-2 transition-all hover:shadow-md
                      ${isToday
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <div className="text-sm font-semibold text-gray-900 mb-1">{day}</div>
                    <div className="space-y-1">
                      {daySchedules.slice(0, 2).map(schedule => (
                        <div
                          key={schedule.scheduleId}
                          className={`w-full h-1.5 rounded-full ${platformColors[schedule.platform]}`}
                          title={schedule.title}
                        />
                      ))}
                      {daySchedules.length > 2 && (
                        <div className="text-xs text-gray-600 font-medium">
                          +{daySchedules.length - 2}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
          {schedules.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No scheduled content yet</p>
              <button
                onClick={() => openModal()}
                className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
              >
                Create your first schedule
              </button>
            </div>
          ) : (
            schedules.map(schedule => (
              <div key={schedule.scheduleId} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{schedule.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${platformColors[schedule.platform]}`}>
                        {schedule.platform}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusColors[schedule.status]}`}>
                        {statusLabels[schedule.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{schedule.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(schedule.scheduledDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {schedule.scheduledTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(undefined, schedule)}
                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.scheduleId)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Schedule Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingSchedule ? 'Edit Schedule' : 'Schedule Content'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Content title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Brief description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Your content here..."
                    rows={6}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value as Platform })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="linkedin">LinkedIn</option>
                      <option value="instagram">Instagram</option>
                      <option value="twitter">Twitter</option>
                      <option value="facebook">Facebook</option>
                      <option value="youtube">YouTube</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Email
                  </label>
                  <input
                    type="email"
                    value={formData.notificationEmail}
                    onChange={(e) => setFormData({ ...formData, notificationEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Email for confirmation & reminders"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You'll receive a confirmation email immediately and a reminder at the scheduled time
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : editingSchedule ? 'Update' : 'Schedule'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
