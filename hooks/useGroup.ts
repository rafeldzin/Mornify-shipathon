import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { storage } from './useStore';

export interface GroupMember {
  user_id: string;
  name: string;
  sleep_at: number | null;
  wake_at: number | null;
}

export function useGroup() {
  const [groupId, setGroupId] = useState<string | null>(() => storage.getString('group_id') || null);
  const [groupName, setGroupName] = useState<string | null>(() => storage.getString('group_name') || null);
  const [inviteCode, setInviteCode] = useState<string | null>(() => storage.getString('invite_code') || null);
  const [members, setMembers] = useState<GroupMember[]>(() => {
    const data = storage.getString('group_members');
    return data ? JSON.parse(data) : [];
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (data.user) setUserId(data.user.id);
      }
    };
    initAuth();
  }, []);

  const saveGroupLocally = (id: string, name: string, code: string, groupMembers: GroupMember[]) => {
    storage.set('group_id', id);
    storage.set('group_name', name);
    storage.set('invite_code', code);
    storage.set('group_members', JSON.stringify(groupMembers));
    setGroupId(id);
    setGroupName(name);
    setInviteCode(code);
    setMembers(groupMembers);
  };

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createGroup = async (name: string, userName: string) => {
    if (!userId) return false;
    const code = generateInviteCode();
    
    // Optimistic local save
    const initialMember = { user_id: userId, name: userName, sleep_at: null, wake_at: null };
    saveGroupLocally('temp-id', name, code, [initialMember]);

    // Backend sync
    const { data: group, error } = await supabase
      .from('groups')
      .insert({ name, invite_code: code, created_by: userId })
      .select()
      .single();

    if (group) {
      await supabase.from('profiles').upsert({ id: userId, display_name: userName });
      await supabase.from('memberships').insert({ user_id: userId, group_id: group.id });
      saveGroupLocally(group.id, group.name, group.invite_code, [initialMember]);
      return true;
    }
    return false;
  };

  const joinGroup = async (code: string, userName: string) => {
    if (!userId) return false;
    
    const { data: group } = await supabase
      .from('groups')
      .select('*')
      .eq('invite_code', code.toUpperCase())
      .single();

    if (group) {
      await supabase.from('profiles').upsert({ id: userId, display_name: userName });
      await supabase.from('memberships').insert({ user_id: userId, group_id: group.id });
      saveGroupLocally(group.id, group.name, group.invite_code, [{ user_id: userId, name: userName, sleep_at: null, wake_at: null }]);
      refreshGroup();
      return true;
    }
    return false;
  };

  const refreshGroup = async () => {
    if (!groupId || !userId) return;
    
    const { data: memberships } = await supabase
      .from('memberships')
      .select('user_id, profiles(display_name), sleep_logs(sleep_at, wake_at, created_at)')
      .eq('group_id', groupId)
      .order('created_at', { referencedTable: 'sleep_logs', ascending: false });

    if (memberships) {
      const parsedMembers = memberships.map((m: any) => ({
        user_id: m.user_id,
        name: m.profiles?.display_name || 'Unknown',
        sleep_at: m.sleep_logs?.[0]?.sleep_at ? new Date(m.sleep_logs[0].sleep_at).getTime() : null,
        wake_at: m.sleep_logs?.[0]?.wake_at ? new Date(m.sleep_logs[0].wake_at).getTime() : null,
      }));
      storage.set('group_members', JSON.stringify(parsedMembers));
      setMembers(parsedMembers);
    }
  };

  const syncLog = async (sleepAt: number | null, wakeAt: number | null) => {
    if (!userId) return;
    
    const logData = { user_id: userId, sleep_at: sleepAt ? new Date(sleepAt).toISOString() : null, wake_at: wakeAt ? new Date(wakeAt).toISOString() : null };
    
    const { error } = await supabase.from('sleep_logs').insert([logData]);
    if (error) {
      // Offline queue logic
      const queue = JSON.parse(storage.getString('sync_queue') || '[]');
      queue.push({ type: 'sleep_log', payload: logData, timestamp: Date.now() });
      storage.set('sync_queue', JSON.stringify(queue));
    }
  };

  const processQueue = async () => {
    const queue = JSON.parse(storage.getString('sync_queue') || '[]');
    if (queue.length === 0) return;
    
    const remaining = [];
    for (const item of queue) {
      if (item.type === 'sleep_log') {
        const { error } = await supabase.from('sleep_logs').insert([item.payload]);
        if (error) remaining.push(item);
      }
    }
    storage.set('sync_queue', JSON.stringify(remaining));
  };

  // Process queue on mount/network reconnect
  useEffect(() => {
    processQueue();
  }, [userId]);

  return {
    groupId,
    groupName,
    inviteCode,
    members,
    userId,
    createGroup,
    joinGroup,
    refreshGroup,
    syncLog,
  };
}
