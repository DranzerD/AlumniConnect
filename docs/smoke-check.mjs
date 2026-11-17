// End-to-end smoke and probe checks for AlumniConnect (documentation artifact, not a test suite).
// Run against a FRESH demo database, because the checks mutate data:
//   1. build:  NEXT_DIST_DIR=.next-check npx next build
//   2. serve:  NEXT_DIST_DIR=.next-check DATABASE_PATH=/tmp/ac-check.db JWT_SECRET=<32+ chars> npx next start -p 3457
//   3. run:    node docs/smoke-check.mjs        (BASE_URL overrides http://localhost:3457)
// Lines marked PROBE assert the behaviour a careful design would want; a FAIL there documents a known gap.
const BASE = process.env.BASE_URL || "http://localhost:3457";
const PW = "Password123!";
let pass = 0, fail = 0;
const results = [];
function check(name, cond, extra = "") {
  (cond ? pass++ : fail++);
  results.push(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  -- " + extra : ""}`);
}
async function req(path, { method = "GET", body, cookie, headers = {} } = {}) {
  const res = await fetch(BASE + path, {
    method, redirect: "manual",
    headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null; try { data = await res.json(); } catch {}
  const set = res.headers.get("set-cookie");
  return { status: res.status, data, set, headers: res.headers };
}
async function login(email, extraHeaders = {}) {
  const r = await req("/api/auth/login", { method: "POST", body: { email, password: PW }, headers: extraHeaders });
  const m = r.set && r.set.match(/ac_session=([^;]+)/);
  return { ...r, cookie: m ? `ac_session=${m[1]}` : null };
}

// wait for server
for (let i = 0; i < 60; i++) { try { await fetch(BASE + "/login"); break; } catch { await new Promise(r => setTimeout(r, 1000)); } }

// 1. auth basics
let r = await req("/api/profiles");
check("unauthenticated API -> 401 from middleware", r.status === 401);
r = await req("/dashboard");
check("unauthenticated page -> redirect to /login?next=", r.status === 307 && r.headers.get("location").includes("/login?next=%2Fdashboard"), r.headers.get("location"));
r = await req("/login");
check("security headers present", r.headers.get("x-frame-options") === "DENY" && r.headers.get("x-content-type-options") === "nosniff");
check("no Content-Security-Policy header", !r.headers.get("content-security-policy"));

const emily = await login("emily.davis@northwood.edu");
check("demo login sets cookie", emily.status === 200 && !!emily.cookie);
check("cookie flags httpOnly + SameSite=lax", /HttpOnly/i.test(emily.set) && /SameSite=lax/i.test(emily.set), emily.set.replace(/ac_session=[^;]+/, "ac_session=<token>"));
r = await req("/api/auth/login", { method: "POST", body: { email: "emily.davis@northwood.edu", password: "wrong" } });
check("wrong password -> 401", r.status === 401);
r = await req("/api/auth/login", { method: "POST", body: { email: "nobody@northwood.edu", password: "wrong" } });
check("unknown email -> same 401 message", r.status === 401 && r.data.error === "Invalid email or password");
r = await fetch(BASE + "/api/auth/login", { method: "POST", body: "{bad" }).then(async x => ({ status: x.status, data: await x.json() }));
check("malformed JSON -> 400", r.status === 400);
r = await req("/api/auth/login", { method: "POST", body: { email: "x", password: "y" } });
check("invalid email -> 422 with details", r.status === 422 && r.data.details?.email);

// 2. tenant isolation
const lake = await req("/api/profiles?q=Daniel", { cookie: emily.cookie });
check("directory search scoped to own college", lake.status === 200 && lake.data.profiles.length === 0);
// find Daniel's id via lakeside login
const daniel = await login("daniel.brown@lakeside.edu");
const me = await req("/api/profiles/me", { cookie: daniel.cookie });
const danielId = me.data.profile.id;
r = await req(`/api/profiles/${danielId}`, { cookie: emily.cookie });
check("cross-college profile -> 404 (not 403)", r.status === 404);
r = await req("/api/connections", { method: "POST", body: { user_id: danielId }, cookie: emily.cookie });
check("cross-college connect -> 404", r.status === 404);
r = await req(`/api/messages/${danielId}`, { cookie: emily.cookie });
check("cross-college thread -> 404", r.status === 404);

// 3. role gates
r = await req("/api/admin/users", { cookie: emily.cookie });
check("student -> /api/admin 403", r.status === 403);
r = await req("/dashboard/admin", { cookie: emily.cookie });
check("student -> /dashboard/admin redirected to /dashboard", [303, 307].includes(r.status) && /\/dashboard$/.test(r.headers.get("location") || ""), `${r.status} ${r.headers.get("location")}`);
r = await req("/api/platform/colleges", { cookie: emily.cookie });
check("student -> /api/platform 403", r.status === 403);
r = await req("/api/jobs", { method: "POST", cookie: emily.cookie, body: { title: "x" } });
check("student cannot post jobs -> 403", r.status === 403);
const platform = await login("platform@alumniconnect.dev");
check("platform admin redirect target", platform.data.redirect === "/dashboard/platform");
r = await req("/api/profiles", { cookie: platform.cookie });
check("platform admin blocked from college API -> 403", r.status === 403);

// 4. events capacity
const ev = await req("/api/events?when=upcoming", { cookie: emily.cookie });
const fair = ev.data.events.find(e => e.title === "Campus Career Fair");
check("seeded career fair is full (3/3)", fair && fair.rsvp_count === 3 && fair.capacity === 3);
r = await req(`/api/events/${fair.id}/rsvp`, { method: "POST", cookie: emily.cookie });
check("RSVP to full event -> 409", r.status === 409 && /full/.test(r.data.error));
const ws = ev.data.events.find(e => e.title === "System Design Interview Workshop");
r = await req(`/api/events/${ws.id}/rsvp`, { method: "POST", cookie: emily.cookie });
check("double RSVP -> 409", r.status === 409);
// concurrency: create event with capacity 1 as sarah, fire RSVPs from several users at once
const sarah = await login("sarah.johnson@northwood.edu");
const future = new Date(Date.now() + 7 * 864e5).toISOString();
r = await req("/api/events", { method: "POST", cookie: sarah.cookie, body: { title: "Tiny room", description: "Only one seat in here.", event_type: "workshop", starts_at: future, location: "Room 1", capacity: 1 } });
check("alumni creates event -> 201", r.status === 201);
const tinyId = r.data.event.id;
const racers = await Promise.all(["michael.chen@northwood.edu", "priya.patel@northwood.edu", "maria.garcia@northwood.edu", "alex.martinez@northwood.edu", "sophia.lee@northwood.edu"].map(e => login(e)));
const rs = await Promise.all(racers.map(u => req(`/api/events/${tinyId}/rsvp`, { method: "POST", cookie: u.cookie })));
const ok = rs.filter(x => x.status === 201).length, full = rs.filter(x => x.status === 409).length;
check("5 concurrent RSVPs to capacity-1 event: exactly 1 succeeds", ok === 1 && full === 4, `201=${ok} 409=${full}`);

// 5. mentorship state machine
const mt = await req("/api/mentorship", { cookie: sarah.cookie });
const pend = mt.data.incoming.find(x => x.status === "pending");
r = await req(`/api/mentorship/${pend.id}`, { method: "PATCH", cookie: sarah.cookie, body: { action: "complete" } });
check("complete a pending request -> 409", r.status === 409);
r = await req(`/api/mentorship/${pend.id}`, { method: "PATCH", cookie: sarah.cookie, body: { action: "cancel" } });
check("mentor tries mentee-only cancel -> 403", r.status === 403);

// 6. mutual connection request auto-accept: priya -> emily pending; emily POSTs to priya
const dir = await req("/api/profiles?q=Priya", { cookie: emily.cookie });
const priyaId = dir.data.profiles[0].id;
check("directory shows pending_received for Priya", dir.data.profiles[0].connection_status === "pending_received");
r = await req("/api/connections", { method: "POST", cookie: emily.cookie, body: { user_id: priyaId } });
check("connect to someone who requested you -> accepted", r.status === 201 && r.data.connection.status === "accepted");

// 7. messaging only between connections
const dirR = await req("/api/profiles?q=Ryan", { cookie: emily.cookie });
const ryanId = dirR.data.profiles[0].id;
r = await req(`/api/messages/${ryanId}`, { method: "POST", cookie: emily.cookie, body: { body: "hi" } });
check("message a non-connection -> 403", r.status === 403);

// 8. LIKE wildcard escaping
r = await req("/api/profiles?q=%25", { cookie: emily.cookie });
check("search '%' treated literally (0 results)", r.status === 200 && r.data.pagination.total === 0, `total=${r.data.pagination.total}`);

// 9. deactivation revokes live sessions
const admin = await login("admin@northwood.edu");
const alexDir = await req("/api/profiles?q=Alex", { cookie: emily.cookie });
const alexId = alexDir.data.profiles[0].id;
const alex = racers[3];
r = await req("/api/summary", { cookie: alex.cookie });
check("alex token works before deactivation", r.status === 200);
r = await req(`/api/admin/users/${alexId}`, { method: "PATCH", cookie: admin.cookie, body: { is_active: false } });
check("admin deactivates user -> 200", r.status === 200);
r = await req("/api/summary", { cookie: alex.cookie });
check("deactivated user's existing JWT -> 401 on next API call", r.status === 401);

// 10. badge vs list mismatch: alex had a pending request to emily
const sum = await req("/api/summary", { cookie: emily.cookie });
const conns = await req("/api/connections", { cookie: emily.cookie });
check("summary pending-connection badge excludes deactivated requesters (fixed bug)",
  sum.data.connections === conns.data.incoming.length,
  `summary.connections=${sum.data.connections} incoming.length=${conns.data.incoming.length}`);

// 11. stale JWT role after promotion
const sophiaDir = await req("/api/profiles?q=Sophia", { cookie: emily.cookie });
const sophiaId = sophiaDir.data.profiles[0].id;
const sophia = racers[4];
r = await req(`/api/admin/users/${sophiaId}`, { method: "PATCH", cookie: admin.cookie, body: { role: "admin" } });
check("admin promotes user to admin -> 200", r.status === 200 && r.data.user.role === "admin");
r = await req("/api/admin/users", { cookie: sophia.cookie });
check("promoted user with old JWT can reach /api/admin (fixed bug)", r.status === 200, `status=${r.status}`);
// demotion direction is safe: a JWT that still says "admin" is re-checked against the DB
const fresh = await login("sophia.lee@northwood.edu"); // JWT now carries role=admin
await req(`/api/admin/users/${sophiaId}`, { method: "PATCH", cookie: admin.cookie, body: { role: "student" } });
r = await req("/api/admin/users", { cookie: fresh.cookie });
check("demoted admin with admin-role JWT -> 403 from requireRole (DB re-check)", r.status === 403, `status=${r.status}`);

// 12. password change does not revoke other sessions
const m1 = racers[0];
r = await req("/api/auth/password", { method: "PUT", cookie: m1.cookie, body: { current_password: PW, new_password: "NewPassword9" } });
check("password change -> 200", r.status === 200);
r = await req("/api/summary", { cookie: m1.cookie });
check("PROBE: old session still valid after password change", r.status === 200, `status=${r.status}`);

// 13. rate limit + X-Forwarded-For
let last;
for (let i = 0; i < 11; i++) last = await req("/api/auth/login", { method: "POST", body: { email: "kevin.nguyen@northwood.edu", password: "bad" }, headers: { "x-forwarded-for": "10.0.0.1" } });
check("11th failed login in window -> 429", last.status === 429, last.data?.error);
r = await req("/api/auth/login", { method: "POST", body: { email: "kevin.nguyen@northwood.edu", password: "bad" }, headers: { "x-forwarded-for": "10.0.0.2" } });
check("PROBE: changing X-Forwarded-For resets the limit", r.status === 401, `status=${r.status}`);
// successful logins also count
r = await req("/api/auth/login", { method: "POST", body: { email: "kevin.nguyen@northwood.edu", password: PW }, headers: { "x-forwarded-for": "10.0.0.1" } });
check("correct password while limited -> still 429", r.status === 429);

// 14. college deactivation
const lakeAdmin = await login("admin@lakeside.edu");
const cols = await req("/api/platform/colleges", { cookie: platform.cookie });
const lakeside = cols.data.colleges.find(c => c.domain === "lakeside.edu");
r = await req(`/api/platform/colleges/${lakeside.id}`, { method: "PATCH", cookie: platform.cookie, body: { is_active: false } });
check("platform admin deactivates college", r.status === 200 && r.data.college.is_active === 0);
r = await req("/api/summary", { cookie: lakeAdmin.cookie });
check("member of deactivated college -> 401", r.status === 401);
r = await login("alice.chen@lakeside.edu");
check("login to deactivated college -> 403", r.status === 403);
r = await req("/api/colleges");
check("deactivated college hidden from sign-up list", !r.data.colleges.some(c => c.domain === "lakeside.edu"));

// 15. register domain check
const nw = r.data.colleges.find(c => c.domain === "northwood.edu");
r = await req("/api/auth/register", { method: "POST", body: { full_name: "Test User", email: "test@gmail.com", password: "abcdefg1", role: "student", college_id: nw.id, graduation_year: 2027 } });
check("register with wrong domain -> 422", r.status === 422 && r.data.details.email);
r = await req("/api/auth/register", { method: "POST", body: { full_name: "Test User", email: "test@northwood.edu", password: "abcdefg1", role: "faculty", college_id: nw.id, graduation_year: 2027 } });
check("self-register as faculty -> 422", r.status === 422);
r = await req("/api/auth/register", { method: "POST", body: { full_name: "Test User", email: "test@northwood.edu", password: "abcdefgh", role: "student", college_id: nw.id, graduation_year: 2027 } });
check("weak password (no digit) -> 422", r.status === 422);
r = await req("/api/auth/register", { method: "POST", body: { full_name: "Test User", email: "test@northwood.edu", password: "abcdefg1", role: "student", college_id: nw.id, graduation_year: 2027 } });
check("valid registration -> 201", r.status === 201);

// 16. profile URL validation blocks javascript:
r = await req("/api/profiles/me", { method: "PUT", cookie: emily.cookie, body: { linkedin_url: "javascript:alert(1)" } });
check("javascript: URL rejected -> 422", r.status === 422);

console.log(results.join("\n"));
console.log(`\nTOTAL ${pass + fail}  PASS ${pass}  FAIL ${fail}`);
