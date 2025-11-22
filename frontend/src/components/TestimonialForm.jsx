import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FiStar, FiX } from 'react-icons/fi';
import axios from '../utils/api.js'; // Use API utility with CSRF support

const TestimonialForm = ({ open, onOpenChange, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    rating: 5,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to submit a testimonial');
        setSubmitting(false);
        return;
      }

      const response = await axios.post(
        `${apiUrl}/api/testimonials`,
        {
          name: formData.name || user?.name || 'Anonymous',
          role: formData.role || 'User',
          rating: formData.rating,
          comment: formData.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reset form
      setFormData({
        name: '',
        role: '',
        rating: 5,
        comment: '',
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      setError(
        error.response?.data?.message ||
        'Failed to submit testimonial. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Share Your Experience</DialogTitle>
          <DialogDescription>
            Help others discover Digital Closet by sharing your experience
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Please log in to submit a testimonial
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(rating)}
                    className={`p-2 rounded transition-all ${
                      formData.rating >= rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    } hover:scale-110`}
                  >
                    <FiStar
                      className={`h-6 w-6 ${
                        formData.rating >= rating ? 'fill-current' : ''
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={user?.name || 'Enter your name'}
                required
                className="w-full"
              />
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Role (Optional)
              </label>
              <Input
                type="text"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                placeholder="e.g., Fashion Blogger, Student, Professional"
                className="w-full"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Review *
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 500) {
                    setFormData({ ...formData, comment: value });
                  }
                }}
                placeholder="Tell us about your experience with Digital Closet..."
                required
                minLength={10}
                maxLength={500}
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.comment.length}/500 characters (minimum 10 characters)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Testimonial'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TestimonialForm;

