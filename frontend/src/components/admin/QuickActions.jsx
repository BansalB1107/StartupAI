import {
    UserCheck,
    Users,
    BarChart3,
    BrainCircuit,
    Settings
} from "lucide-react";

// Renders a grid of quick access buttons for common administrative platform management tasks securely.
const QuickActions = () => {

    const actions = [

        {
            title: "Verify Startups",
            icon: UserCheck,
            color: "#22c55e"
        },

        {
            title: "Manage Users",
            icon: Users,
            color: "#3b82f6"
        },

        {
            title: "Platform Analytics",
            icon: BarChart3,
            color: "#3B82F6"
        },

        {
            title: "AI Insights",
            icon: BrainCircuit,
            color: "#f97316"
        },

        {
            title: "Settings",
            icon: Settings,
            color: "#64748b"
        }

    ];

    return (

        <div className="quick-actions">

            {actions.map((action) => {

                const Icon = action.icon;

                return (

                    <button
                        key={action.title}
                        className="quick-action-card"
                    >

                        <div
                            className="quick-action-icon"
                            style={{
                                background: action.color
                            }}
                        >

                            <Icon size={24} color="white" />

                        </div>

                        <span>

                            {action.title}

                        </span>

                    </button>

                );

            })}

        </div>

    );

};

export default QuickActions;