import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://nsxeveoscpbioayrvlxi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zeGV2ZW9zY3BiaW9heXJ2bHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjMzOTgsImV4cCI6MjA5NDc5OTM5OH0.v064Bp2HHah4O6bZ5V4WcCV2yD-xsXoerNLJt7hlVeA'
)
