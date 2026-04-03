import { permanentRedirect } from "next/navigation";

export default function CreatorsPage() {
  permanentRedirect("/candidature-coachs?profil=createur");
}
