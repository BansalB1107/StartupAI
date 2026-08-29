import { motion } from "framer-motion";
import { CheckCircle, XCircle, Building2 } from "lucide-react";

// Renders a data table listing unverified startups, allowing admins to efficiently approve or reject applications.
const PendingVerificationTable = ({
    startups,
    onApprove,
}) => {

    if (!startups.length) {
        return (
            <div className="table-card">
                <h2>Pending Startup Verification</h2>

                <div className="empty-state">
                    🎉 No startups are waiting for verification.
                </div>
            </div>
        );
    }

    return (

        <div className="table-card">

            <div className="table-header">
                <h2>Pending Startup Verification</h2>
            </div>

            <table className="admin-table">

                <thead>

                    <tr>

                        <th>Startup</th>

                        <th>Industry</th>

                        <th>Funding Goal</th>

                        <th>Status</th>

                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                    {startups.map((startup) => (

                        <motion.tr

                            key={startup.id}

                            initial={{ opacity: 0 }}

                            animate={{ opacity: 1 }}

                        >

                            <td>

                                <div className="startup-cell">

                                    <div className="avatar">

                                        <Building2 size={22} />

                                    </div>

                                    <div>

                                        <strong>
                                            {startup.company_name || startup.username}
                                        </strong>

                                        <br />

                                        <span>
                                            @{startup.username}
                                        </span>

                                    </div>

                                </div>

                            </td>

                            <td>

                                {startup.industry || "N/A"}

                            </td>

                            <td>

                                ₹ {startup.funding_goal || "0"}

                            </td>

                            <td>

                                <span className="pending-badge">

                                    Pending

                                </span>

                            </td>

                            <td>

                                <button
                                    className="approve-btn"
                                    onClick={() => onApprove(startup.id)}
                                >

                                    <CheckCircle size={18} />

                                    Approve

                                </button>

                                <button
                                    className="reject-btn"
                                >

                                    <XCircle size={18} />

                                    Reject

                                </button>

                            </td>

                        </motion.tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

};

export default PendingVerificationTable;