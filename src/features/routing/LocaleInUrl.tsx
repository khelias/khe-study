import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchWithLocale } from '../../i18n';

/** Puts ?lang back after a navigation drops it, so a reload shows the same language. */
export function LocaleInUrl(): null {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const search = searchWithLocale(location.search);
    if (search) {
      void navigate({ ...location, search }, { replace: true, state: location.state as unknown });
    }
  }, [location, navigate]);
  return null;
}
