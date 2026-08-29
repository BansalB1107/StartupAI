import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Bar
} from "recharts";

const pieData = [
    { name: "Startups", value: 18 },
    { name: "Investors", value: 32 },
    { name: "Admins", value: 1 }
];

const COLORS = [
    "#6366f1",
    "#0ea5e9",
    "#22c55e"
];

const fundingData = [
    {
        month: "Jan",
        funding: 2
    },
    {
        month: "Feb",
        funding: 5
    },
    {
        month: "Mar",
        funding: 8
    },
    {
        month: "Apr",
        funding: 12
    },
    {
        month: "May",
        funding: 9
    },
    {
        month: "Jun",
        funding: 15
    }
];

// Renders interactive graphical charts visualizing platform user distribution and monthly funding trends dynamically.
const AnalyticsCharts = () => {

    return (

        <div className="charts-grid">

            <div className="chart-card">

                <h2>User Distribution</h2>

                <ResponsiveContainer
                    width="100%"
                    height={300}
                >

                    <PieChart>

                        <Pie
                            data={pieData}
                            dataKey="value"
                            outerRadius={110}
                            label
                        >

                            {pieData.map((entry, index) => (

                                <Cell
                                    key={index}
                                    fill={COLORS[index]}
                                />

                            ))}

                        </Pie>

                        <Tooltip />

                    </PieChart>

                </ResponsiveContainer>

            </div>

            <div className="chart-card">

                <h2>Monthly Funding</h2>

                <ResponsiveContainer
                    width="100%"
                    height={300}
                >

                    <BarChart
                        data={fundingData}
                    >

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="month" />

                        <YAxis />

                        <Tooltip />

                        <Bar
                            dataKey="funding"
                            fill="#6366f1"
                            radius={[8,8,0,0]}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </div>

    );

};

export default AnalyticsCharts;