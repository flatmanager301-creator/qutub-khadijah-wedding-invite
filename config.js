/*
  Optional Supabase connection for guest photo uploads and RSVP logging.
  The invitation, personalization and WhatsApp RSVP work without Supabase.
  Add your values and set enableSupabase to true to enable uploads.
*/
window.WEDDING_CONFIG = {
  enableSupabase: false,
  supabaseUrl: "",
  supabaseAnonKey: "",
  uploadBucket: "wedding-photos"
};
