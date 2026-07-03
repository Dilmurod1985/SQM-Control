import { useEffect } from 'react'
import { getSupabaseClient } from '../lib/supabaseClient'

// Hook для подписки на таблицы notifications, ccp_monitoring и non_conformities
export function useRealtime(onEvent: (payload: any) => void) {
  useEffect(() => {
    const supabase = getSupabaseClient()
    const channels: any[] = []

    const notifSub = supabase.channel('public:notifications').on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => onEvent({ type: 'notification', payload })).subscribe()
    channels.push(notifSub)

    const ccpSub = supabase.channel('public:ccp').on('postgres_changes', { event: '*', schema: 'public', table: 'ccp_monitoring' }, (payload) => onEvent({ type: 'ccp', payload })).subscribe()
    channels.push(ccpSub)

    const ncSub = supabase.channel('public:nc').on('postgres_changes', { event: '*', schema: 'public', table: 'non_conformities' }, (payload) => onEvent({ type: 'nc', payload })).subscribe()
    channels.push(ncSub)

    return () => {
      channels.forEach((c) => c.unsubscribe())
    }
  }, [onEvent])
}
