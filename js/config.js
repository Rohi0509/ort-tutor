/* Supabase connection for logins and online progress.
   Both values are public by design (the database rules protect the data), so they are safe in this file.
   NEVER put the service_role / secret key here. Empty values = the app runs on this device only, without accounts. */
window.APP_CONFIG = {
  SUPABASE_URL: "https://rojednvhqyejlapqkbpj.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_r3qUXljrRsPwYlkgothJng_EDN5evBz"
};
