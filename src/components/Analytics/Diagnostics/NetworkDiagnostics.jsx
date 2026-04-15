import React, { useState } from 'react'
import { Activity, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import './NetworkDiagnostics.css'

const NetworkDiagnostics = ({ backendUrl }) => {
    const [status, setStatus] = useState(null);
    const [checking, setChecking] = useState(false);

    const runDiagnostics = async () => {
        setChecking(true);
        setStatus(null);
        
        const results = [];
        
        // 1. Check Backend Connectivity
        try {
            const start = Date.now();
            await fetch(`${backendUrl}/api/admin/analytics/summary`, { 
                mode: 'no-cors',
                cache: 'no-cache'
            });
            const latency = Date.now() - start;
            results.push({ 
                name: "Backend Server", 
                ok: true, 
                msg: `Reachable (latency: ${latency}ms)`,
                type: 'success'
            });
        } catch (err) {
            results.push({ 
                name: "Backend Server", 
                ok: false, 
                msg: `OFFLINE or Blocked: ${err.message}`,
                type: 'error'
            });
        }

        // 2. Check Port Consistency
        const actualPort = backendUrl.split(':').pop();
        if (actualPort !== "4000") {
            results.push({
                name: "Environment Config",
                ok: false,
                msg: `Misconfigured: backend is expected on port 4000 but VITE_BACKEND_URL uses ${actualPort}`,
                type: 'warning'
            });
        } else {
            results.push({
                name: "Environment Config",
                ok: true,
                msg: "VITE_BACKEND_URL matches expected port 4000",
                type: 'success'
            });
        }

        setStatus(results);
        setChecking(false);
    }

    return (
        <div className="network-diagnostics">
            <div className="diag-header">
                <Activity size={18} />
                <h3>Connectivity Diagnostics</h3>
                {!checking && (
                    <button onClick={runDiagnostics} className="btn-run-diag">
                        <RefreshCw size={14} />
                        Scan Again
                    </button>
                )}
            </div>

            {checking ? (
                <div className="diag-loading">
                    <Loader2 size={24} className="animate-spin" />
                    <p>Scanning network routes...</p>
                </div>
            ) : status ? (
                <div className="diag-results">
                    {status.map((item, idx) => (
                        <div key={idx} className={`diag-item ${item.type}`}>
                            {item.ok ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            <div className="diag-item-text">
                                <strong>{item.name}</strong>
                                <span>{item.msg}</span>
                            </div>
                        </div>
                    ))}
                    <p className="diag-footer">
                        {status.every(i => i.ok) 
                            ? "All routes are clear. If issues persist, check your browser's console for CORS errors." 
                            : "Correct the highlighted issues above and restart your development server."}
                    </p>
                </div>
            ) : (
                <div className="diag-initial">
                    <p>Diagnose connectivity to resolve 'Network Error'.</p>
                    <button onClick={runDiagnostics} className="btn-run-diag primary">
                        <Activity size={16} />
                        Run Network Scan
                    </button>
                </div>
            )}
        </div>
    )
}

export default NetworkDiagnostics
