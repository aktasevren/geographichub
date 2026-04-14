import type { Metadata } from "next";
import { loadWarIndex } from "@/lib/wars";
import WarsIndexClient from "./WarsIndexClient";

export const metadata: Metadata = {
  title: "Savaş Haritası — War Map",
  description:
    "Bir savaş seç ve her önemli muharebeyi, antlaşmayı ve dönüm noktasını tarihî bir harita üzerinde gör. Tarihleri ve hikâyeleriyle.",
  alternates: { canonical: "/maps/wars" },
};

export default function WarsIndex() {
  const wars = loadWarIndex();
  return <WarsIndexClient wars={wars} />;
}
