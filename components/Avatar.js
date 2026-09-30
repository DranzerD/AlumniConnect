import { initials } from "@/lib/format";

const SIZES = { sm: 28, md: 36, lg: 64 };
const FONT = { sm: "var(--text-xs)", md: "var(--text-sm)", lg: "var(--text-xl)" };

export default function Avatar({ name, size = "md" }) {
  return (
    <span className="avatar" style={{ width: SIZES[size], height: SIZES[size], fontSize: FONT[size] }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
