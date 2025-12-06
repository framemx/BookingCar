export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie("token").value
  const role = (useCookie("role").value || "").toLowerCase()

  const publicPages = ["/", "/login", "/register"]
  if (publicPages.includes(to.path)) return

  if (!token) return navigateTo("/")

  if (to.path.startsWith("/user")) {
    if (role !== "user") return navigateTo("/")
  }
})
