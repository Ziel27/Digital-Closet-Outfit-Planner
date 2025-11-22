import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FiPackage, FiGrid, FiCalendar, FiCloud, FiX, FiChevronRight, FiChevronLeft } from 'react-icons/fi';

const Onboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Digital Closet!',
      description: 'Your personal wardrobe organizer and outfit planner',
      icon: FiPackage,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Get started by organizing your wardrobe, creating outfits, and planning your looks with weather-based suggestions.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">1</div>
              <div className="text-sm text-muted-foreground mt-2">Add Clothes</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">2</div>
              <div className="text-sm text-muted-foreground mt-2">Create Outfits</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground mt-2">Schedule</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">4</div>
              <div className="text-sm text-muted-foreground mt-2">Get Suggestions</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Organize Your Closet',
      description: 'Add and manage your clothing items',
      icon: FiPackage,
      content: (
        <div className="space-y-4">
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Upload photos of your clothes</span>
            </li>
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Add details like category, color, brand, and tags</span>
            </li>
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Mark favorites for quick access</span>
            </li>
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Search and filter to find items quickly</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Create Outfits',
      description: 'Mix and match your clothes',
      icon: FiGrid,
      content: (
        <div className="space-y-4">
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Combine multiple clothing items into outfits</span>
            </li>
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Add descriptions, tags, and occasion types</span>
            </li>
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Rate outfits to remember your favorites</span>
            </li>
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Save outfits for future use</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Schedule Outfits',
      description: 'Plan your wardrobe on the calendar',
      icon: FiCalendar,
      content: (
        <div className="space-y-4">
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Schedule outfits for specific dates</span>
            </li>
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Add location to get weather-based suggestions</span>
            </li>
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>View your planned outfits in calendar view</span>
            </li>
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Get notifications for upcoming scheduled outfits</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Smart Suggestions',
      description: 'Get weather-based style recommendations',
      icon: FiCloud,
      content: (
        <div className="space-y-4">
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Automatic weather integration</span>
            </li>
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Personalized suggestions based on your wardrobe</span>
            </li>
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Occasion-based recommendations</span>
            </li>
            <li className="flex items-start gap-2">
              <FiChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Temperature-appropriate outfit ideas</span>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skip = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
                <CardDescription className="mt-1">{currentStepData.description}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={skip} className="absolute top-4 right-4">
              <FiX className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="flex gap-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="min-h-[200px]">
            {currentStepData.content}
          </div>
          
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <FiChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button variant="ghost" onClick={skip}>
                Skip Tutorial
              </Button>
              <Button onClick={nextStep}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                <FiChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;

