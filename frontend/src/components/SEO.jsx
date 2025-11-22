import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({ title, description, keywords, image }) => {
  const location = useLocation();
  const baseUrl = 'https://digital-closet.app';
  const currentUrl = `${baseUrl}${location.pathname}`;
  
  const defaultTitle = 'Digital Closet - Organize Your Wardrobe & Plan Perfect Outfits';
  const defaultDescription = 'Organize your wardrobe digitally, plan outfits with weather-based suggestions, and never wonder what to wear again. Free outfit planner with calendar integration.';
  const defaultImage = `${baseUrl}/og-image.jpg`;

  const seoTitle = title || defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultImage;
  const seoKeywords = keywords || 'digital closet, outfit planner, wardrobe organizer, fashion app, outfit calendar, weather-based fashion, style suggestions';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="title" content={seoTitle} />
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={seoTitle} />
      <meta property="twitter:description" content={seoDescription} />
      <meta property="twitter:image" content={seoImage} />
    </Helmet>
  );
};

export default SEO;

