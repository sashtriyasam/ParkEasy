import axios from 'axios';

export interface LocationSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

export const searchLocation = async (query: string): Promise<LocationSuggestion[]> => {
  if (!query || query.length < 3) return [];
  
  try {
    // Using Nominatim OpenStreetMap API
    // User-Agent is required by their policy
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5,
        countrycodes: 'in', // Restrict to India as per project requirements
      },
      headers: {
        'User-Agent': 'ParkEasyMobile-App'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
};
