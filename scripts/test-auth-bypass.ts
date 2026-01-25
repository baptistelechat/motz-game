import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase config");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testAuth() {
  const email = `test-auth-${Date.now()}@example.com`;
  const password = `Pass-${Date.now()}`;

  console.log(`Testing admin.createUser with ${email}...`);

  // 1. Try creating user
  const { data: user, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError) {
    console.error("admin.createUser failed:", createError);
  } else {
    console.log("admin.createUser success:", user.user.id);

    // 2. Try signing in with password
    console.log("Testing signInWithPassword...");
    const { error: signinError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signinError) {
      console.error("signInWithPassword failed:", signinError);

      // 3. Try Magic Link
      console.log("Testing admin.generateLink (magiclink)...");
      const { data: linkData, error: linkError } =
        await supabase.auth.admin.generateLink({
          type: "magiclink",
          email,
        });

      if (linkError) {
        console.error("admin.generateLink failed:", linkError);
      } else {
        console.log("admin.generateLink success");
        console.log("Link Data:", JSON.stringify(linkData, null, 2));
        const { action_link } = linkData.properties;

        // Extract token
        const token = new URL(action_link).searchParams.get("token");
        const { email_otp } = linkData.properties;

        if (email_otp) {
          console.log(
            `Testing verifyOtp with email_otp: ${email_otp} and type: email...`,
          );
          const { error: otpError } = await supabase.auth.verifyOtp({
            token: email_otp,
            type: "email",
            email,
          });

          if (otpError) {
            console.error("verifyOtp (numeric) failed:", otpError);
          } else {
            console.log("verifyOtp (numeric) success! Session obtained.");
            await supabase.auth.admin.deleteUser(user.user.id);
            return;
          }
        }

        if (token) {
          console.log("Testing verifyOtp with type: magiclink...");
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token,
            type: "magiclink",
            email,
          });

          if (verifyError) {
            console.error("verifyOtp (magiclink) failed:", verifyError);

            // Retry with type: email?
            console.log("Retrying verifyOtp with type: email...");
            const { error: verifyError2 } = await supabase.auth.verifyOtp({
              token,
              type: "email",
              email,
            });

            if (verifyError2) {
              console.error("verifyOtp (email) failed:", verifyError2);
            } else {
              console.log("verifyOtp (email) success!");
              await supabase.auth.admin.deleteUser(user.user.id);
              return;
            }
          } else {
            console.log("verifyOtp (magiclink) success! Session obtained.");
            await supabase.auth.admin.deleteUser(user.user.id);
            return;
          }
        }
      }

      // Clean up
      await supabase.auth.admin.deleteUser(user.user.id);
    } else {
      console.log("signInWithPassword success! Session obtained.");
      // Clean up
      await supabase.auth.admin.deleteUser(user.user.id);
      return;
    }
  }

  // 3. If password failed, try Magic Link
  console.log("Testing admin.generateLink (magiclink)...");
  // Need to recreate user if step 1 failed? No, if step 1 failed, we can't do this.
  // But maybe step 1 failed because of email provider disabled?
  // If step 1 failed, we are stuck unless Anon works.

  // Let's try Anon just to see the error
  console.log("Testing signInAnonymously...");
  const { error: anonError } = await supabase.auth.signInAnonymously();
  if (anonError) {
    console.error("signInAnonymously failed:", anonError);
  } else {
    console.log("signInAnonymously success!");
  }
}

testAuth();
