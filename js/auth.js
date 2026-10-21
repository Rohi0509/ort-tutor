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
      /BAD_CODE/.test(m) ? "badCode" :
      /NOT_ADMIN/.test(m) ? "notAdmin" :
      /COUNT:/.test(m) ? "count" :
      /DATE:/.test(m) ? "date" :
      /row-level security|violates row-level/i.test(m) ? "noAccess" :
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

  // Students give an access code, parents their child's link code. A refused code comes back from Supabase as a
  // generic "Database error saving new user", so the role says which code was wrong.
  C.signUp = async ({ email, password, role, nickname, code }) => {
    const res = await sb.auth.signUp({
      email, password,
      options: { data: { role, nickname: role === "student" ? nickname : null, code }, emailRedirectTo: here() }
    });
    if (res.error && /Database error saving new user/i.test(res.error.message || "")) throw fail(role === "parent" ? "noChildSignup" : code ? "badCode" : "generic");
    const data = must(res);
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
      const p = must(await sb.from("profiles").select("id, role, nickname, link_code, access_until, is_admin").eq("id", user.id).maybeSingle());
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
  // Before each save the copy in the cloud is read and combined with this one (C.merge, set by app.js), so a
  // phone and a laptop used in turn never wipe out each other's progress. C.onSaved gets the combined copy.
  let pending = null, timer = null, inflight = null;
  C.merge = null; C.onSaved = null;
  C.queueSave = state => {
    pending = state; C.status = "waiting";
    clearTimeout(timer); timer = setTimeout(C.flush, 1500);
  };
  async function save(data) {
    if (C.merge) {
      const { data: row, error } = await sb.from("progress").select("data").eq("user_id", C.user.id).maybeSingle();
      if (error) return { error };
      if (row && row.data) data = C.merge(data, row.data);
    }
    const { error } = await sb.from("progress").upsert({ user_id: C.user.id, data, updated_at: new Date().toISOString() });
    return { error, data };
  }
  C.flush = async () => {
    if (inflight) await inflight;
    if (!pending || !C.user) return;
    const data = JSON.parse(JSON.stringify(pending));
    pending = null; clearTimeout(timer);
    inflight = save(data);
    const res = await inflight;
    inflight = null;
    if (res.error) {
      if (!pending) pending = data;
      // No access (expired) is not fixed by retrying; everything else is treated as being offline.
      C.status = friendly(res.error).code === "noAccess" ? "noAccess" : "offline";
      if (C.status === "offline") timer = setTimeout(C.flush, 30000);
    } else {
      C.status = pending ? "waiting" : "saved";
      if (C.onSaved) C.onSaved(res.data);
    }
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
    const profiles = must(await sb.from("profiles").select("id, nickname, access_until").in("id", ids));
    // Progress comes back only for children with full access (the database decides; see schema.sql).
    const progress = must(await sb.from("progress").select("user_id, data").in("user_id", ids));
    const byUser = Object.fromEntries(progress.map(p => [p.user_id, p.data]));
    return profiles.map(p => ({ id: p.id, nickname: p.nickname, access_until: p.access_until, data: byUser[p.id] || null }))
      .sort((a, b) => a.nickname.localeCompare(b.nickname));
  };
  // Students: how many parent accounts can see my progress.
  C.parentCount = async () => must(await sb.from("parent_links").select("parent_id").eq("student_id", C.user.id)).length;
  // Students: add an access code. Returns the new end date (ISO string).
  C.redeem = async code => {
    const ends = must(await sb.rpc("redeem_code", { code }));
    try {
      const p = JSON.parse(localStorage.getItem(PROFILE_CACHE + C.user.id) || "null");
      if (p) localStorage.setItem(PROFILE_CACHE + C.user.id, JSON.stringify({ ...p, access_until: ends }));
    } catch (e) {}
    return ends;
  };

  /* ---------- paid practice (levels 2-3) ---------- */
  // The database returns rows only to students with full access (and admins); everyone else gets empty lists.
  C.loadPaid = async lang => ({
    questions: must(await sb.from("questions").select("id, topic_id, level, lang, position, data").eq("lang", lang).order("position")),
    passages: must(await sb.from("passages").select("id, data").eq("lang", lang))
  });

  /* ---------- admins ---------- */
  C.importPaid = async bundle => must(await sb.rpc("import_questions", { payload: bundle }));
  C.questionCounts = async () => must(await sb.rpc("question_counts"));
  C.createCodes = async (count, batch, until, uses) =>
    must(await sb.rpc("create_codes", { how_many: count, batch_name: batch, valid_until: until, uses }));
  C.batches = async () => must(await sb.rpc("code_batches"));
  C.batchCodes = async batch => must(await sb.rpc("batch_codes", { batch_name: batch }));
  C.adminStats = async () => (must(await sb.rpc("admin_stats")) || [])[0] || null;

  return C;
})();
