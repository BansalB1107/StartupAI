import React, { useState, useEffect } from "react";
import API from "../api";
import session from '../session';
import "../styles/profile.css";
import {
    Phone,
    Building2,
    Briefcase,
    IndianRupee,
    FileText,
    Upload
} from "lucide-react";

// Renders a comprehensive form enabling founders and investors to manage professional details and upload documents.
function ProfileForm() {
    const userRole = session.get("user_role") || "startup";

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        phone_number: "",
        company_name: "",
        industry: "",
        pitch_description: "",
        funding_goal: "",
        company_or_firm: "",
        investment_budget: "",
        interested_industries: "",
    });

    const profileFields =
        userRole === "startup"
            ? [
                formData.phone_number,
                formData.company_name,
                formData.industry,
                formData.pitch_description,
                formData.funding_goal,
            ]
            : [
                formData.phone_number,
                formData.company_or_firm,
                formData.investment_budget,
                formData.interested_industries,
            ];

    const completedFields = profileFields.filter(
        field => field && field.toString().trim() !== ""
    ).length;

    const profileProgress = Math.round(
        (completedFields / profileFields.length) * 100
    );

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!session.get("access")) return;

            try {
                const response = await API.get("my-profile/");

                // 🚫 Check if user is blocked
                if (response.data.is_blocked) {
                    alert(
                        `🚫 Your account has been blocked.\n\nReason: ${response.data.block_reason}\n\n${response.data.block_description}`
                    );

                    session.clear();

                    window.location.href = "/login";
                    return;
                }

                setFormData(prev => ({
                    ...prev,
                    ...response.data,
                }));
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };

        fetchProfileData();
    }, []);

    useEffect(() => {
        if (!message && !error) return;

        const timer = setTimeout(() => {
            setMessage("");
            setError("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [message, error]);

    const handleChange = (e) => {
        console.log(e.target.name, e.target.value);

        setFormData((prev) => {
            const updated = {
                ...prev,
                [e.target.name]: e.target.value,
            };

            console.log(updated);

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await API.put("profile/", formData);
            setMessage("✨ Profile updated successfully!");
            setError("");
        } catch {
            setError("Failed to update profile.");
            setMessage("");
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const fileData = new FormData();
        fileData.append("pitch_deck", file);

        try {
            await API.put("profile/", fileData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setMessage("📁 Pitch Deck uploaded successfully!");
            setError("");
        } catch {
            setError("Failed to upload Pitch Deck.");
            setMessage("");
        }
    };

    return (
        <div className="profile-card">

            <h2 className="profile-title">
                Startup Profile
            </h2>

            <p className="profile-subtitle">
                Complete your startup information
            </p>

            <div className="progress-wrapper">

                <div className="progress-header">
                    <strong>Profile Completion</strong>
                    <strong>{profileProgress}%</strong>
                </div>

                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${profileProgress}%`,
                        }}
                    />
                </div>

            </div>

            {message && (
                <p style={styles.success}>
                    {message}
                </p>
            )}

            {error && (
                <p style={styles.error}>
                    {error}
                </p>
            )}

            <form
                onSubmit={handleSubmit}
                className="profile-form"
            >

                <div className="form-grid">

                    <div className="form-group">
                        <label className="input-label">
                            <Phone size={18} />
                            Phone Number
                        </label>

                        <input
                            type="text"
                            name="phone_number"
                            value={formData.phone_number || ""}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                if (val.length <= 10) {
                                    handleChange({ target: { name: 'phone_number', value: val } });
                                }
                            }}
                            maxLength="10"
                        />
                    </div>

                    {userRole === "startup" && (
                        <>
                            <div className="form-group">
                                <label className="input-label">
                                    <Building2 size={18} />
                                    Company Name
                                </label>

                                <input
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="input-label">
                                    <Briefcase size={18} />
                                    Industry
                                </label>

                                <input
                                    type="text"
                                    name="industry"
                                    value={formData.industry || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="input-label">
                                    <IndianRupee size={18} />
                                    Funding Goal
                                </label>

                                <input
                                    type="number"
                                    name="funding_goal"
                                    value={formData.funding_goal || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    )}

                </div>

                {userRole === "startup" && (
                    <div className="form-group full">
                        <label className="input-label">
                            <FileText size={18} />
                            Pitch Description
                        </label>

                        <textarea
                            rows="5"
                            name="pitch_description"
                            value={formData.pitch_description || ""}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <div className="form-group full">

                    <label className="input-label">
                        <Upload size={18} />
                        Pitch Deck (PDF)
                    </label>

                    <label className="upload-box">

                        <Upload size={28} />

                        <span>Upload Pitch Deck (PDF)</span>

                        <small>Click to browse</small>

                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            hidden
                        />

                    </label>

                </div>

                <button
                    type="submit"
                    className="save-btn"
                >
                    Save Changes
                </button>

            </form>

        </div>
    );
}

const styles = {
    success: {
        color: "#16a34a",
        background: "#dcfce7",
        padding: "12px",
        borderRadius: "10px",
        marginBottom: "20px",
        textAlign: "center",
        fontWeight: "600",
    },

    error: {
        color: "#dc2626",
        background: "#fee2e2",
        padding: "12px",
        borderRadius: "10px",
        marginBottom: "20px",
        textAlign: "center",
        fontWeight: "600",
    },
};

export default ProfileForm;