"use server";

import { signUp } from "@/lib/actions";

export async function handleSignUp(formData: FormData) {
  const res = await signUp(formData);
  return res;
}
