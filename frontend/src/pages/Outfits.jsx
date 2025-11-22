import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../utils/api.js'; // Use API utility with CSRF support
import { Card, CardContent } from '../components/ui/card';
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
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiHeart, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { OutfitSkeletonGrid } from '../components/OutfitSkeleton';

const Outfits = ({ showToast }) => {
  const [searchParams] = useSearchParams();
  const [outfits, setOutfits] = useState([]);
  const [filteredOutfits, setFilteredOutfits] = useState([]);
  const [clothing, setClothing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [occasionFilter, setOccasionFilter] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [outfitToDelete, setOutfitToDelete] = useState(null);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    items: [],
    tags: '',
    season: [],
    occasion: [],
    rating: null,
    isFavorite: false,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
    const favorite = searchParams.get('favorite');
    if (favorite === 'true') {
      setOccasionFilter('favorites');
    }
  }, [searchParams, pagination.page]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchData();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, occasionFilter, seasonFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (occasionFilter === 'favorites') {
        params.append('favorite', 'true');
      } else if (occasionFilter !== 'all') {
        params.append('occasion', occasionFilter);
      }
      
      if (seasonFilter !== 'all') {
        params.append('season', seasonFilter);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const [outfitsRes, clothingRes] = await Promise.all([
        axios.get(`/api/outfits?${params.toString()}`),
        axios.get('/api/clothing?limit=100'), // Get all clothing for selection
      ]);
      
      // Handle both old format (array) and new format (object with data and pagination)
      if (outfitsRes.data.data) {
        setOutfits(outfitsRes.data.data);
        setFilteredOutfits(outfitsRes.data.data);
        setPagination(outfitsRes.data.pagination);
      } else {
        // Fallback for old API format
        setOutfits(outfitsRes.data);
        setFilteredOutfits(outfitsRes.data);
      }
      
      // Handle clothing response (could be paginated too)
      if (clothingRes.data.data) {
        setClothing(clothingRes.data.data);
      } else {
        setClothing(clothingRes.data);
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: error.response?.data?.message || 'Unable to load your outfits. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (outfit = null) => {
    if (outfit) {
      setEditingOutfit(outfit);
      setFormData({
        name: outfit.name,
        description: outfit.description || '',
        items: outfit.items.map((item) => item._id || item),
        tags: outfit.tags?.join(', ') || '',
        season: outfit.season || [],
        occasion: outfit.occasion || [],
        rating: outfit.rating || null,
        isFavorite: outfit.isFavorite || false,
      });
    } else {
      setEditingOutfit(null);
      setFormData({
        name: '',
        description: '',
        items: [],
        tags: '',
        season: [],
        occasion: [],
        rating: null,
        isFavorite: false,
      });
    }
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (formData.items.length === 0) {
      errors.items = 'Please select at least one clothing item';
    }
    
    if (formData.rating && (formData.rating < 1 || formData.rating > 5)) {
      errors.rating = 'Rating must be between 1 and 5';
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
        tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };

      if (editingOutfit) {
        await axios.put(`/api/outfits/${editingOutfit._id}`, submitData);
        showToast({
          title: 'Success',
          description: 'Outfit updated successfully',
        });
      } else {
        await axios.post('/api/outfits', submitData);
        showToast({
          title: 'Success',
          description: 'Outfit created successfully',
        });
      }
      setIsDialogOpen(false);
      setFormErrors({});
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        (error.response?.data?.errors?.[0]?.msg) ||
        'Unable to save outfit. Please check your input and try again.';
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
    setOutfitToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!outfitToDelete) return;
    
    setDeleting(true);
    try {
      await axios.delete(`/api/outfits/${outfitToDelete}`);
      showToast({
        title: 'Success',
        description: 'Outfit deleted successfully',
      });
      setDeleteDialogOpen(false);
      setOutfitToDelete(null);
      fetchData();
    } catch (error) {
      showToast({
        title: 'Error',
        description: error.response?.data?.message || 'Unable to delete outfit. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFavorite = async (outfit) => {
    try {
      await axios.patch(`/api/outfits/${outfit._id}/favorite`);
      fetchData();
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Unable to update favorite status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const toggleItemSelection = (itemId) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.includes(itemId)
        ? prev.items.filter((id) => id !== itemId)
        : [...prev.items, itemId],
    }));
  };


  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">My Outfits</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Create and manage your outfit combinations</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
          <FiPlus className="h-4 w-4 mr-2" />
          Create Outfit
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search outfits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-3 sm:gap-4">
          <Select value={occasionFilter} onValueChange={setOccasionFilter}>
            <SelectTrigger className="w-full sm:w-[150px] lg:w-[180px]">
              <SelectValue placeholder="Occasion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Occasions</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="sporty">Sporty</SelectItem>
              <SelectItem value="party">Party</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={seasonFilter} onValueChange={setSeasonFilter}>
            <SelectTrigger className="w-full sm:w-[150px] lg:w-[180px]">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              <SelectItem value="spring">Spring</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
              <SelectItem value="fall">Fall</SelectItem>
              <SelectItem value="winter">Winter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <OutfitSkeletonGrid count={6} />
      ) : (
        <>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOutfits.map((outfit) => (
          <Card key={outfit._id} className="overflow-hidden">
            <div className="relative aspect-square bg-muted grid grid-cols-2 gap-1 p-1">
              {outfit.items?.slice(0, 4).map((item, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={item.image || 'https://via.placeholder.com/150?text=No+Image'}
                    alt={item.name}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                  />
                </div>
              ))}
              {(!outfit.items || outfit.items.length === 0) && (
                <div className="col-span-2 flex items-center justify-center text-muted-foreground">
                  No items
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => handleToggleFavorite(outfit)}
              >
                <FiHeart
                  className={`h-5 w-5 ${outfit.isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                />
              </Button>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">{outfit.name}</h3>
              {outfit.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {outfit.description}
                </p>
              )}
              {outfit.rating && (
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`h-4 w-4 ${
                        i < outfit.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(outfit)}
                >
                  <FiEdit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(outfit._id)}
                >
                  <FiTrash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev || loading}
              >
                <FiChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext || loading}
              >
                <FiChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {!loading && filteredOutfits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No outfits found</p>
          <Button onClick={() => handleOpenDialog()}>
            <FiPlus className="h-4 w-4 mr-2" />
            Create Your First Outfit
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>
              {editingOutfit ? 'Edit Outfit' : 'Create Outfit'}
            </DialogTitle>
            <DialogDescription>
              {editingOutfit
                ? 'Update your outfit details'
                : 'Select clothing items to create a new outfit'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                }}
                required
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Select Clothing Items *</label>
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-md p-4 ${formErrors.items ? 'border-destructive' : ''}`}>
                {clothing.map((item) => (
                  <div
                    key={item._id}
                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer border ${
                      formData.items.includes(item._id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background'
                    }`}
                    onClick={() => toggleItemSelection(item._id)}
                  >
                    <input
                      type="checkbox"
                      checked={formData.items.includes(item._id)}
                      onChange={() => toggleItemSelection(item._id)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
              {clothing.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No clothing items available. Add items to your closet first.
                </p>
              )}
              {formErrors.items && (
                <p className="text-sm text-destructive mt-2">{formErrors.items}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="stylish, comfortable, summer"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Rating (1-5)</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : null;
                    setFormData({ ...formData, rating: value });
                    if (formErrors.rating) setFormErrors({ ...formErrors, rating: '' });
                  }}
                  className={formErrors.rating ? 'border-destructive' : ''}
                />
                {formErrors.rating && (
                  <p className="text-sm text-destructive mt-1">{formErrors.rating}</p>
                )}
              </div>
            </div>
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
              <Button type="submit" disabled={submitting || formData.items.length === 0}>
                {submitting ? 'Saving...' : editingOutfit ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Outfit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this outfit? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Outfits;

