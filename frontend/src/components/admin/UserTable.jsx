import React, { useState, useEffect } from "react";
import { User, ShieldCheck } from "lucide-react";
import API from "../../api";;
import BlockUserModal from "./BlockUserModal";

// Maps user roles to specific CSS class names for consistent semantic styling across user interfaces.
const getRoleClass = (role) => {
    switch (role) {
        case "Startup":
            return "role-startup";
        case "Investor":
            return "role-investor";
        case "Admin":
            return "role-admin";
        default:
            return "";
    }
};
console.log("ADMIN UserTable loaded");
// Retrieves and renders a comprehensive table of all platform users, enabling status management securely.
function UserTable() {

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await API.get("admin/users/");
            setUsers(res.data);
        } catch (err) {
            console.error("Error loading users", err);
        }
    };

    const handleUnblock = async (profileId) => {
        try {
            await API.post("admin/unblock-user/", {
                profile_id: profileId,
            });

            fetchUsers();

        } catch (err) {
            console.error(err);
            alert("Failed to unblock user.");
        }
    };

    return (
        <>
            <div className="table-card">

                <div className="table-header">
                    <h2>Platform Users</h2>
                    <span>{users.length} Users</span>
                </div>

                <table className="admin-table">

                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        {users.map((user) => (

                            <tr key={user.id}>

                                <td>
                                    <div className="startup-cell">

                                        <div className="avatar">
                                            <User size={20} />
                                        </div>

                                        <strong>{user.username}</strong>

                                    </div>
                                </td>

                                <td>{user.email}</td>

                                <td>
                                    <span className={getRoleClass(user.role)}>
                                        {user.role}
                                    </span>
                                </td>

                                <td>

                                    {user.status === "blocked" ? (

                                        <span className="pending-badge">
                                            🚫 Blocked
                                        </span>

                                    ) : user.verified ? (

                                        <span className="verified-badge">
                                            <ShieldCheck size={15} />
                                            Verified
                                        </span>

                                    ) : (

                                        <span className="pending-badge">
                                            Pending
                                        </span>

                                    )}

                                </td>

                                <td>{user.joined}</td>

                                <td>

                                    {user.status === "blocked" ? (

                                        <button
                                            className="approve-btn"
                                            onClick={() => handleUnblock(user.id)}
                                        >
                                            Unblock
                                        </button>

                                    ) : (

                                        <button
                                            className="delete-btn"
                                            onClick={() => {
                                                console.log("Block button clicked", user);
                                                setSelectedUser(user);
                                            }}
                                        >
                                            🚫 Block
                                        </button>

                                    )}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {selectedUser && (
                <BlockUserModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onSuccess={fetchUsers}
                />
            )}
        </>
    );
}

export default UserTable;