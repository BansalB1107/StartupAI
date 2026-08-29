import React, { useEffect, useState } from 'react';
import API from '../api';

// Retrieves and renders a list of accepted connections, allowing users to initiate chat sessions.
function StartupChatList() {
    const [connections, setConnections] = useState([]);

    useEffect(() => {
        // Fetch accepted connections
        API.get('connections/').then(res => setConnections(res.data.filter(c => c.status === 'accepted'))).catch(err => console.error('Error loading chat list', err));
    }, []);

    return (
        <div>
            <h3>My Connections</h3>
            {connections.length === 0 ? (
                <p>No connected users yet.</p>
            ) : connections.map(c => (
                <div key={c.id}>
                    <p>{c.other_user.username}</p>
                    <button onClick={() => window.location.href = `/chat/${c.other_user.id}`}>Open Chat</button>
                </div>
            ))}
        </div>
    );
}

export default StartupChatList;