import React, { useEffect, useState } from 'react';
import API from '../api';

// Renders a basic feed of available startup profiles for investors to discover and review.
function InvestorFeed() {
    const [startups, setStartups] = useState([]);

    useEffect(() => {
        API.get('startups/').then(res => setStartups(res.data));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>🔍 Startup Discovery</h2>
            {startups.map(s => (
                <div key={s.id} style={styles.card}>
                    <h3>{s.company_name}</h3>
                    <p>{s.industry}</p>
                    <button onClick={() => window.location.href = `/startup/${s.id}`}>View Profile</button>
                </div>
            ))}
        </div>
    );
}