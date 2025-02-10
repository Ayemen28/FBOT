import { supabase } from './supabase';

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function checkBotAdmin(channelId: string) {
  try {
    const response = await fetch(`${API_BASE}/getChatAdministrators?chat_id=${channelId}`);
    const data = await response.json();
    
    if (data.ok) {
      return data.result.some((admin: any) => 
        admin.user.username === BOT_TOKEN.split(':')[0]
      );
    }
    return false;
  } catch (error) {
    console.error('Error checking bot admin status:', error);
    return false;
  }
}

export async function getBotPermissions(channelId: string) {
  try {
    const response = await fetch(`${API_BASE}/getChatAdministrators?chat_id=${channelId}`);
    const data = await response.json();
    
    if (data.ok) {
      const botAdmin = data.result.find((admin: any) => 
        admin.user.username === BOT_TOKEN.split(':')[0]
      );
      
      if (botAdmin) {
        return {
          can_post_messages: botAdmin.can_post_messages || false,
          can_delete_messages: botAdmin.can_delete_messages || false,
          can_pin_messages: botAdmin.can_pin_messages || false,
          can_invite_users: botAdmin.can_invite_users || false
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting bot permissions:', error);
    return null;
  }
}

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getChannelInfo(channelId: string) {
  const cached = cache.get(channelId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  try {
    const response = await fetch(`${API_BASE}/getChat?chat_id=${channelId}`);
    const data = await response.json();
    
    if (data.ok) {
      const channelData = data.result;
      const isAdmin = await checkBotAdmin(channelId);
      const permissions = isAdmin ? await getBotPermissions(channelId) : null;
      
      return {
        ...channelData,
        bot_is_admin: isAdmin,
        bot_permissions: permissions
      };
    }
    throw new Error(data.description);
  } catch (error) {
    console.error('Error fetching channel info:', error);
    throw error;
  }
}

export async function getChannelStatistics(channelId: string) {
  try {
    // Get channel members count
    const membersResponse = await fetch(`${API_BASE}/getChatMemberCount?chat_id=${channelId}`);
    const membersData = await membersResponse.json();
    
    if (!membersData.ok) {
      throw new Error(membersData.description);
    }

    // Get recent posts
    const postsResponse = await fetch(`${API_BASE}/getUpdates?chat_id=${channelId}&limit=100`);
    const postsData = await postsResponse.json();
    
    if (!postsData.ok) {
      throw new Error(postsData.description);
    }

    return {
      subscribers_count: membersData.result,
      posts_count: postsData.result.length,
      // Calculate engagement rate based on views and reactions
      engagement_rate: calculateEngagementRate(postsData.result)
    };
  } catch (error) {
    console.error('Error fetching channel statistics:', error);
    throw error;
  }
}

function calculateEngagementRate(posts: any[]): number {
  if (posts.length === 0) return 0;
  
  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
  const totalReactions = posts.reduce((sum, post) => {
    const reactions = post.reactions || [];
    return sum + reactions.length;
  }, 0);
  
  return (totalReactions / totalViews) * 100;
}

export async function syncChannelData(channelId: string) {
  try {
    const channelInfo = await getChannelInfo(channelId);
    const statistics = await getChannelStatistics(channelId);
    
    // Update channel info in database
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .upsert({
        telegram_id: channelId,
        name: channelInfo.title,
        subscribers_count: statistics.subscribers_count
      })
      .select()
      .single();
      
    if (channelError) throw channelError;
    
    // Add new statistics record
    const { error: statsError } = await supabase
      .from('channel_statistics')
      .insert({
        channel_id: channel.id,
        posts_count: statistics.posts_count,
        engagement_rate: statistics.engagement_rate
      });
      
    if (statsError) throw statsError;
    
    return { channel, statistics };
  } catch (error) {
    console.error('Error syncing channel data:', error);
    throw error;
  }
}