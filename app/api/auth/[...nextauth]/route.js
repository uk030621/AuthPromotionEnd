import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Note on the async-params pattern: this file has a dynamic segment
// ([...nextauth]) but we never destructure `params` ourselves here -
// NextAuth(authOptions) receives and awaits it internally. Any route
// handler in this project that DOES destructure params directly (like
// app/api/cards/[id]/route.js) awaits it first, per Next.js 15+'s
// requirement that dynamic route params be treated as a Promise.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
