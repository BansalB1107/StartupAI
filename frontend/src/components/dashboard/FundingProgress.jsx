import { TrendingUp } from "lucide-react";

// Renders a visual progress bar tracking current fundraising amounts against the startup's total financial goal.
export default function FundingProgress({ stats }) {

    const goal = Number(stats.funding_goal || 0);
    const raised = Number(stats.raised_amount || 0);
    const progress = Math.min(Number(stats.progress || 0), 100);

    return (

        <div className="dashboard-card">

            <div className="section-header">

                <div>

                    <h2>
                        <TrendingUp
                            size={24}
                            style={{ marginRight: 10 }}
                        />
                        Funding Progress
                    </h2>

                    <p>
                        Live fundraising status
                    </p>

                </div>

            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    fontWeight: 600,
                }}
            >

                <span>

                    ₹{raised.toLocaleString("en-IN")}

                </span>

                <span>

                    ₹{goal.toLocaleString("en-IN")}

                </span>

            </div>

            <div
                style={{
                    width: "100%",
                    height: "18px",
                    borderRadius: "999px",
                    background: "var(--bg)",
                    overflow: "hidden",
                }}
            >

                <div
                    style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: "#10B981",
                        transition: "0.5s",
                    }}
                />

            </div>

            <div
                style={{
                    marginTop: "15px",
                    display: "flex",
                    justifyContent: "space-between",
                    color: "var(--text-light)",
                    fontSize: "15px",
                }}
            >

                <span>

                    {progress}% Funded

                </span>

                <span>

                    {stats.investors} Investor{stats.investors !== 1 ? "s" : ""}

                </span>

            </div>

        </div>

    );

}