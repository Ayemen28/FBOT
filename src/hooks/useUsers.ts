import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  last_sign_in: string;
}

export interface UserStats {
  total_messages: number;
  last_activity: string;
  engagement_rate: number;
  activity_logs: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
}

export interface PermissionTemplate {
  id: string;
  name: string;
  permissions: string[];
}

export function useUsers(channelId?: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  useEffect(() => {
    if (channelId) {
      fetchUsers(channelId);
      fetchTemplates();
    }
  }, [channelId, searchQuery, roleFilter]);

  async function fetchUsers(channelId: string) {
    try {
      let query = supabase
        .from('channel_admins')
        .select(`
          id,
          user_id,
          role,
          permissions,
          users:user_id (
            email,
            last_sign_in_at
          )
        `)
        .eq('channel_id', channelId);

      if (searchQuery) {
        query = query.textSearch('users.email', searchQuery);
      }

      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }

      const { data: admins, error: adminsError } = await query;

      if (adminsError) throw adminsError;

      const formattedUsers = admins.map(admin => ({
        id: admin.user_id,
        email: admin.users.email,
        role: admin.role,
        permissions: admin.permissions,
        last_sign_in: admin.users.last_sign_in_at
      }));

      setUsers(formattedUsers);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch users'));
    } finally {
      setLoading(false);
    }
  }

  async function fetchTemplates() {
    try {
      const { data, error } = await supabase
        .from('permission_templates')
        .select('*');

      if (error) throw error;
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  }

  async function getUserStats(userId: string): Promise<UserStats> {
    try {
      const [interactions, logs] = await Promise.all([
        supabase
          .from('user_interactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_activity_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
      ]);

      if (interactions.error) throw interactions.error;
      if (logs.error) throw logs.error;

      return {
        total_messages: interactions.data.length,
        last_activity: interactions.data[0]?.created_at || '',
        engagement_rate: calculateEngagementRate(interactions.data),
        activity_logs: logs.data
      };
    } catch (err) {
      console.error('Error fetching user stats:', err);
      throw err;
    }
  }

  async function addAdmin(userId: string, role: string, permissions: string[]) {
    try {
      const { error } = await supabase
        .from('channel_admins')
        .insert({
          channel_id: channelId,
          user_id: userId,
          role,
          permissions
        });

      if (error) throw error;

      // Log activity
      await logActivity(userId, 'admin_added', { role, permissions });
      await fetchUsers(channelId!);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add admin'));
      throw err;
    }
  }

  async function updatePermissions(userId: string, permissions: string[]) {
    try {
      const { error } = await supabase
        .from('channel_admins')
        .update({ permissions })
        .match({ channel_id: channelId, user_id: userId });

      if (error) throw error;

      // Log activity
      await logActivity(userId, 'permissions_updated', { permissions });
      await fetchUsers(channelId!);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update permissions'));
      throw err;
    }
  }

  async function removeAdmin(userId: string) {
    try {
      const { error } = await supabase
        .from('channel_admins')
        .delete()
        .match({ channel_id: channelId, user_id: userId });

      if (error) throw error;

      // Log activity
      await logActivity(userId, 'admin_removed', {});
      await fetchUsers(channelId!);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove admin'));
      throw err;
    }
  }

  async function bulkUpdatePermissions(userIds: string[], permissions: string[]) {
    try {
      const promises = userIds.map(userId =>
        supabase
          .from('channel_admins')
          .update({ permissions })
          .match({ channel_id: channelId, user_id: userId })
      );

      await Promise.all(promises);
      await fetchUsers(channelId!);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to bulk update permissions'));
      throw err;
    }
  }

  async function savePermissionTemplate(name: string, permissions: string[]) {
    try {
      const { error } = await supabase
        .from('permission_templates')
        .insert({ name, permissions });

      if (error) throw error;
      await fetchTemplates();
    } catch (err) {
      console.error('Error saving template:', err);
      throw err;
    }
  }

  async function logActivity(userId: string, action: string, details: any) {
    try {
      await supabase
        .from('user_activity_logs')
        .insert({
          user_id: userId,
          channel_id: channelId,
          action,
          details
        });
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  }

  function calculateEngagementRate(interactions: any[]): number {
    if (interactions.length === 0) return 0;
    const totalInteractions = interactions.length;
    const uniqueDays = new Set(
      interactions.map(i => new Date(i.created_at).toDateString())
    ).size;
    return (totalInteractions / uniqueDays) * 100;
  }

  return {
    users,
    templates,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    getUserStats,
    addAdmin,
    updatePermissions,
    removeAdmin,
    bulkUpdatePermissions,
    savePermissionTemplate
  };
}