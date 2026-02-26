const API_URL = "http://localhost:3000/auth";
let isLogin = true;

document.getElementById("toggleAuth").addEventListener("click", () => {
  isLogin = !isLogin;
  document.getElementById("loginForm").classList.toggle("hidden");
  document.getElementById("registerForm").classList.toggle("hidden");
  document.getElementById("authTitle").textContent = isLogin
    ? "Sign In"
    : "Create Account";
  document.getElementById("toggleAuth").textContent = isLogin
    ? "Don't have an account? Register"
    : "Already have an account? Login";
});

// Redirect logic based on Role
function redirectByUserRole(role) {
  const roleRoutes = {
    Student: "ams-student.html",
    Instructor: "ams-instructor.html",
    Registrar: "ams-registrar.html",
    Admin: "ams-admin.html",
  };

  // Default fallback if role is unknown
  const destination = roleRoutes[role] || "index.html";
  window.location.href = destination;
}

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      firstname: document.getElementById("regFirst").value,
      middlename: document.getElementById("regMiddle").value,
      lastname: document.getElementById("regLast").value,
      email: document.getElementById("regEmail").value,
      password: document.getElementById("regPass").value,
      role: document.getElementById("regRole").value,
    };

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        alert("Success! You can now login.");
        document.getElementById("toggleAuth").click();
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Connection error. Is the server running?");
    }
  });

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPass").value,
      }),
    });
    const data = await res.json();
    if (data.success) {
      // Store credentials
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      redirectByUserRole(data.user.role);
    } else {
      alert(data.message || "Login failed");
    }
  } catch (err) {
    console.error(err);
    alert("Connection error. Is the server running?");
  }
});

// Auto-redirect if already logged in
window.onload = () => {
  const userJson = localStorage.getItem("user");
  if (userJson) {
    const user = JSON.parse(userJson);
    redirectByUserRole(user.role);
  }
};
