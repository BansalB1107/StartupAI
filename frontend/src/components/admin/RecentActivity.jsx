import {
    Rocket,
    UserPlus,
    IndianRupee,
    BrainCircuit,
    CheckCircle,
    Bell
} from "lucide-react";

// Renders a stylized list displaying recent platform activities, including registrations, investments, and verifications securely.
const RecentActivity = () => {

    const activities = [

        {
            icon: Rocket,
            color: "#3B82F6",
            title: "New Startup Registered",
            description: "TechNova submitted its profile.",
            time: "5 mins ago"
        },

        {
            icon: CheckCircle,
            color: "#22c55e",
            title: "Startup Verified",
            description: "GreenFuture was approved.",
            time: "20 mins ago"
        },

        {
            icon: UserPlus,
            color: "#3b82f6",
            title: "New Investor Joined",
            description: "A new investor account was created.",
            time: "1 hour ago"
        },

        {
            icon: IndianRupee,
            color: "#f59e0b",
            title: "Investment Received",
            description: "₹2,50,000 invested in AgroTech.",
            time: "2 hours ago"
        },

        {
            icon: BrainCircuit,
            color: "#3B82F6",
            title: "AI Analysis Generated",
            description: "Startup strategy report created.",
            time: "Today"
        },

        {
            icon: Bell,
            color: "#ef4444",
            title: "Platform Notification",
            description: "System maintenance scheduled.",
            time: "Today"
        }

    ];

    return (

        <div className="activity-card">

            <div className="section-title">

                <h2>Recent Activity</h2>

                <span>Latest platform events</span>

            </div>

            <div className="activity-list">

                {activities.map((activity, index) => {

                    const Icon = activity.icon;

                    return (

                        <div
                            className="activity-item"
                            key={index}
                        >

                            <div
                                className="activity-icon"
                                style={{
                                    background: activity.color
                                }}
                            >

                                <Icon
                                    size={20}
                                    color="white"
                                />

                            </div>

                            <div className="activity-content">

                                <strong>

                                    {activity.title}

                                </strong>

                                <p>

                                    {activity.description}

                                </p>

                            </div>

                            <span className="activity-time">

                                {activity.time}

                            </span>

                        </div>

                    );

                })}

            </div>

        </div>

    );

};

export default RecentActivity;