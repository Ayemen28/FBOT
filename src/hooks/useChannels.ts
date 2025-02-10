import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { syncChannelData } from '../lib/telegram';

export function useChannels() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchChannels();
    
    // Subscribe to realtime changes
    const subscription = supabase
      .channel('channels')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'channels' 
      }, handleChannelChange)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchChannels() {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select(`
          *,
          channel_statistics(
            posts_count,
            views_count,
            engagement_rate,
            recorded_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  function handleChannelChange(payload: any) {
    console.log('Channel change:', payload);
    fetchChannels();
  }

  async function addChannel(telegramId: string) {
    try {
      setLoading(true);
      const { channel } = await syncChannelData(telegramId);
      return channel;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add channel'));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function refreshChannel(channelId: string) {
    try {
      setLoading(true);
      const { channel } = await syncChannelData(channelId);
      return channel;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh channel'));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    channels,
    loading,
    error,
    addChannel,
    refreshChannel
  };
}