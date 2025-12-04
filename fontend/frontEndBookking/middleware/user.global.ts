export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie("token").value

  if (!token && to.path.startsWith("/user")) {
    return navigateTo("/")
  }
})
