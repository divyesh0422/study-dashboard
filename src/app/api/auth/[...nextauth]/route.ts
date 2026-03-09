// src/app/api/auth/[...nextauth]/route.ts
export const runtime = "nodejs" // 👈 add this line

import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers