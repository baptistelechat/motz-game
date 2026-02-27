import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // refreshing the auth token
  const { data: { user } } = await supabase.auth.getUser();

  // Admin Route Protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check role in public.players
    // Note: We use the same supabase client which has the user's auth context
    // But to read the 'role' field, we rely on the RLS policy for 'players' table
    // ensuring the user can read their own role.
    const { data: player, error } = await supabase
      .from('players')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !player || player.role !== 'admin') {
      console.warn(`Unauthorized access attempt to /admin by user ${user.id}`);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}
