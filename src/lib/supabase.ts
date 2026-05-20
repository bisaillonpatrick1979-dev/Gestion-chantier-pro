export async function syncClientsToSupabase(clients: any[]) {
  console.log('🔄 syncClientsToSupabase called:', clients.length, 'clients')
  if (!clients.length) {
    console.log('⚠️ syncClientsToSupabase: empty array, skipping')
    return
  }
  const rows = clients.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone ?? '',
    email: c.email ?? '',
    address: c.address ?? '',
    city: c.city ?? '',
    province: c.province ?? 'AB',
    postal_code: c.postalCode ?? '',
    notes: c.notes ?? '',
    updated_at: new Date().toISOString(),
  }))
  console.log('📤 Upserting rows:', JSON.stringify(rows))
  const { data, error } = await supabase
    .from('clients')
    .upsert(rows, { onConflict: 'id' })
    .select()
  if (error) {
    console.error('❌ Sync clients error:', JSON.stringify(error))
  } else {
    console.log('✅ Sync clients success:', data)
  }
}
