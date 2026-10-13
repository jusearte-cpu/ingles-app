"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "../login/actions";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOut();
          router.push("/login");
          router.refresh();
        })
      }
      className="rounded-md border border-black/20 px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
    >
      Cerrar sesión
    </button>
  );
}
