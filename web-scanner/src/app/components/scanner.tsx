"use client";

import { useState } from "react";
import { AlertTriangle, AlertCircle, ShieldCheck } from "lucide-react";
import type { JSX } from "react/jsx-runtime";

interface Vulnerability {
    name: string;
    risk: string;
    description?: string;

}

export default function Scanner() {
    const [url, setUrl] = useState("");
    const [scanId, setScanId] = useState<string | null>(null);
    const [results, setResults] = useState<Vulnerability[]>([]);
   // const [selectedAlert, setSelectedAlert] = useState<Vulnerability | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [progress, setProgress] = useState(0);

    const severityColors: Record<string, string> = {
        High: "text-red-500 bg-red-500/10 border-red-500",
        Medium: "text-amber-500 bg-amber-500/10 border-amber-500",
        Low: "text-yellow-400 bg-yellow-400/10 border-yellow-400",
    };

    const severityIcons: Record<string, JSX.Element> = {
        High: <AlertCircle className="w-5 h-5 text-red-500" />,
        Medium: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        Low: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    };

    async function handleScanAndFetch() {
        if (!url) {
            alert("Please enter a URL");
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]);
        setScanId(null);
        setScanComplete(false);
        setProgress(0);

        try {
            console.log("🔍 Starting scan for:", url);

            const scanRes = await fetch(`/api/scan?url=${encodeURIComponent(url)}`);
            const scanData = await scanRes.json();
            if (!scanRes.ok) throw new Error(scanData.error || "Failed to start scan");

            setScanId(scanData.scanId);
            console.log("🛠 Scan started with ID:", scanData.scanId);

            let scanStatus = "0";
            while (scanStatus !== "100") {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const statusRes = await fetch(`/api/status?scanId=${scanData.scanId}`);
                const statusData = await statusRes.json();
                scanStatus = statusData.status;
                setProgress(parseInt(scanStatus));
                console.log(`🛡 Scan progress: ${scanStatus}%`);
            }

            console.log("✅ Scan completed, fetching results...");

            const resultsRes = await fetch(`/api/results?baseurl=${encodeURIComponent(url)}`);
            const resultsData = await resultsRes.json();
            if (!resultsRes.ok) throw new Error(resultsData.error || "Failed to fetch results");

            const uniqueResults = Array.from(new Set(resultsData.vulnerabilities))as Vulnerability[];
            setResults(uniqueResults);

            setScanComplete(true);
            setProgress(100);

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to start scan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white px-4">
            <div className="w-full max-w-3xl space-y-6">
                <h1 className="text-4xl font-bold text-center text-white flex items-center justify-center gap-2">
                    <ShieldCheck className="text-blue-500 w-8 h-8" />
                    CyberScan
                </h1>
                <p className="text-center text-gray-400">Automated web vulnerability scanner for security professionals</p>

                <div className="bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-semibold mb-2">Start New Scan</h2>
                    <label className="block text-gray-400 text-sm mb-1">Target URL</label>
                    <input
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <button
                        className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2"
                        onClick={handleScanAndFetch}
                        disabled={loading}
                    >
                        {loading ? "🔄 Scanning..." : "🛡 Start Security Scan"}
                    </button>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                    {scanId && <p className="text-gray-300 mt-2 text-center">📌 Scan gestart met ID: <strong>{scanId}</strong></p>}
                </div>

                {loading && (
                    <div className="w-full bg-gray-700 h-4 rounded-lg overflow-hidden">
                        <div className="bg-blue-500 h-4 rounded-lg transition-all" style={{ width: `${progress}%` }} />
                    </div>
                )}

                {scanComplete && results.length === 0 && (
                    <p className="text-green-500 p-4 border border-green-500 rounded-lg text-center">
                        ✅ Geen kwetsbaarheden gevonden!
                    </p>
                )}

                {results.length > 0 && (
                    <div className="bg-gray-800 shadow-lg rounded-xl border border-gray-700">
                        <h2 className="text-xl font-semibold p-4 border-b border-gray-600">🔍 Scan Resultaten ({results.length})</h2>
                        <ul>
                            {results.map((alert, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-center justify-between p-4 border-b border-gray-600 hover:bg-gray-700 cursor-pointer"
                                   // onClick={() => setSelectedAlert(alert)}
                                >
                                    <div className="flex items-center gap-2">
                                        {severityIcons[alert.risk] || severityIcons.Low}
                                        <span>{alert.name}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded border ${severityColors[alert.risk] || severityColors.Low}`}>
                                        {alert.risk || "Low"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
