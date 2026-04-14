// User media gallery page

import { authOptions } from "@/lib/auth";
import UserMediaGallery from "./components/gallery";
import { getServerSession } from "next-auth";

export default async function Page() {
  // Check if user is logged in
  const session = await getServerSession(authOptions);

  if (!session) {
    return "У вас нет доступа в этот раздел";
  }

  return <UserMediaGallery />;
}
