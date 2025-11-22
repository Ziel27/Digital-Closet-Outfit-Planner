import { useState, useEffect, useRef } from 'react';
import axios from '../utils/api.js'; // Use API utility with CSRF support
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Skeleton } from '../components/ui/skeleton';
import { FiCalendar, FiPlus, FiEdit, FiTrash2, FiMapPin, FiCloud, FiSun, FiCloudRain, FiCloudSnow, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Calendar = ({ showToast }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [styleSuggestions, setStyleSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [formData, setFormData] = useState({
    outfitId: '',
    date: '',
    occasion: 'casual',
    location: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const debounceTimerRef = useRef(null);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  // Debounced effect for fetching suggestions
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only fetch if location is provided and has at least 3 characters
    // Note: date is not required for suggestions, only location
    if (formData.location && formData.location.trim().length >= 3) {
      // Set a new timer - wait 800ms after user stops typing
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions();
      }, 800);
    } else {
      // Clear suggestions if location is too short or empty
      setStyleSuggestions([]);
      setWeather(null);
    }

    // Cleanup function to clear timer on unmount or when dependencies change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData.location, formData.occasion]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const [eventsRes, outfitsRes] = await Promise.all([
        axios.get(`/api/calendar?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        axios.get('/api/outfits?limit=100'), // Get outfits for selection
      ]);

      // Handle paginated response
      if (eventsRes.data.data) {
        setEvents(eventsRes.data.data);
      } else {
        setEvents(eventsRes.data);
      }
      
      if (outfitsRes.data.data) {
        setOutfits(outfitsRes.data.data);
      } else {
        setOutfits(outfitsRes.data);
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: error.response?.data?.message || 'Unable to load calendar data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    if (!formData.location || formData.location.trim().length < 3) return;
    
    setFetchingSuggestions(true);
    try {
      const trimmedLocation = formData.location.trim();
      if (!trimmedLocation || trimmedLocation.length === 0) {
        return;
      }
      
      const requestBody = {
        location: trimmedLocation,
      };
      
      // Only include occasion if it's a valid value from the allowed list
      const validOccasions = ['casual', 'formal', 'sporty', 'party', 'work', 'other'];
      if (formData.occasion && validOccasions.includes(formData.occasion)) {
        requestBody.occasion = formData.occasion;
      }
      
      // Only include outfitId if it's a valid non-empty MongoDB ObjectId (24 hex characters)
      const outfitId = formData.outfitId?.trim();
      if (outfitId && outfitId.length === 24 && /^[0-9a-fA-F]{24}$/.test(outfitId)) {
        requestBody.outfitId = outfitId;
      }
      
      const response = await axios.post('/api/calendar/suggestions', requestBody);
      setStyleSuggestions(response.data.suggestions || []);
      setWeather(response.data.weather);
    } catch (error) {
      // Handle different error types
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Unable to fetch weather data';
        
        // Show user-friendly error message
        if (errorMessage.includes('Unable to fetch weather data')) {
          // Don't show toast for weather errors - just silently fail
          // The user can see the error in the console if needed
          console.warn('Weather API error:', errorMessage);
        } else {
          // Show validation errors
          console.error('Validation error:', error.response?.data);
        }
      } else {
        console.error('Error fetching suggestions:', error);
      }
      setStyleSuggestions([]);
      setWeather(null);
    } finally {
      setFetchingSuggestions(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventForDate = (date) => {
    if (!date) return null;
    return events.find((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const handleDateClick = (date) => {
    if (!date) return;
    // Prevent clicking on past dates
    if (isPastDate(date)) return;
    
    setSelectedDate(date);
    const event = getEventForDate(date);
    if (event) {
      handleOpenDialog(event);
    } else {
      setFormData({
        outfitId: '',
        date: date.toISOString().split('T')[0],
        occasion: 'casual',
        location: '',
        notes: '',
      });
      setIsDialogOpen(true);
    }
  };

  const handleOpenDialog = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        outfitId: event.outfitId._id || event.outfitId,
        date: new Date(event.date).toISOString().split('T')[0],
        occasion: event.occasion || 'casual',
        location: event.location || '',
        notes: event.notes || '',
      });
      setWeather(event.weather);
      setStyleSuggestions([]);
    } else {
      setEditingEvent(null);
      setFormData({
        outfitId: '',
        date: selectedDate.toISOString().split('T')[0],
        occasion: 'casual',
        location: '',
        notes: '',
      });
      setWeather(null);
      setStyleSuggestions([]);
    }
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.outfitId) {
      errors.outfitId = 'Please select an outfit';
    }
    
    if (!formData.date) {
      errors.date = 'Date is required';
    } else {
      // Check if date is in the past
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = 'Date cannot be in the past';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };

      let response;
      if (editingEvent) {
        response = await axios.put(`/api/calendar/${editingEvent._id}`, submitData);
      } else {
        response = await axios.post('/api/calendar', submitData);
      }

      if (response.data.styleSuggestions) {
        setStyleSuggestions(response.data.styleSuggestions);
      }
      if (response.data.event?.weather) {
        setWeather(response.data.event.weather);
      }

      showToast({
        title: 'Success',
        description: editingEvent ? 'Outfit schedule updated successfully' : 'Outfit scheduled successfully',
      });
      setIsDialogOpen(false);
      setFormErrors({});
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        (error.response?.data?.errors?.[0]?.msg) ||
        'Unable to schedule outfit. Please check your input and try again.';
      showToast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setEventToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    
    setDeleting(true);
    try {
      await axios.delete(`/api/calendar/${eventToDelete}`);
      showToast({
        title: 'Success',
        description: 'Outfit removed from calendar successfully',
      });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      if (isDialogOpen) {
        setIsDialogOpen(false);
      }
      fetchData();
    } catch (error) {
      showToast({
        title: 'Error',
        description: error.response?.data?.message || 'Unable to remove outfit from calendar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const getWeatherIcon = (condition) => {
    if (!condition) return <FiSun className="h-4 w-4" />;
    const cond = condition.toLowerCase();
    if (cond.includes('rain')) return <FiCloudRain className="h-4 w-4" />;
    if (cond.includes('snow')) return <FiCloudSnow className="h-4 w-4" />;
    if (cond.includes('cloud')) return <FiCloud className="h-4 w-4" />;
    return <FiSun className="h-4 w-4" />;
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Outfit Calendar</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Plan your outfits and get weather-based style suggestions</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
          <FiPlus className="h-4 w-4 mr-2" />
          Schedule Outfit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)} className="flex-1 sm:flex-initial">
                ← Prev
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="flex-1 sm:flex-initial">
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth(1)} className="flex-1 sm:flex-initial">
                Next →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                {day}
              </div>
            ))}
            {days.map((date, index) => {
              const event = date ? getEventForDate(date) : null;
              const isToday = date && date.toDateString() === new Date().toDateString();
              const isSelected = date && date.toDateString() === selectedDate.toDateString();
              const isPast = date && isPastDate(date);

              return (
                <div
                  key={index}
                  className={`min-h-[60px] sm:min-h-[80px] border rounded-lg p-1 sm:p-2 transition-colors ${
                    !date ? 'bg-transparent' : ''
                  } ${
                    isToday ? 'border-primary border-2' : 'border-border'
                  } ${
                    isSelected ? 'bg-primary/10' : ''
                  } ${
                    isPast 
                      ? 'bg-muted/50 opacity-50 cursor-not-allowed' // Grey out past dates
                      : event 
                        ? 'bg-accent cursor-pointer hover:bg-accent/80' 
                        : 'cursor-pointer hover:bg-muted'
                  }`}
                  onClick={() => handleDateClick(date)}
                >
                  {date && (
                    <>
                      <div className={`text-xs sm:text-sm font-medium mb-1 ${
                        isPast 
                          ? 'text-muted-foreground' // Grey text for past dates
                          : isToday 
                            ? 'text-primary' 
                            : ''
                      }`}>
                        {date.getDate()}
                      </div>
                      {event && (
                        <div className="space-y-1">
                          <div className="text-[10px] sm:text-xs font-medium truncate">
                            {event.outfitId?.name || 'Outfit'}
                          </div>
                          {event.weather && (
                            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                              {getWeatherIcon(event.weather.condition)}
                              <span>{event.weather.temperature}°C</span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Upcoming Outfits</CardTitle>
            <CardDescription className="text-sm">Your scheduled outfits for this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {events.map((event) => (
                <div key={event._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FiCalendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-semibold text-sm sm:text-base">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm sm:text-base truncate">{event.outfitId?.name || 'Outfit'}</h3>
                    {event.location && (
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mt-1">
                        <FiMapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    {event.weather && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                        {getWeatherIcon(event.weather.condition)}
                        <span>{event.weather.temperature}°C - {event.weather.description}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 sm:flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(event)} className="flex-1 sm:flex-initial">
                      <FiEdit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteClick(event._id)} className="flex-1 sm:flex-initial">
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Edit Scheduled Outfit' : 'Schedule Outfit'}
            </DialogTitle>
            <DialogDescription>
              {editingEvent
                ? 'Update your scheduled outfit details'
                : 'Select an outfit and date to schedule it'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Outfit *</label>
              <Select
                value={formData.outfitId}
                onValueChange={(value) => setFormData({ ...formData, outfitId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an outfit" />
                </SelectTrigger>
                <SelectContent>
                  {outfits.map((outfit) => (
                    <SelectItem key={outfit._id} value={outfit._id}>
                      {outfit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.outfitId && (
                <p className="text-sm text-destructive mt-1">{formErrors.outfitId}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date *</label>
                <Input
                  type="date"
                  value={formData.date}
                  min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    if (formErrors.date) setFormErrors({ ...formErrors, date: '' });
                  }}
                  required
                  className={formErrors.date ? 'border-destructive' : ''}
                />
                {formErrors.date && (
                  <p className="text-sm text-destructive mt-1">{formErrors.date}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Only future dates can be selected
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Occasion</label>
                <Select
                  value={formData.occasion}
                  onValueChange={(value) => setFormData({ ...formData, occasion: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="sporty">Sporty</SelectItem>
                    <SelectItem value="party">Party</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location (for weather)</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., New York, London, Paris"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a city name to get weather-based style suggestions
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>

            {fetchingSuggestions && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Loading weather suggestions...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {weather && !fetchingSuggestions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weather Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    {getWeatherIcon(weather.condition)}
                    <span className="text-2xl font-bold">{weather.temperature}°C</span>
                    <span className="text-muted-foreground capitalize">{weather.description}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {styleSuggestions.length > 0 && !fetchingSuggestions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Style Suggestions</CardTitle>
                  <CardDescription>Based on weather and occasion</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {styleSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false);
                  setFormErrors({});
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              {editingEvent && (
                <Button type="button" variant="destructive" onClick={() => handleDeleteClick(editingEvent._id)}>
                  Delete
                </Button>
              )}
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingEvent ? 'Update' : 'Schedule'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;

