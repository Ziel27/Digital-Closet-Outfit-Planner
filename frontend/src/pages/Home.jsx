import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/api.js'; // Use API utility with CSRF support
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FiPackage, FiGrid, FiPlus, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import Onboarding from '../components/Onboarding';

const Home = () => {
  const { user, fetchUser } = useAuth();
  const [stats, setStats] = useState({
    clothingCount: 0,
    outfitCount: 0,
    favoriteOutfits: 0,
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    const loadData = async () => {
      if (isMounted) {
        await fetchStats(abortController.signal);
        // Show onboarding if user hasn't completed it
        if (user && !user.onboardingCompleted) {
          setShowOnboarding(true);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [user]);

  const handleOnboardingComplete = async () => {
    try {
      await axios.put('/api/users/profile', { onboardingCompleted: true });
      if (fetchUser) {
        await fetchUser();
      }
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setShowOnboarding(false);
    }
  };

  const fetchStats = async (signal) => {
    try {
      const [clothingRes, outfitsRes] = await Promise.all([
        axios.get('/api/clothing', { signal }),
        axios.get('/api/outfits', { signal }),
      ]);

      // Handle paginated responses (new format) or array responses (old format)
      const clothingData = Array.isArray(clothingRes.data) 
        ? clothingRes.data 
        : (clothingRes.data.data || clothingRes.data.clothing || []);
      
      const outfitsData = Array.isArray(outfitsRes.data) 
        ? outfitsRes.data 
        : (outfitsRes.data.data || outfitsRes.data.outfits || []);

      // Ensure we have arrays
      const clothingArray = Array.isArray(clothingData) ? clothingData : [];
      const outfitsArray = Array.isArray(outfitsData) ? outfitsData : [];

      const favoriteOutfits = outfitsArray.filter((outfit) => outfit.isFavorite).length;

      setStats({
        clothingCount: clothingArray.length,
        outfitCount: outfitsArray.length,
        favoriteOutfits,
      });
    } catch (error) {
      // Don't log errors for aborted requests
      if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
        console.error('Error fetching stats:', error);
      }
    }
  };

  return (
    <>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Welcome to Your Digital Closet</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Organize your wardrobe and plan your perfect outfits
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FiPackage className="h-5 w-5 mr-2" />
              Clothing Items
            </CardTitle>
            <CardDescription>Total items in your closet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.clothingCount}</div>
            <Link to="/closet">
              <Button variant="outline" className="mt-4 w-full">
                <FiPlus className="h-4 w-4 mr-2" />
                Manage Closet
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FiGrid className="h-5 w-5 mr-2" />
              Outfits
            </CardTitle>
            <CardDescription>Saved outfit combinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.outfitCount}</div>
            <Link to="/outfits">
              <Button variant="outline" className="mt-4 w-full">
                <FiPlus className="h-4 w-4 mr-2" />
                Create Outfit
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FiTrendingUp className="h-5 w-5 mr-2" />
              Favorites
            </CardTitle>
            <CardDescription>Your favorite outfits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.favoriteOutfits}</div>
            <Link to="/outfits?favorite=true">
              <Button variant="outline" className="mt-4 w-full">
                View Favorites
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Card */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FiBarChart2 className="h-5 w-5 mr-2" />
            Analytics & Insights
          </CardTitle>
          <CardDescription>View detailed analytics about your wardrobe</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/analytics">
            <Button variant="outline" className="w-full">
              View Analytics
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default Home;

