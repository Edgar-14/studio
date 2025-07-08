// src/components/AddressAutocompleteInput.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

type LatLng = { lat: number; lng: number };

interface AddressAutocompleteInputProps {
  defaultValue?: string;
  onAddressSelect: (address: { description: string; coordinates: LatLng | null }) => void;
  disabled?: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function AddressAutocompleteInput({ defaultValue = '', onAddressSelect, disabled = false }: AddressAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const debouncedInputValue = useDebounce(inputValue, 500);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);

  const places = useMapsLibrary('places');
  const geocoding = useMapsLibrary('geocoding');

  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (places) setAutocompleteService(new places.AutocompleteService());
    if (geocoding) setGeocoder(new geocoding.Geocoder());
  }, [places, geocoding]);

  useEffect(() => {
    if (autocompleteService && debouncedInputValue && debouncedInputValue.length > 3) {
      autocompleteService.getPlacePredictions(
        { input: debouncedInputValue, componentRestrictions: { country: 'MX' } },
        (newPredictions) => setPredictions(newPredictions || [])
      );
    } else {
      setPredictions([]);
    }
  }, [debouncedInputValue, autocompleteService]);

  const handleSelectAddress = (prediction: google.maps.places.AutocompletePrediction) => {
    setInputValue(prediction.description);
    setPredictions([]);

    if (!geocoder || !prediction.place_id) {
      onAddressSelect({ description: prediction.description, coordinates: null });
      return;
    }

    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        onAddressSelect({
          description: prediction.description,
          coordinates: { lat: location.lat(), lng: location.lng() },
        });
      } else {
        onAddressSelect({ description: prediction.description, coordinates: null });
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setPredictions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Escribe una dirección..."
        autoComplete="off"
        disabled={disabled || !autocompleteService || !geocoder}
      />
      {predictions.length > 0 && (
        <ul className="absolute z-10 w-full bg-card border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
          {predictions.map((prediction) => (
            <li
              key={prediction.place_id}
              onClick={() => handleSelectAddress(prediction)}
              className="px-4 py-3 cursor-pointer hover:bg-muted flex items-center gap-3"
            >
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">{prediction.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
