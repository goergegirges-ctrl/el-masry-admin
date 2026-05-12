import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, ShoppingBag } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import './NotificationPanel.css';

const TYPE_ICON = {
    new_order: <ShoppingBag size={16} />,
};

const fmtTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1)  return 'Just now / الآن';
    if (diffMin < 60) return `${diffMin}m ago / منذ ${diffMin} د`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24)   return `${diffH}h ago / منذ ${diffH} س`;
    return d.toLocaleDateString();
};

const NotificationPanel = () => {
    const { notifications, unreadCount, markAllRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleOpen = () => {
        setOpen(o => !o);
    };

    const handleMarkAll = () => {
        markAllRead();
    };

    return (
        <div className="notif-wrapper" ref={panelRef}>
            <button
                className="notif-bell iconbtn"
                onClick={handleOpen}
                aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="notif-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="notif-panel" role="dialog" aria-label="Notifications / الإشعارات">
                    <div className="notif-panel-header">
                        <span className="notif-panel-title">Notifications / الإشعارات</span>
                        <div className="notif-panel-actions">
                            {unreadCount > 0 && (
                                <button
                                    className="notif-mark-all"
                                    onClick={handleMarkAll}
                                    title="Mark all as read / تعليم الكل كمقروء"
                                >
                                    <CheckCheck size={15} />
                                    <span>Mark all read / تعليم الكل</span>
                                </button>
                            )}
                            <button
                                className="notif-close iconbtn"
                                onClick={() => setOpen(false)}
                                aria-label="Close / إغلاق"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="notif-list">
                        {notifications.length === 0 ? (
                            <div className="notif-empty">
                                <Bell size={32} opacity={0.3} />
                                <p>No notifications yet / لا توجد إشعارات بعد</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`notif-item${n.is_read ? '' : ' unread'}`}
                                >
                                    <span className="notif-icon">
                                        {TYPE_ICON[n.type] ?? <Bell size={16} />}
                                    </span>
                                    <div className="notif-content">
                                        <p className="notif-title">{n.title}</p>
                                        {n.body && <p className="notif-body">{n.body}</p>}
                                        <p className="notif-time">{fmtTime(n.created_at)}</p>
                                    </div>
                                    {!n.is_read && <span className="notif-dot" aria-hidden="true" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
