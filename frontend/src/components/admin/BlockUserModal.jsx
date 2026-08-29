import { useState } from "react";
import api from "../../api";

// Renders a modal interface allowing administrators to block users by submitting a documented reason.
export default function BlockUserModal({ user, onClose, onSuccess }) {
  console.log("✅ BlockUserModal rendered", user);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);



  // Submits the block request to the backend, alerts on success, and triggers UI updates.
  const handleBlock = async () => {
  console.log("🚀 handleBlock called");

  if (!reason.trim()) {
    alert("Reason is required");
    return;
  }

  try {
    setLoading(true);

    const res = await api.post("admin/block-user/", {
      profile_id: user.id,
      reason,
      description,
    });

    console.log(res.data);

    alert("User blocked successfully");

    onSuccess();
    onClose();
  } catch (err) {
    console.error(err.response?.data || err);
    alert("Failed to block user");
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999999,
      }}
    >
      <div
        style={{
          width: "450px",
          background: "#fff",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,.3)",
          color: "#1a1a2e",
        }}
      >
        <h2 style={{ color: "#1a1a2e", margin: "0 0 20px" }}>
          Block {user.username}
        </h2>

        <input
          type="text"
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            boxSizing: "border-box",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "14px",
            color: "#1a1a2e",
            background: "#f9f9f9",
          }}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            height: "100px",
            marginBottom: "15px",
            boxSizing: "border-box",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "14px",
            color: "#1a1a2e",
            background: "#f9f9f9",
            resize: "vertical",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: "#f0f0f0",
              color: "#333",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleBlock}
            disabled={loading}
            style={{
              padding: "8px 18px",
              borderRadius: "6px",
              border: "none",
              background: loading ? "#999" : "#e74c3c",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {loading ? "Blocking..." : "Block User"}
          </button>
        </div>
      </div>
    </div>
  );
}