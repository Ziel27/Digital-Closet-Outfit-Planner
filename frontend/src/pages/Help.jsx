import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FiHelpCircle, FiPackage, FiGrid, FiCalendar, FiCloud, FiSearch, FiSettings } from 'react-icons/fi';

const Help = () => {
  const faqCategories = [
    {
      title: 'Getting Started',
      icon: FiHelpCircle,
      questions: [
        {
          q: 'How do I add clothing items to my closet?',
          a: 'Go to the Closet page and click "Add Item". Upload a photo of your clothing item, fill in details like category, color, brand, and tags, then save. You can add multiple items quickly!'
        },
        {
          q: 'What information should I include when adding clothes?',
          a: 'Include a clear photo, select the category (top, bottom, shoes, etc.), choose colors, add brand name if desired, and add tags for easy searching later (e.g., "casual", "formal", "summer").'
        },
        {
          q: 'How do I create an outfit?',
          a: 'Go to the Outfits page and click "Create Outfit". Select multiple clothing items from your closet, give it a name, add a description, tags, and occasion type. You can also mark it as a favorite!'
        }
      ]
    },
    {
      title: 'Closet Management',
      icon: FiPackage,
      questions: [
        {
          q: 'How do I search for specific items?',
          a: 'Use the search bar on the Closet page. You can search by name, category, color, brand, or tags. You can also use filters to narrow down results by category or color.'
        },
        {
          q: 'Can I edit or delete clothing items?',
          a: 'Yes! Click on any clothing item to edit its details, or use the delete button to remove it from your closet. Deleted items cannot be recovered.'
        },
        {
          q: 'How many clothing items can I add?',
          a: 'There\'s no limit! Add as many items as you want to your digital closet. All your photos are securely stored in the cloud.'
        }
      ]
    },
    {
      title: 'Outfit Planning',
      icon: FiGrid,
      questions: [
        {
          q: 'How do I schedule an outfit on the calendar?',
          a: 'Go to the Calendar page, click on a future date, select an outfit, add occasion and location (for weather suggestions), and save. You can only schedule outfits for future dates.'
        },
        {
          q: 'Can I schedule the same outfit multiple times?',
          a: 'Yes! You can schedule any outfit multiple times on different dates. This helps you plan your wardrobe in advance.'
        },
        {
          q: 'How do I mark an outfit as favorite?',
          a: 'When creating or editing an outfit, toggle the "Favorite" option. You can also filter outfits to show only favorites.'
        }
      ]
    },
    {
      title: 'Calendar & Scheduling',
      icon: FiCalendar,
      questions: [
        {
          q: 'Why can\'t I schedule outfits for past dates?',
          a: 'The calendar only allows scheduling for today and future dates. Past dates are greyed out to help you plan ahead.'
        },
        {
          q: 'How far in advance can I schedule outfits?',
          a: 'You can schedule outfits up to 1 year in advance. This gives you plenty of time to plan your wardrobe!'
        },
        {
          q: 'Can I edit or delete scheduled outfits?',
          a: 'Yes! Click on any scheduled outfit in the calendar to edit its details or delete it. Changes are saved immediately.'
        }
      ]
    },
    {
      title: 'Weather & Suggestions',
      icon: FiCloud,
      questions: [
        {
          q: 'How do weather-based suggestions work?',
          a: 'When you schedule an outfit and add a location, our system fetches the weather forecast and provides style suggestions based on temperature, conditions, and your wardrobe.'
        },
        {
          q: 'What locations are supported for weather?',
          a: 'You can enter any city name (e.g., "New York", "London", "Paris"). The system uses OpenWeatherMap to fetch accurate forecasts.'
        },
        {
          q: 'Do suggestions consider my actual clothing items?',
          a: 'Yes! Suggestions are personalized based on the clothing items in your closet, ensuring recommendations are practical and achievable.'
        }
      ]
    },
    {
      title: 'Account & Settings',
      icon: FiSettings,
      questions: [
        {
          q: 'How do I update my profile?',
          a: 'Go to Settings from your profile menu. You can update your name, avatar, notification preferences, and more.'
        },
        {
          q: 'Can I export my data?',
          a: 'Yes! In Settings, you can export your closet and outfits as CSV or JSON files. This helps you backup your data.'
        },
        {
          q: 'How do notifications work?',
          a: 'You\'ll receive in-app notifications for upcoming scheduled outfits. You can customize notification preferences in Settings.'
        },
        {
          q: 'How do I delete my account?',
          a: 'Contact support if you need to delete your account. All your data will be permanently removed.'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Help & FAQ</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Find answers to common questions and learn how to use Digital Closet
        </p>
      </div>

      <div className="space-y-6">
        {faqCategories.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="border-b last:border-0 pb-4 last:pb-0">
                      <h3 className="font-semibold mb-2 text-base">{faq.q}</h3>
                      <p className="text-sm text-muted-foreground">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
          <CardDescription>
            Can't find what you're looking for? Contact us for support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Email us at <a href="mailto:gianpon05@gmail.com" className="text-primary hover:underline">gianpon05@gmail.com</a> and we'll get back to you as soon as possible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;

