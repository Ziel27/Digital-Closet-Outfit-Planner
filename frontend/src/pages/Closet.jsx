import { useState, useEffect } from 'react';
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
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ImageUpload from '../components/ui/image-upload';
import { ClothingSkeletonGrid } from '../components/ClothingSkeleton';

const Closet = ({ showToast }) => {
  const [clothing, setClothing] = useState([]);
  const [filteredClothing, setFilteredClothing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
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
    category: 'top',
    color: '',
    brand: '',
    size: '',
    image: '',
    tags: '',
    season: [],
    occasion: [],
    isFavorite: false,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchClothing();
  }, [pagination.page, categoryFilter]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchClothing();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchClothing = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`/api/clothing?${params.toString()}`);
      
      // Handle both old format (array) and new format (object with data and pagination)
      if (response.data.data) {
        setClothing(response.data.data);
        setFilteredClothing(response.data.data);
        setPagination(response.data.pagination);
      } else {
        // Fallback for old API format
        setClothing(response.data);
        setFilteredClothing(response.data);
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: error.response?.data?.message || 'Unable to load your clothing items. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        color: item.color,
        brand: item.brand || '',
        size: item.size || '',
        image: item.image,
        tags: item.tags?.join(', ') || '',
        season: item.season || [],
        occasion: item.occasion || [],
        isFavorite: item.isFavorite || false,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'top',
        color: '',
        brand: '',
        size: '',
        image: '',
        tags: '',
        season: [],
        occasion: [],
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
    
    if (!formData.color.trim()) {
      errors.color = 'Color is required';
    }
    
    if (!formData.image) {
      errors.image = 'Image is required';
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

      if (editingItem) {
        await axios.put(`/api/clothing/${editingItem._id}`, submitData);
        showToast({
          title: 'Success',
          description: 'Clothing item updated successfully',
        });
      } else {
        await axios.post('/api/clothing', submitData);
        showToast({
          title: 'Success',
          description: 'Clothing item added successfully',
        });
      }
      setIsDialogOpen(false);
      setFormErrors({});
      fetchClothing();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        (error.response?.data?.errors?.[0]?.msg) ||
        'Unable to save clothing item. Please check your input and try again.';
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
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    setDeleting(true);
    try {
      await axios.delete(`/api/clothing/${itemToDelete}`);
      showToast({
        title: 'Success',
        description: 'Clothing item deleted successfully',
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchClothing();
    } catch (error) {
      showToast({
        title: 'Error',
        description: error.response?.data?.message || 'Unable to delete clothing item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFavorite = async (item) => {
    try {
      await axios.patch(`/api/clothing/${item._id}/favorite`);
      fetchClothing();
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">My Closet</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your clothing items</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
          <FiPlus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="bottom">Bottom</SelectItem>
            <SelectItem value="dress">Dress</SelectItem>
            <SelectItem value="outerwear">Outerwear</SelectItem>
            <SelectItem value="shoes">Shoes</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <ClothingSkeletonGrid count={8} />
      ) : (
        <>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredClothing.map((item) => (
          <Card key={item._id} className="overflow-hidden">
            <div className="relative aspect-square bg-muted">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => handleToggleFavorite(item)}
              >
                <FiHeart
                  className={`h-5 w-5 ${item.isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                />
              </Button>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">{item.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {item.category} • {item.color}
              </p>
              {item.brand && (
                <p className="text-xs text-muted-foreground mb-3">{item.brand}</p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(item)}
                >
                  <FiEdit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(item._id)}
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

      {!loading && filteredClothing.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No clothing items found</p>
          <Button onClick={() => handleOpenDialog()}>
            <FiPlus className="h-4 w-4 mr-2" />
            Add Your First Item
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Clothing Item' : 'Add Clothing Item'}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Update the details of your clothing item'
                : 'Add a new item to your closet'}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category *</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="dress">Dress</SelectItem>
                    <SelectItem value="outerwear">Outerwear</SelectItem>
                    <SelectItem value="shoes">Shoes</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Color *</label>
                <Input
                  value={formData.color}
                  onChange={(e) => {
                    setFormData({ ...formData, color: e.target.value });
                    if (formErrors.color) setFormErrors({ ...formErrors, color: '' });
                  }}
                  required
                  className={formErrors.color ? 'border-destructive' : ''}
                />
                {formErrors.color && (
                  <p className="text-sm text-destructive mt-1">{formErrors.color}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Brand</label>
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Size</label>
                <Input
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                />
              </div>
            </div>
            <div>
              <ImageUpload
                value={formData.image}
                onChange={(url) => {
                  setFormData({ ...formData, image: url });
                  if (formErrors.image) setFormErrors({ ...formErrors, image: '' });
                }}
              />
              {formErrors.image && (
                <p className="text-sm text-destructive mt-1">{formErrors.image}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="casual, summer, comfortable"
              />
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
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingItem ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Clothing Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this clothing item? This action cannot be undone.
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

export default Closet;

