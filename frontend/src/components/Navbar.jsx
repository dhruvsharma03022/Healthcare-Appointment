import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

// Routes where the navbar should not appear (auth flow pages)
const HIDDEN_ON = ["/", "/login", "/register", "/forgot-password"];

const LINKS_BY_ROLE = {
  PATIENT: [
    { to: "/patient", label: "Dashboard" },
    { to: "/doctors", label: "Find Doctors" },
    { to: "/my-appointments", label: "My Appointments" },
    { to: "/patient/prescriptions", label: "Prescriptions" },
    { to: "/patient/appointment-history", label: "History" },
  ],
  DOCTOR: [{ to: "/doctor", label: "Dashboard" }],
  ADMIN: [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/doctors", label: "Doctors" },
    { to: "/admin/patients", label: "Patients" },
    { to: "/admin/appointments", label: "Appointments" },
  ],
};

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser);
  const [menuOpen, setMenuOpen] = useState(false);

  // Keep in sync if another tab logs in/out, or after this tab's own login/logout
  useEffect(() => {
    setUser(getStoredUser());
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isHiddenRoute =
    HIDDEN_ON.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password");

  if (isHiddenRoute || !user) return null;

  const links = LINKS_BY_ROLE[user.role] || [];
  const homePath =
    user.role === "ADMIN" ? "/admin" : user.role === "DOCTOR" ? "/doctor" : "/patient";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to={homePath} className="navbar-brand">
          <span className="navbar-brand-mark" aria-hidden="true" />
          Healthcare Manager
        </NavLink>

        <nav className={`navbar-links ${menuOpen ? "open" : ""}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                "navbar-link" + (isActive ? " active" : "")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-right">
          <div className="navbar-user" title={user.email || user.name}>
            <span className="navbar-avatar">{initials(user.name)}</span>
            <div className="navbar-user-text">
              <span className="navbar-user-name">{user.name || "Account"}</span>
              <span className="navbar-user-role">{user.role}</span>
            </div>
          </div>
          <button type="button" className="navbar-logout" onClick={handleLogout}>
            Logout
          </button>
          <button
            type="button"
            className="navbar-toggle"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;