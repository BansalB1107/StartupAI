import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { BrainCircuit, LayoutDashboard, BarChart3, MessageCircle, Wallet,
         User, LogOut, FileText, Compass } from "lucide-react";
import session from "../../session";

// Renders the primary sidebar navigation menu, dynamically adapting available routes based on the current user role.
export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const role     = session.get("user_role") || "startup";

    const menu = [
        {
            name: "Dashboard",
            icon: LayoutDashboard,
            path: role === "investor" ? "/investor-dashboard" : "/startup-dashboard",
        },
        {
            name: "Analytics",
            icon: BarChart3,
            path: role === "investor" ? "/investor-analytics" : "/startup-analytics",
        },
        ...(role === "investor"
            ? [{ name: "Explore Startups", icon: Compass, path: "/marketplace" }]
            : []),
        { name: "Messages", icon: MessageCircle, path: "/messages" },
        ...(role === "startup"
            ? [{ name: "AI Strategy",  icon: BrainCircuit, path: "/strategy" }]
            : []),
        ...(role === "startup"
            ? [{ name: "My Reports", icon: FileText, path: "/my-reports" }]
            : []),
        ...(role === "startup"
            ? [{ name: "Funding", icon: Wallet, path: "/funding" }]
            : []),
        {
            name: "Profile",
            icon: User,
            path: role === "investor"
                ? "/investor-dashboard#profile-section"
                : "/startup-dashboard#profile-section",
        },
    ];

    // Clears the active user session data from storage and redirects the user to the login screen securely.
    function logout() { session.clear(); navigate("/login"); }

    return (
        <aside className="sidebar">
            {/* Upper: logo + nav */}
            <div>
                {/* Logo */}
                <div className="logo-section">
                    <div className="logo-circle">
                        <BrainCircuit size={20} color="#fff" />
                    </div>
                    <div>
                        <h2 className="logo">StartupAI</h2>
                        <p className="logo-subtitle">
                            {role === "investor" ? "Investor Platform" : "Startup Platform"}
                        </p>
                    </div>
                </div>

                {/* Nav */}
                <nav>
                    {menu.map((item) => {
                        const Icon = item.icon;

                        if (item.name === "Profile") {
                            return (
                                <button
                                    key={item.name}
                                    className={
                                        location.hash === "#profile-section"
                                            ? "nav-item active"
                                            : "nav-item"
                                    }
                                    onClick={() => navigate(item.path)}
                                    style={{ width: "100%", fontFamily: "inherit" }}
                                >
                                    <Icon size={18} />
                                    <span>{item.name}</span>
                                </button>
                            );
                        }

                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) => {
                                    if (item.name === "Dashboard" && location.hash === "#profile-section") {
                                        return "nav-item";
                                    }
                                    return isActive ? "nav-item active" : "nav-item";
                                }}
                            >
                                <Icon size={18} />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom: logout */}
            <button className="logout-btn" onClick={logout}>
                <LogOut size={16} />
                Logout
            </button>
        </aside>
    );
}