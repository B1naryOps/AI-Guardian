import { useState, useEffect } from 'react';
import { settingsService } from '../services/api';

interface CompanySettings {
  name: string;
  industry: string;
  is_configured: boolean;
  logo_url: string | null;
  dashboard_layout: string | null;
}

// Un petit cache simple pour éviter de refetcher à chaque montage de composant si c'est pas nécessaire
let cachedSettings: CompanySettings | null = null;
let fetchPromise: Promise<CompanySettings> | null = null;

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = settingsService.get().then(data => {
        cachedSettings = data;
        return data;
      });
    }

    fetchPromise.then(data => {
      setSettings(data);
      setLoading(false);
    }).catch(err => {
      console.error('Erreur chargement paramètres entreprise:', err);
      setLoading(false);
    });
  }, []);

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await settingsService.get();
      cachedSettings = data;
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refetch };
};
