import { useState, useEffect } from 'react';
import axios from '../utils/api.js';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logger from '../utils/logger.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FiUser, FiBell, FiDownload, FiSave, FiTrash2 } from 'react-icons/fi';
// Toast will be passed as prop from parent

const Settings = ({ showToast }) => {
  const { user, fetchUser } = useAuth();
  const { theme: currentTheme, setTheme: updateTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    notificationsEnabled: true,
    notificationTime: '09:00',
    theme: 'system',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        avatar: user.avatar || '',
        notificationsEnabled: user.preferences?.notificationsEnabled ?? true,
        notificationTime: user.preferences?.notificationTime || '09:00',
        theme: user.preferences?.theme || 'system',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { name, avatar, notificationsEnabled, notificationTime, theme } = formData;
      
      // Prepare preferences object
      const preferences = {
        notificationsEnabled: notificationsEnabled ?? true,
        notificationTime: notificationTime || '09:00',
        theme: theme || 'system',
      };
      
      await axios.put('/api/users/profile', {
        name,
        avatar,
        preferences,
      });
      
      // Update theme immediately
      updateTheme(theme || 'system');
      
      if (fetchUser) {
        await fetchUser();
      }
      
      showToast({
        title: 'Success',
      });
    } catch (error) {
      logger.error('Error exporting data', error);
      showToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update theme immediately when dropdown changes (without saving)
  const handleThemeChange = (value) => {
    setFormData({ ...formData, theme: value });
    updateTheme(value);
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const response = await axios.get(`/api/export/data?format=${format}`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `digital-closet-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showToast({
        title: 'Success',
        description: `Data exported as ${format.toUpperCase()} successfully`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiUser className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Avatar URL</label>
            <Input
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
            />
            {formData.avatar && (
              <div className="mt-2">
                <img
                  src={formData.avatar}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiBell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Enable Notifications</label>
              <p className="text-xs text-muted-foreground">Receive reminders for scheduled outfits</p>
            </div>
            <Select
              value={formData.notificationsEnabled ? 'enabled' : 'disabled'}
              onValueChange={(value) =>
                setFormData({ ...formData, notificationsEnabled: value === 'enabled' })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.notificationsEnabled && (
            <div>
              <label className="text-sm font-medium mb-2 block">Notification Time</label>
              <Input
                type="time"
                value={formData.notificationTime}
                onChange={(e) => setFormData({ ...formData, notificationTime: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Time of day to receive notifications (default: 9:00 AM)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose your preferred theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-sm font-medium mb-2 block">Theme</label>
            <Select
              value={formData.theme}
              onValueChange={handleThemeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Theme changes are applied immediately. Don't forget to save to persist your preferences.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiDownload className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>Export your closet and outfits data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download your data in CSV or JSON format. This includes all your clothing items, outfits, and calendar events.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              disabled={exporting}
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('json')}
              disabled={exporting}
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button onClick={handleSave} disabled={loading}>
          <FiSave className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default Settings;

