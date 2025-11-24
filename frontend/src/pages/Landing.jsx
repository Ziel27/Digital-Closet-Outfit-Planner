import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import SEO from "../components/SEO";
import PrivacyModal from "../components/legal/PrivacyModal";
import TermsModal from "../components/legal/TermsModal";
import CookiesModal from "../components/legal/CookiesModal";
import TestimonialForm from "../components/TestimonialForm";
import axios from "../utils/api.js"; // Use API utility with CSRF support
import {
  FiPackage,
  FiCalendar,
  FiCloud,
  FiTrendingUp,
  FiShield,
  FiSmartphone,
  FiCheck,
  FiArrowRight,
  FiGrid,
  FiStar,
  FiZap,
  FiClock,
  FiLock,
  FiUsers,
  FiAward,
  FiBarChart,
  FiArrowUp,
  FiPlay,
} from "react-icons/fi";

const Landing = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOutfits: 0,
    totalClothingItems: 0,
    totalPlannedOutfits: 0,
    avgOutfitsPerUser: 0,
    recentUsers: 0,
  });
  const [testimonials, setTestimonials] = useState({
    testimonials: [],
    averageRating: 0,
    totalTestimonials: 0,
  });
  const [loading, setLoading] = useState(true);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCookiesModal, setShowCookiesModal] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);

  const featuresRef = useRef(null);
  const benefitsRef = useRef(null);
  const testimonialsRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/stats/public", {
          timeout: 5000, // 5 second timeout
        });
        setStats(response.data);
      } catch (error) {
        // Silently handle connection errors and rate limits - backend might not be running or rate limited
        // This is fine for the landing page, it will show default values
        if (
          error.code !== "ECONNREFUSED" &&
          error.code !== "ERR_NETWORK" &&
          error.response?.status !== 429
        ) {
          console.error("Error fetching stats:", error.message);
        }
        // Keep default values (0) on error - this is fine for landing page
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get("/api/testimonials/public", {
          timeout: 5000, // 5 second timeout
        });
        setTestimonials(response.data);
      } catch (error) {
        // Silently handle connection errors and rate limits - backend might not be running or rate limited
        // This is fine for the landing page, it will show default values
        if (
          error.code !== "ECONNREFUSED" &&
          error.code !== "ERR_NETWORK" &&
          error.response?.status !== 429
        ) {
          console.error("Error fetching testimonials:", error.message);
        }
        // Keep default values on error - this is fine for landing page
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll function
  const scrollToSection = (ref) => {
    if (ref?.current) {
      // Add a small delay to ensure ref is mounted
      setTimeout(() => {
        ref.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }, 100);
    } else {
      // Fallback: scroll to section by ID
      const sectionId =
        ref === featuresRef
          ? "features"
          : ref === benefitsRef
          ? "benefits"
          : ref === testimonialsRef
          ? "testimonials"
          : null;
      if (sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  };

  // Handle anchor link clicks
  const handleAnchorClick = (e, sectionId) => {
    e.preventDefault();
    const sectionMap = {
      features: featuresRef,
      benefits: benefitsRef,
      testimonials: testimonialsRef,
    };
    const ref = sectionMap[sectionId];
    if (ref) {
      scrollToSection(ref);
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K+";
    }
    return num.toString();
  };

  // Handle Watch Demo - scrolls to features section
  const handleWatchDemo = () => {
    // Try scrolling via ref first
    if (featuresRef?.current) {
      featuresRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    } else {
      // Fallback: scroll to features section by ID
      const featuresSection = document.getElementById("features");
      if (featuresSection) {
        featuresSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        // Last resort: scroll down a bit
        window.scrollBy({
          top: window.innerHeight * 0.8,
          behavior: "smooth",
        });
      }
    }
  };
  return (
    <>
      <SEO
        title="Digital Closet - Organize Your Wardrobe & Plan Perfect Outfits | Free Outfit Planner"
        description="Organize your wardrobe digitally, plan outfits with weather-based suggestions, and never wonder what to wear again. Free outfit planner with calendar integration and smart style recommendations."
        keywords="digital closet, outfit planner, wardrobe organizer, fashion app, outfit calendar, weather-based fashion, style suggestions, clothing organizer, outfit planning app, wardrobe management"
      />

      {/* Professional Navbar */}
      <nav className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md group-hover:bg-primary/30 transition-colors"></div>
                <div className="relative bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <FiPackage className="h-6 w-6 text-primary" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Digital Closet
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  className="shadow-md hover:shadow-lg transition-all"
                >
                  Get Started
                  <FiArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 relative z-10">
            <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
              {/* Badge */}
              {!loading && stats.totalUsers > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4 animate-fade-in">
                  <FiAward className="h-4 w-4" />
                  <span>
                    Trusted by {formatNumber(stats.totalUsers)}+ fashion
                    enthusiasts
                  </span>
                </div>
              )}

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                Your Digital Closet,
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent">
                  Perfectly Organized
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl leading-relaxed">
                Plan outfits, get weather-based style suggestions, and never
                wonder
                <span className="font-semibold text-foreground">
                  {" "}
                  "what should I wear?"{" "}
                </span>
                again
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-20">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-10 py-7 shadow-xl hover:shadow-2xl transition-all hover:scale-105 relative z-20"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = "/login";
                  }}
                >
                  Get Started Free
                  <FiArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-lg px-10 py-7 border-2 hover:bg-muted transition-all hover:scale-105 cursor-pointer relative z-20"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleWatchDemo();
                  }}
                  type="button"
                >
                  <FiPlay className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="p-1.5 rounded-full bg-primary/10">
                    <FiZap className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="p-1.5 rounded-full bg-primary/10">
                    <FiClock className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Setup in 2 minutes</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="p-1.5 rounded-full bg-primary/10">
                    <FiLock className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Secure & Private</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-y bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {loading ? "..." : formatNumber(stats.totalUsers)}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Active Users
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {loading ? "..." : formatNumber(stats.totalPlannedOutfits)}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Outfits Planned
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {loading ? "..." : formatNumber(stats.totalOutfits)}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Outfits Created
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {loading ? "..." : formatNumber(stats.totalClothingItems)}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Clothing Items
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          ref={featuresRef}
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32"
        >
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Everything You Need to
              <br />
              <span className="text-primary">Organize Your Wardrobe</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Smart features that make outfit planning effortless and enjoyable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FiPackage,
                title: "Digital Closet",
                description:
                  "Upload and organize all your clothing items in one place. Categorize by type, color, brand, and more with beautiful image galleries.",
              },
              {
                icon: FiGrid,
                title: "Outfit Planning",
                description:
                  "Create and save outfit combinations. Mix and match your clothes to create the perfect look for any occasion.",
              },
              {
                icon: FiCalendar,
                title: "Outfit Calendar",
                description:
                  "Schedule outfits for specific dates. Plan your wardrobe week by week and never repeat outfits unintentionally.",
              },
              {
                icon: FiCloud,
                title: "Weather Integration",
                description:
                  "Get intelligent style suggestions based on real-time weather data. Dress appropriately for any condition automatically.",
              },
              {
                icon: FiTrendingUp,
                title: "Smart Suggestions",
                description:
                  "AI-powered recommendations based on weather, occasion, and your existing wardrobe items for perfect outfit choices.",
              },
              {
                icon: FiSmartphone,
                title: "Mobile Friendly",
                description:
                  "Access your digital closet anywhere, anytime. Fully responsive design works perfectly on all devices and screen sizes.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section
          id="benefits"
          ref={benefitsRef}
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-24"
        >
          <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-8 sm:p-12 lg:p-16 border border-primary/20">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                  Why Choose Digital Closet?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Join thousands of users who've simplified their wardrobe
                  management
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    title: "Save Time",
                    description:
                      "No more standing in front of your closet wondering what to wear. Plan outfits in advance and start your day stress-free.",
                  },
                  {
                    title: "Weather Ready",
                    description:
                      "Always dress appropriately with weather-based suggestions. Never be too hot or too cold again with intelligent recommendations.",
                  },
                  {
                    title: "Discover Your Style",
                    description:
                      "See all your clothes in one place and discover new outfit combinations you never thought of. Maximize your wardrobe potential.",
                  },
                  {
                    title: "Reduce Decision Fatigue",
                    description:
                      "Plan your outfits the night before and start your day stress-free with your outfit ready. One less decision to make each morning.",
                  },
                  {
                    title: "Track Your Favorites",
                    description:
                      "Mark your favorite outfits and items. Build a collection of go-to looks for any occasion and access them instantly.",
                  },
                  {
                    title: "Secure & Private",
                    description:
                      "Your wardrobe data is encrypted and secure. We use OAuth authentication for maximum security and privacy protection.",
                  },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-primary/20 transition-colors">
                      <FiCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section
          id="testimonials"
          ref={testimonialsRef}
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Loved by Fashion Enthusiasts
            </h2>
            {testimonialsLoading ? (
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary"></div>
              </div>
            ) : testimonials.averageRating > 0 ? (
              <div className="flex items-center justify-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`h-7 w-7 ${
                      i < Math.round(testimonials.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-3 text-2xl font-bold">
                  {testimonials.averageRating}/5
                </span>
              </div>
            ) : null}
            <p className="text-lg text-muted-foreground">
              {loading
                ? "Loading..."
                : `Join ${formatNumber(
                    stats.totalUsers
                  )}+ users organizing their wardrobes`}
            </p>
          </div>

          {testimonialsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : testimonials.testimonials.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.testimonials
                .slice(0, 3)
                .map((testimonial, index) => (
                  <Card
                    key={index}
                    className="border-2 hover:border-primary/30 transition-all hover:shadow-lg"
                  >
                    <CardContent className="pt-8 pb-8">
                      <div className="flex items-center gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`h-5 w-5 ${
                              i < testimonial.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-6 leading-relaxed text-base">
                        "{testimonial.comment}"
                      </p>
                      <div>
                        <p className="font-semibold text-lg">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role || "User"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No testimonials yet. Be the first to share your experience!
              </p>
              <Button
                onClick={() => setShowTestimonialForm(true)}
                variant="outline"
                size="lg"
              >
                Share Your Experience
              </Button>
            </div>
          )}

          {/* Add Testimonial Button */}
          {testimonials.testimonials.length > 0 && (
            <div className="text-center mt-12">
              <Button
                onClick={() => setShowTestimonialForm(true)}
                variant="outline"
                size="lg"
              >
                Share Your Experience
              </Button>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Card className="bg-gradient-to-r from-primary via-primary/95 to-primary border-2 border-primary/20 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <CardContent className="pt-16 pb-16 px-8 sm:px-12 lg:px-16 text-center relative">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-primary-foreground">
                Ready to Transform Your Wardrobe?
              </h2>
              <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who are already organizing their closets
                and planning perfect outfits every day
              </p>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-12 py-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 mb-6"
                >
                  Get Started Free
                  <FiArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/80">
                <div className="flex items-center gap-2">
                  <FiCheck className="h-4 w-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="h-4 w-4" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="h-4 w-4" />
                  <span>Setup in 2 minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t bg-muted/50 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <FiPackage className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-2xl font-bold">Digital Closet</span>
                </div>
                <p className="text-muted-foreground max-w-md">
                  Organize your wardrobe digitally and plan perfect outfits with
                  weather-based suggestions. Simplify your morning routine and
                  discover your personal style.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <a
                      href="#features"
                      onClick={(e) => handleAnchorClick(e, "features")}
                      className="hover:text-foreground transition-colors cursor-pointer"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#benefits"
                      onClick={(e) => handleAnchorClick(e, "benefits")}
                      className="hover:text-foreground transition-colors cursor-pointer"
                    >
                      Benefits
                    </a>
                  </li>
                  <li>
                    <a
                      href="#testimonials"
                      onClick={(e) => handleAnchorClick(e, "testimonials")}
                      className="hover:text-foreground transition-colors cursor-pointer"
                    >
                      Testimonials
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <Link
                      to="/login"
                      className="hover:text-foreground transition-colors"
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#features"
                      onClick={(e) => handleAnchorClick(e, "features")}
                      className="hover:text-foreground transition-colors cursor-pointer"
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:gianpon05@gmail.com"
                      className="hover:text-foreground transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 Digital Closet. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Privacy
                </button>
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Terms
                </button>
                <button
                  onClick={() => setShowCookiesModal(true)}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Cookies
                </button>
              </div>
            </div>
          </div>
        </footer>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 animate-fade-in"
            aria-label="Scroll to top"
          >
            <FiArrowUp className="h-5 w-5" />
          </button>
        )}

        {/* Legal Modals */}
        <PrivacyModal
          open={showPrivacyModal}
          onOpenChange={setShowPrivacyModal}
        />
        <TermsModal open={showTermsModal} onOpenChange={setShowTermsModal} />
        <CookiesModal
          open={showCookiesModal}
          onOpenChange={setShowCookiesModal}
        />

        {/* Testimonial Form Modal */}
        <TestimonialForm
          open={showTestimonialForm}
          onOpenChange={setShowTestimonialForm}
          onSuccess={() => {
            // Refresh testimonials after successful submission
            const fetchTestimonials = async () => {
              try {
                const response = await axios.get("/api/testimonials/public", {
                  timeout: 5000,
                });
                setTestimonials(response.data);
              } catch (error) {
                if (
                  error.code !== "ECONNREFUSED" &&
                  error.code !== "ERR_NETWORK" &&
                  error.response?.status !== 429
                ) {
                  console.error("Error fetching testimonials:", error.message);
                }
              }
            };
            fetchTestimonials();
          }}
        />
      </div>
    </>
  );
};

export default Landing;
