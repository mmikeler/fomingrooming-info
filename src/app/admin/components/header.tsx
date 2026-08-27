"use client";

import UserAuthWidget from "@/app/components/ui/user-auth-widget";

export default function Header() {
  return (
    <div className="my-3 flex justify-end">
      <UserAuthWidget />
    </div>
  );
}
