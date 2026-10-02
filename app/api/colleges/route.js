import { all } from "@/lib/db";
import { handler, json } from "@/lib/http";

// Public: used by the registration form.
export const GET = handler(async () => {
  return json({ colleges: all("SELECT id, name, domain FROM colleges WHERE is_active = 1 ORDER BY name") });
});
