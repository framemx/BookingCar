export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie<string | null>("token").value

  // ถ้ามี token แล้ว → ไม่ให้เข้า login, register
  if (token && (to.path === "/login" || to.path === "/register")) {
    return navigateTo("/")
  }

  // ไม่มี token → ปล่อยให้เข้า login, register, home ได้
  return 
})
