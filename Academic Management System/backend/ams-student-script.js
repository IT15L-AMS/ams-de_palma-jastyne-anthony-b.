// Verification script
window.onload = () => {
  const userStr = localStorage.getItem("user");

  // Check if user exists in local storage
  if (!userStr) {
    window.location.replace("index.html");
    return;
  }

  try {
    const user = JSON.parse(userStr);

    // Security: Redirect if user is not a Student
    if (user.role !== "Student") {
      const roleRoutes = {
        Admin: "ams-admin.html",
        Instructor: "ams-instructor.html",
        Registrar: "ams-registrar.html",
      };
      const target = roleRoutes[user.role] || "index.html";
      window.location.replace(target);
    } else {
      // Populate Dashboard Data
      document.getElementById("userName").textContent = user.name || "Student";
      document.getElementById("firstName").textContent = (
        user.name || "Student"
      ).split(" ")[0];
    }
  } catch (e) {
    console.error("Auth Error:", e);
    localStorage.clear();
    window.location.replace("index.html");
  }
};

function handleLogout() {
  localStorage.clear();
  window.location.replace("index.html");
}
