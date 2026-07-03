import { SupabaseClient } from '@supabase/supabase-js'

export async function sendNotification(supabase: SupabaseClient, recipient_id: string, actor_id: string | null, type: string, payload: Record<string, any>) {
  try {
    await supabase.from('notifications').insert([{ recipient_id, actor_id, type, payload }])
    // Для realtime — можно использовать канал Realtime или RLS + client подписку на таблицу notifications
  } catch (e) {
    console.error('sendNotification error', e)
  }
}

export default { sendNotification }
