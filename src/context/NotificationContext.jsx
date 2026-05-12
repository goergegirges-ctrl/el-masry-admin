import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
} from 'react';
import api from '../utility/api';

const NotificationContext = createContext(null);

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children, token }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    // Incrementing this triggers a fresh EventSource connection
    const [reconnectKey, setReconnectKey] = useState(0);
    const esRef = useRef(null);
    const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';

    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            const { data } = await api.get('/api/admin/notifications');
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter(n => !n.is_read).length);
            }
        } catch { /* silently ignore */ }
    }, [token]);

    const markAllRead = useCallback(async () => {
        if (!token) return;
        try {
            await api.patch('/api/admin/notifications/mark-read');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch { /* silently ignore */ }
    }, [token]);

    // Fetch on mount / token change
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // SSE subscription — re-runs when token or reconnectKey changes
    useEffect(() => {
        // Read freshest token from storage (axios interceptor keeps it current)
        const currentToken = localStorage.getItem('admin_token') || token;
        if (!currentToken) return;

        const es = new EventSource(
            `${url}/api/admin/notifications/stream?token=${encodeURIComponent(currentToken)}`
        );
        esRef.current = es;

        es.addEventListener('notification', (e) => {
            try {
                const notif = JSON.parse(e.data);
                setNotifications(prev => [notif, ...prev]);
                setUnreadCount(prev => prev + 1);
            } catch { /* malformed frame — skip */ }
        });

        es.onerror = () => {
            es.close();
            esRef.current = null;
            // Reconnect after 5 s, picking up any refreshed token
            setTimeout(() => setReconnectKey(k => k + 1), 5_000);
        };

        return () => {
            es.close();
            esRef.current = null;
        };
    }, [token, reconnectKey, url]);

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, markAllRead, fetchNotifications }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
