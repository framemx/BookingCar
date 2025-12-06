export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie("token").value
  const role = useCookie("role").value

  // ปล่อยให้เข้าหน้า public ได้
  if (to.path === "/" || to.path === "/login" || to.path === "/register") return

  // admin pages เท่านั้น
  if (to.path.startsWith("/admin")) {
    if (!token || role !== "admin") {
      return navigateTo("/")
    }
  }
})
