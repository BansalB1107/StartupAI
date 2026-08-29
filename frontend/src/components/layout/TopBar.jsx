import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    Moon,
    Sun,
    Search,
    LayoutDashboard,
    BarChart3,
    MessageSquare,
    BrainCircuit,
    Rocket
} from "lucide-react";
import ThemeContext from "../../theme/ThemeContext";
import { RefreshCw } from "lucide-react";
import session from '../../session';
import API from "../../api";

// Renders the top navigation bar containing global search functionality, user profile management, and system notifications dynamically.
export default function TopBar() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const role = session.get("user_role") || "startup";
    const username = session.get("username") || "User";

    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [profilePic, setProfilePic] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        API.get("my-profile/")
            .then((res) => {
                if (res.data.profile_picture) {
                    setProfilePic(res.data.profile_picture);
                }
            })
            .catch((err) => console.error("Error fetching profile pic:", err));
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profile_picture", file);

        try {
            const res = await API.put("profile/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (res.data.data.profile_picture) {
                setProfilePic(res.data.data.profile_picture);
            }
            alert("Profile picture updated successfully!");
        } catch (err) {
            console.error("Error uploading profile pic:", err);
            alert("Failed to update profile picture.");
        }
    };

    const refreshPage = () => {
        window.location.reload();
    };

    const pages = [
        {
            name: "Dashboard",
            icon: LayoutDashboard,
            keywords: ["dashboard", "home"],
            path: "/startup-dashboard",
        },
        {
            name: "Analytics",
            icon: BarChart3,
            keywords: ["analytics", "stats"],
            path: "/analytics",
        },
        {
            name: "Messages",
            icon: MessageSquare,
            keywords: ["messages", "chat"],
            path: "/messages",
        },
        {
            name: "AI Strategy",
            icon: BrainCircuit,
            keywords: ["strategy", "ai", "ai strategy"],
            path: "/strategy",
        },
        {
            name: "Create Pitch",
            icon: Rocket,
            keywords: ["pitch", "create pitch"],
            path: "/create-pitch",
        },
    ];

    const handleSearch = (e) => {
        if (e.key !== "Enter") return;

        const value = search.toLowerCase().trim();

        if (!value) return;

        const page = pages.find((p) =>
            p.keywords.some((keyword) =>
                keyword.includes(value)
            )
        );

        if (page) {
            navigate(page.path);
            setSearch("");
        } else {
            alert("No matching page found.");
        }
    };

    return (
        <header className="topbar">

            <div className="search-box">

                <Search size={18} />

                <input
                    type="text"
                    placeholder="Search pages... (Analytics, Messages, AI...)"
                    value={search}
                    onChange={(e) => {

                        const value = e.target.value;

                        setSearch(value);

                        if (value.trim() === "") {
                            setResults([]);
                            return;
                        }

                        const filtered = pages.filter(page =>
                            page.keywords.some(keyword =>
                                keyword.includes(value.toLowerCase())
                            )
                        );

                        setResults(filtered);

                    }}
                    onKeyDown={handleSearch}
                />

                {/* Search Results */}
                {results.length > 0 && (

                    <div className="search-results">

                        {results.map((page, index) => (

                            <div
                                key={index}
                                className="search-item"
                                onClick={() => {

                                    navigate(page.path);

                                    setSearch("");

                                    setResults([]);

                                }}
                            >
                                <>
                                    <page.icon size={18} />
                                    <span>{page.name}</span>
                                </>
                            </div>

                        ))}

                    </div>

                )}

            </div>



            <div className="top-right">

                <button
                    className="icon-btn notify-btn"
                    onClick={() => navigate("/notifications")}
                    title="Notifications"
                >
                    <Bell size={20} />
                    <span className="notify-dot"></span>
                </button>
                <button
                    onClick={refreshPage}
                    className="refresh-btn"
                >
                    <RefreshCw size={18} />
                </button>
                <div className="profile-box">

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    <img
                        src={profilePic || `https://ui-avatars.com/api/?background=3B82F6&color=fff&name=${username}&bold=true`}
                        alt="Profile"
                        style={{ cursor: "pointer", objectFit: "cover" }}
                        onClick={() => fileInputRef.current?.click()}
                        title="Click to change profile picture"
                    />

                    <div>

                        <h4>{username}</h4>

                        <p>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </p>

                    </div>

                </div>

            </div>

        </header>
    );
}