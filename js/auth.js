/* Accounts and online progress (Supabase), ported from GCSE Tutor. Students save progress to their account;
   parents read the progress of children they linked with a link code. Only email, nickname and progress are stored.
   Without vendor/supabase.js or config values the app runs on this device only, as before.
   Errors carry a .code that app.js turns into text in the current language (UI[lang].err). */
const Cloud = (() => {
  const cfg = window.APP_CONFIG || {};
  const loc = typeof location === "object" && location ? location : { protocol: "file:", hostname: "", search: "", hash: "" };
  // Testing on your own computer: add ?nologin to the address to run without accounts. Ignored on the hosted site.
  const onThisComputer = loc.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(loc.hostname);
  const testMode = onThisComputer && /nologin/.test(loc.search + loc.hash);
  const set = v => typeof v === "string" && v.length > 0;
  const enabled = !testMode && !!(window.supabase && set(cfg.SUPABASE_URL) && set(cfg.SUPABASE_ANON_KEY));
  const sb = enabled
    ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
    : null;

  const C = { enabled, testMode, onThisComputer, user: null, status: "idle" }; // status: idle | waiting | saved | offline
  const PROFILE_CACHE = "ort-tutor-me:";  // lets a logged-in student open the app offline

  // Email links (password reset, confirm email) come back to this page; file:// can't receive them.
  const here = () => (/^https?:$/.test(loc.protocol) ? loc.origin + loc.pathname : undefined);

  function friendly(error) {
    const m = String((error && (error.message || error.error_description)) || error || "");
    const code =
      /Failed to fetch|NetworkError|Load failed/i.test(m) ? "offline" :
      /Invalid login credentials/i.test(m) ? "badLogin" :
      /already registered|already been registered|already exists/i.test(m) ? "exists" :
      /Database error saving new user|GROUP_CODE/i.test(m) ? "groupCode" :
      /Email not confirmed/i.test(m) ? "notConfirmed" :
      /rate limit|too many/i.test(m) ? "rateLimit" :
      /Password should be|weak password/i.test(m) ? "weakPw" :
      /valid email|invalid format|Unable to validate email/i.test(m) ? "badEmail" :
      /NO_CHILD/.test(m) ? "noChild" :
      /NOT_PARENT/.test(m) ? "notParent" :
      /same.*password|different from the old/i.test(m) ? "samePw" : "generic";
    const e = new Error(m || "Something went wrong");
    e.code = code;
    return e;
  }
  const must = ({ data, error }) => { if (error) throw friendly(error); return data; };
  const fail = code => { const e = new Error(code); e.code = code; return e; };

  // onChange(event, session) runs after supabase finishes its own work (calling supabase inside its callback can stall).
  C.start = onChange => sb.auth.onAuthStateChange((event, session) => {
    C.user = session ? session.user : null;
    setTimeout(() => onChange(event, session), 0);
  });

  C.signUp = async ({ email, password, role, nickname, joinCode }) => {
    const data = must(await sb.auth.signUp({
      email, password,
      options: { data: { role, nickname: role === "student" ? nickname : null, join_code: joinCode }, emailRedirectTo: here() }
    }));
    return { needsConfirm: !data.session };
  };
  C.signIn = async (email, password) => { must(await sb.auth.signInWithPassword({ email, password })); };
  C.signOut = async () => {
    await C.flush();
    await sb.auth.signOut({ scope: "local" }); // this device only, works offline
  };
  C.resetPassword = async email => { must(await sb.auth.resetPasswordForEmail(email, { redirectTo: here() })); };
  C.updatePassword = async password => { must(await sb.auth.updateUser({ password })); };

  /* ---------- profile ---------- */
  C.loadProfile = async user => {
    try {
      const p = must(await sb.from("profiles").select("id, role, nickname, link_code").eq("id", user.id).maybeSingle());
      if (!p) throw fail("profile");
      try { localStorage.setItem(PROFILE_CACHE + user.id, JSON.stringify(p)); } catch (e) {}
      return p;
    } catch (err) {
      let cached = null;
      try { cached = JSON.parse(localStorage.getItem(PROFILE_CACHE + user.id) || "null"); } catch (e) {}
      if (cached) return cached;
      throw err;
    }
  };
  C.setNickname = async nickname => {
    must(await sb.from("profiles").update({ nickname }).eq("id", C.user.id));
    try {
      const p = JSON.parse(localStorage.getItem(PROFILE_CACHE + C.user.id) || "null");
      if (p) localStorage.setItem(PROFILE_CACHE + C.user.id, JSON.stringify({ ...p, nickname }));
    } catch (e) {}
  };

  /* ---------- student progress ---------- */
  C.loadProgress = async () => {
    const row = must(await sb.from("progress").select("data").eq("user_id", C.user.id).maybeSingle());
    return row ? row.data : null;
  };
  // Saves are batched: the latest state is sent a moment after the last change, and retried when back online.
  let pending = null, timer = null, inflight = null;
  C.queueSave = state => {
    pending = state; C.status = "waiting";
    clearTimeout(timer); timer = setTimeout(C.flush, 1500);
  };
  C.flush = async () => {
    if (inflight) await inflight;
    if (!pending || !C.user) return;
    const data = JSON.parse(JSON.stringify(pending));
    pending = null; clearTimeout(timer);
    inflight = sb.from("progress").upsert({ user_id: C.user.id, data, updated_at: new Date().toISOString() });
    const { error } = await inflight;
    inflight = null;
    if (error) {
      if (!pending) pending = data;
      C.status = "offline";
      timer = setTimeout(C.flush, 30000);
    } else C.status = pending ? "waiting" : "saved";
  };
  if (enabled) {
    window.addEventListener("online", () => C.flush());
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") C.flush(); });
  }

  /* ---------- parents ---------- */
  C.linkChild = async code => must(await sb.rpc("link_child", { code }));
  C.unlinkChild = async studentId => { must(await sb.from("parent_links").delete().eq("parent_id", C.user.id).eq("student_id", studentId)); };
  C.children = async () => {
    const links = must(await sb.from("parent_links").select("student_id").eq("parent_id", C.user.id));
    const ids = links.map(l => l.student_id);
    if (!ids.length) return [];
    const profiles = must(await sb.from("profiles").select("id, nickname").in("id", ids));
    const progress = must(await sb.from("progress").select("user_id, data").in("user_id", ids));
    const byUser = Object.fromEntries(progress.map(p => [p.user_id, p.data]));
    return profiles.map(p => ({ id: p.id, nickname: p.nickname, data: byUser[p.id] || null }))
      .sort((a, b) => a.nickname.localeCompare(b.nickname));
  };
  // Students: how many parent accounts can see my progress.
  C.parentCount = async () => must(await sb.from("parent_links").select("parent_id").eq("student_id", C.user.id)).length;

  return C;
})();
