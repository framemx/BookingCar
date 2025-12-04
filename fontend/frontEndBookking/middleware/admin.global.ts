export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie("token").value
  const role = useCookie("role").value

  // ❗ ต้องเป็น admin เท่านั้นที่เข้า /admin ได้
  if (!token || role !== "admin") {
    return navigateTo("/")
  }
})
