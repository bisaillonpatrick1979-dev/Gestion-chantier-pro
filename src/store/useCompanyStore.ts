setCompany: (updates) => {
  set(state => ({ company: { ...state.company, ...updates } }))
  syncCompanyToSupabase(get().company)
},
