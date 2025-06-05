// src/lib/auth.ts

export async function authorizeUser(user: any) {
  const response = await fetch("https://mecjaydtuxkvwrvnsqqj.supabase.co/functions/v1/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lY2pheWR0dXhrdndydm5zcXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzUyOTUsImV4cCI6MjA2NDcxMTI5NX0.h95WbmbWgExW_E_FUiK8S0tHTBOOBarDQdEDOfmDLJU"
    },
    body: JSON.stringify({ user })
  });

  if (!response.ok) {
    console.error("Ошибка запроса:", await response.text());
    throw new Error("Не удалось авторизовать пользователя");
  }

  const data = await response.json();
  return data;
}
