import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useServerTime = () => {
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTime = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_utc_now');
    if (error || !data) {
      console.error('Ошибка получения времени сервера:', error);
      setServerTime(null);
    } else {
      // Принудительно указываем Z для UTC
      setServerTime(new Date(data + 'Z'));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTime();
  }, []);

  return { serverTime, loading, refetch: fetchTime };
};
