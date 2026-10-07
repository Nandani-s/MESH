import { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from '../api/settings';

const SettingsContext = createContext(undefined);

const defaultSettings = {
  storeName: 'My Store',
  storeEmail: '',
  storePhone: '',
  storeAddress: '',
  currency: 'NPR',
  timezone: 'Asia/Kathmandu',
  codEnabled: true,
  khaltiEnabled: false,
  esewaEnabled: false,
  freeShippingThreshold: 0,
  standardShippingRate: 0,
  expressShippingRate: 0,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
	settingsApi.get()
	  .then((res) => setSettings(res.data))
	  .catch(() => {}) // silently fall back to defaults
	  .finally(() => setIsLoading(false));
  }, []);

  // After admin saves settings, call this to refresh the context
  const refreshSettings = async () => {
	try {
	  const res = await settingsApi.get();
	  setSettings(res.data);
	} catch {
	  return;
	}
  };

  return (
	<SettingsContext.Provider value={{ settings, isLoading, refreshSettings, setSettings }}>
	  {children}
	</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (ctx === undefined) {
	throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
