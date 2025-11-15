import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  MapPin, 
  Clock, 
  Navigation, 
  RefreshCw, 
  Filter,
  AlertCircle,
  Loader2,
  Star
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { searchBMLTMeetings, cacheBMLTMeetings, getCachedMeetings, isCacheValid } from '@/lib/bmlt-api';
import { getCurrentLocation, requestLocationPermission, formatDistance, type LocationCoordinates } from '@/lib/location';
import { openMeetingGuide } from '@/lib/aa-meetings';
import type { Meeting, MeetingSearchFilters, BMLTConfig } from '@/types';
import MeetingDetails from './MeetingDetails';
import { WifiOff } from 'lucide-react';

interface MeetingFinderProps {
  onMeetingSelect?: (meeting: Meeting) => void;
  initialFilters?: Partial<MeetingSearchFilters>;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MeetingFinder({ onMeetingSelect, initialFilters }: MeetingFinderProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [searchRadius, setSearchRadius] = useState(25); // km
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Debounce search radius changes to avoid excessive API calls
  const debouncedSearchRadius = useDebounce(searchRadius, 500);
  
  const { toast } = useToast();
  const bmltApiRoot = useAppStore((state) => state.bmltApiRoot);
  const bmltApiKey = useAppStore((state) => state.bmltApiKey);
  const meetingCache = useAppStore((state) => state.meetingCache);
  const searchFilters = useAppStore((state) => state.meetingSearchFilters);
  const updateSearchFilters = useAppStore((state) => state.updateMeetingSearchFilters);
  const setMeetingCache = useAppStore((state) => state.setMeetingCache);
  const addFavoriteMeeting = useAppStore((state) => state.addFavoriteMeeting);
  const removeFavoriteMeeting = useAppStore((state) => state.removeFavoriteMeeting);
  const isFavoriteMeeting = useAppStore((state) => state.isFavoriteMeeting);
  const profile = useAppStore((state) => state.profile);

  // Initialize filters from props or store
  useEffect(() => {
    if (initialFilters) {
      updateSearchFilters(initialFilters);
    }
  }, [initialFilters, updateSearchFilters]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Request location permission on mount
  useEffect(() => {
    const requestPermission = async () => {
      const result = await requestLocationPermission();
      if (result.granted) {
        setLocationPermissionGranted(true);
        const currentLocation = await getCurrentLocation();
        if (currentLocation) {
          setLocation(currentLocation);
        }
      }
    };
    requestPermission();
  }, []);
  
  // Track if user has performed a search to enable auto-search on radius change
  const [hasSearched, setHasSearched] = useState(false);
  
  // Auto-search when debounced radius changes (but not on initial render)
  useEffect(() => {
    if (!hasSearched || !location || !bmltApiRoot || isOffline) {
      return;
    }
    
    // Only auto-search if radius actually changed after initial search
    if (debouncedSearchRadius !== searchRadius && debouncedSearchRadius > 0) {
      setLoading(true);
      const config: BMLTConfig = {
        apiRoot: bmltApiRoot,
        apiKey: bmltApiKey,
      };
      searchBMLTMeetings(config, location, debouncedSearchRadius, searchFilters)
        .then(results => {
          setMeetings(results);
          if (results.length > 0) {
            const cache = cacheBMLTMeetings(results, location, debouncedSearchRadius);
            setMeetingCache(cache);
          }
        })
        .catch(() => {
          // Silently fail for auto-search - user can manually retry
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [debouncedSearchRadius, location, bmltApiRoot, bmltApiKey, searchFilters, setMeetingCache, hasSearched, isOffline]);

  // Load cached meetings if available
  useEffect(() => {
    if (location && isCacheValid(meetingCache)) {
      const cached = getCachedMeetings(meetingCache, location, searchRadius);
      if (cached) {
        setMeetings(cached);
      }
    }
  }, [location, meetingCache, searchRadius]);

  const searchMeetings = useCallback(async () => {
    if (!bmltApiRoot) {
      setError('BMLT API not configured. Please set up your BMLT API root in Settings.');
      return;
    }

    if (!location) {
      setError('Location is required to search for meetings. Please enable location access.');
      return;
    }

    // Check if offline and use cache
    if (isOffline) {
      const cached = getCachedMeetings(meetingCache, location, searchRadius);
      if (cached && cached.length > 0) {
        setMeetings(cached);
        toast({
          title: 'Showing cached meetings',
          description: 'You\'re offline. Showing previously cached results.',
        });
        return;
      } else {
        setError('You\'re offline and no cached meetings are available. Please connect to the internet to search.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const config: BMLTConfig = {
        apiRoot: bmltApiRoot,
        apiKey: bmltApiKey,
      };

      const results = await searchBMLTMeetings(
        config,
        location,
        searchRadius,
        searchFilters
      );

      setMeetings(results);

      // Cache results
      if (results.length > 0) {
        const cache = cacheBMLTMeetings(results, location, searchRadius);
        setMeetingCache(cache);
      }

      if (results.length === 0) {
        toast({
          title: 'No meetings found',
          description: 'Try expanding your search radius or adjusting filters.',
        });
      }
      
      setHasSearched(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search meetings';
      setError(errorMessage);
      
      // Try to show cached results on error
      const cached = getCachedMeetings(meetingCache, location, searchRadius);
      if (cached && cached.length > 0) {
        setMeetings(cached);
        toast({
          title: 'Showing cached meetings',
          description: 'Search failed, but showing previously cached results.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Search failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [bmltApiRoot, bmltApiKey, location, searchRadius, searchFilters, setMeetingCache, toast, isOffline, meetingCache]);

  const handleUseCurrentLocation = async () => {
    const result = await requestLocationPermission();
    if (!result.granted) {
      toast({
        title: 'Location permission denied',
        description: result.error || 'Please enable location access to search for meetings.',
        variant: 'destructive',
      });
      return;
    }

    setLocationPermissionGranted(true);
    const currentLocation = await getCurrentLocation();
    if (currentLocation) {
      setLocation(currentLocation);
      await searchMeetings();
    } else {
      toast({
        title: 'Location unavailable',
        description: 'Could not determine your location. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFavorite = (meeting: Meeting) => {
    if (isFavoriteMeeting(meeting.id)) {
      removeFavoriteMeeting(meeting.id);
      toast({
        title: 'Removed from favorites',
        description: `${meeting.name} removed from favorites`,
      });
    } else {
      addFavoriteMeeting(meeting.id);
      toast({
        title: 'Added to favorites',
        description: `${meeting.name} added to favorites`,
      });
    }
  };

  const handleOpenAA = () => {
    openMeetingGuide(undefined, profile?.timezone);
    toast({
      title: 'Opening AA Meeting Guide',
      description: 'If the app is not installed, you will be redirected to the website.',
    });
  };

  const formatMeetingTime = (meeting: Meeting): string => {
    const [hours, minutes] = meeting.time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getNextMeetingDate = (meeting: Meeting): Date => {
    const now = new Date();
    const currentDay = now.getDay();
    const [hours, minutes] = meeting.time.split(':').map(Number);
    
    const meetingDate = new Date(now);
    meetingDate.setDate(now.getDate() + ((meeting.dayOfWeek - currentDay + 7) % 7));
    meetingDate.setHours(hours, minutes, 0, 0);
    
    if (meeting.dayOfWeek === currentDay && meetingDate <= now) {
      meetingDate.setDate(meetingDate.getDate() + 7);
    }
    
    return meetingDate;
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Meetings
            </CardTitle>
            {isOffline && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                Offline
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location and Search */}
          <div className="flex gap-2">
            <Button
              onClick={handleUseCurrentLocation}
              variant={location ? 'default' : 'outline'}
              className="flex-1"
              disabled={loading}
            >
              <Navigation className="h-4 w-4 mr-2" />
              {location ? 'Use Current Location' : 'Enable Location'}
            </Button>
            <Button
              onClick={searchMeetings}
              disabled={!location || !bmltApiRoot || loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>

          {/* Search Radius */}
          <div className="space-y-2">
            <label htmlFor="search-radius" className="text-sm font-medium">
              Search Radius: {searchRadius} km
            </label>
            <input
              id="search-radius"
              type="range"
              min="5"
              max="100"
              step="5"
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="w-full"
              aria-label={`Search radius: ${searchRadius} kilometers`}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSearchFilters({ program: searchFilters.program === 'NA' ? 'both' : 'NA' })}
            >
              <Filter className="h-3 w-3 mr-1" />
              {searchFilters.program === 'both' ? 'NA & AA' : 'NA Only'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSearchFilters({ startsSoon: !searchFilters.startsSoon })}
            >
              {searchFilters.startsSoon ? '✓ Starts Soon' : 'Starts Soon'}
            </Button>
          </div>

          {/* AA Meeting Guide Link */}
          <Button
            variant="outline"
            onClick={handleOpenAA}
            className="w-full"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Open AA Meeting Guide
          </Button>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && meetings.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={searchMeetings}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>

          {meetings.map((meeting) => (
            <Card
              key={meeting.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => {
                setSelectedMeeting(meeting);
                onMeetingSelect?.(meeting);
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{meeting.program}</Badge>
                      <Badge variant={meeting.format === 'online' ? 'secondary' : 'default'}>
                        {meeting.format}
                      </Badge>
                      <CardTitle className="text-base">{meeting.name}</CardTitle>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {DAY_NAMES[meeting.dayOfWeek]} at {formatMeetingTime(meeting)}
                      </div>
                      {meeting.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {meeting.location.city}, {meeting.location.state || meeting.location.country}
                          {meeting.distanceKm && (
                            <span className="ml-1">• {formatDistance(meeting.distanceKm)}</span>
                          )}
                        </div>
                      )}
                      {meeting.onlineDetails && (
                        <div className="text-xs text-muted-foreground">
                          Online meeting available
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(meeting);
                    }}
                  >
                    <Star className={`h-4 w-4 ${isFavoriteMeeting(meeting.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && meetings.length === 0 && location && bmltApiRoot && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No meetings found. Try expanding your search radius or adjusting filters.
          </AlertDescription>
        </Alert>
      )}

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <MeetingDetails
          meeting={selectedMeeting}
          open={!!selectedMeeting}
          onOpenChange={(open) => !open && setSelectedMeeting(null)}
        />
      )}
    </div>
  );
}

