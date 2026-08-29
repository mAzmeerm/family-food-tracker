import { useState, useCallback } from 'react';
import { LocationCoordinates } from '../types';

export interface GeolocationState {
  coordinates: LocationCoordinates | null;
  loading: boolean;
  error: string | null;
  errorCode: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED' | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: false,
    error: null,
    errorCode: null,
  });

  const getCurrentLocation = useCallback((): Promise<LocationCoordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errorMsg = 'Geolocation is not supported by your browser.';
        setState({
          coordinates: null,
          loading: false,
          error: errorMsg,
          errorCode: 'NOT_SUPPORTED',
        });
        reject(new Error(errorMsg));
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null, errorCode: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setState({
            coordinates: coords,
            loading: false,
            error: null,
            errorCode: null,
          });
          resolve(coords);
        },
        (error) => {
          let errorMsg = 'Unable to retrieve your location.';
          let code: GeolocationState['errorCode'] = 'POSITION_UNAVAILABLE';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Location permission was denied. Please allow location access in your browser settings or select manually on the map.';
              code = 'PERMISSION_DENIED';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location information is currently unavailable. Please try again or select manually.';
              code = 'POSITION_UNAVAILABLE';
              break;
            case error.TIMEOUT:
              errorMsg = 'Location request timed out. Please try again or select manually.';
              code = 'TIMEOUT';
              break;
          }

          setState({
            coordinates: null,
            loading: false,
            error: errorMsg,
            errorCode: code,
          });
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  }, []);

  const clearLocationError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null, errorCode: null }));
  }, []);

  return {
    ...state,
    getCurrentLocation,
    clearLocationError,
  };
};
