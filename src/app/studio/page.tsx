import { redirect } from "next/navigation";

// Bare /studio used to 404 — people type it, links get truncated.
// The real Studio lives at /dashboard/studio (auth-gated there).
export default function StudioRedirect() {
  redirect("/dashboard/studio");
}
