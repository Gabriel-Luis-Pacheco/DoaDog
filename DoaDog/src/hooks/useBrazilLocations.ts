import { useEffect, useState } from 'react';
import { SelectOption } from '../components/AppSelect';
import { getCitiesByState, getStates } from '../services/ibgeService';

export function useBrazilLocations(selectedState: string) {
  const [states, setStates] = useState<SelectOption[]>([]);
  const [cities, setCities] = useState<SelectOption[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    let active = true;

    getStates().then((result) => {
      if (!active) return;
      setStates(result.data);
      setLocationError(result.error || '');
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!selectedState) {
      setCities([]);
      return () => {
        active = false;
      };
    }

    setLoadingCities(true);
    getCitiesByState(selectedState)
      .then((result) => {
        if (!active) return;
        setCities(result.data);
        setLocationError(result.error || '');
      })
      .finally(() => {
        if (active) setLoadingCities(false);
      });

    return () => {
      active = false;
    };
  }, [selectedState]);

  return {
    states,
    cities,
    loadingCities,
    locationError,
  };
}
