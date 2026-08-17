'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="h-9 w-24 animate-pulse rounded-md bg-line" />;
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="rounded-md border border-ink px-4 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-paper"
      >
        Sign in with Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {session.user?.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={session.user.image}
          alt=""
          className="h-8 w-8 rounded-full border border-line"
        />
      )}
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-ink">{session.user?.name}</p>
        <p className="text-xs text-ink/50">{session.user?.email}</p>
      </div>
      <button
        onClick={() => signOut()}
        className="rounded-md border border-line px-3 py-2 text-xs font-medium text-ink/70 transition hover:border-ink hover:text-ink"
      >
        Sign out
      </button>
    </div>
  );
}
