import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

import "../../styles/layout.css";

// Provides the foundational wrapper structure for dashboard pages, encapsulating the common sidebar and topbar navigation.
export default function DashboardLayout({ children }) {
    return (

        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <TopBar />

                <div className="dashboard-content">

                    {children}

                </div>

            </div>

        </div>

    );
}