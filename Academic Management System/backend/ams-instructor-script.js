window.onload = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    window.location.replace("index.html");
    return;
  }
  const user = JSON.parse(userStr);
  if (user.role !== "Instructor") {
    window.location.replace("index.html");
  }
  document.getElementById("userName").textContent = user.name;
};
function handleLogout() {
  localStorage.clear();
  window.location.replace("index.html");
}
