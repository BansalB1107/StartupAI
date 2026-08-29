import React, { useState, useEffect } from "react";
import API from "../api";
import "../styles/profile.css";

import {
    Phone,
    Building2,
    IndianRupee,
    Briefcase,
} from "lucide-react";

// Renders an interactive form enabling investors to update their professional details and investment budget.
export default function InvestorProfileForm() {

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        phone_number: "",
        company_or_firm: "",
        investment_budget: "",
        interested_industries: "",
    });

    const profileFields = [
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

        const fetchProfile = async () => {

            try {

                const res = await API.get("profile/");

                setFormData({
                    phone_number: res.data.phone_number ?? "",
                    company_or_firm: res.data.company_or_firm ?? "",
                    investment_budget: res.data.investment_budget ?? "",
                    interested_industries: res.data.interested_industries ?? "",
                });

            } catch (err) {

                console.log(err);

            }

        };

        fetchProfile();

    }, []);

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value,

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await API.put("profile/", formData);

            setMessage("Profile Updated Successfully!");

            setError("");

        } catch {

            setError("Failed to update profile.");

            setMessage("");

        }

    };

    return (

        <div className="profile-card">

            <h2 className="profile-title">
                Investor Profile
            </h2>

            <p className="profile-subtitle">
                Complete your investor information
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
                <p style={{
                    color: "#16a34a",
                    background: "#dcfce7",
                    padding: "12px",
                    borderRadius: "10px",
                    marginBottom: "15px"
                }}>
                    {message}
                </p>
            )}

            {error && (
                <p style={{
                    color: "#dc2626",
                    background: "#fee2e2",
                    padding: "12px",
                    borderRadius: "10px",
                    marginBottom: "15px"
                }}>
                    {error}
                </p>
            )}

            <form
                className="profile-form"
                onSubmit={handleSubmit}
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
                            value={formData.phone_number ?? ""}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                if (val.length <= 10) {
                                    handleChange({ target: { name: 'phone_number', value: val } });
                                }
                            }}
                            maxLength="10"
                        />

                    </div>

                    <div className="form-group">

                        <label className="input-label">

                            <Building2 size={18} />

                            Company / Firm

                        </label>

                        <input
                            type="text"
                            name="company_or_firm"
                            value={formData.company_or_firm ?? ""}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="form-group">

                        <label className="input-label">

                            <IndianRupee size={18} />

                            Investment Budget

                        </label>

                        <input
                            type="number"
                            name="investment_budget"
                            value={formData.investment_budget ?? ""}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="form-group">

                        <label className="input-label">

                            <Briefcase size={18} />

                            Interested Industries

                        </label>

                        <input
                            type="text"
                            name="interested_industries"
                            value={formData.interested_industries ?? ""}
                            onChange={handleChange}
                        />

                    </div>

                </div>

                <button
                    className="save-btn"
                    type="submit"
                >
                    💾 Save Profile
                </button>

            </form>

        </div>

    );

}