import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return { user, supabase };
}