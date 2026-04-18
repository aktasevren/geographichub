import MockupClient from "./MockupClient";

// Dev-only route — excluded from search indexing.
export const metadata = { robots: "noindex, nofollow" };

export default function WarsNoirMockupPage() {
  return <MockupClient />;
}
