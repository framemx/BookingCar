export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('token').value;

  if (!token && to.path.startsWith('/admin')) {
    return navigateTo('/login');
  }
});
