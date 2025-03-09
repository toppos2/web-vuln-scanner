"use client";

import { useState } from "react";
import { AlertTriangle, X, ExternalLink, AlertCircle, Eye } from "lucide-react";
import type { JSX } from "react/jsx-runtime";

export default function Scanner() {
    const [url, setUrl] = useState("");
    const [scanId, setScanId] = useState<string | null>(null);
    const [results, setResults] = useState<any[]>([]);
    const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
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
            console.log("🔍 Starting spider scan for:", url);

            // 1️⃣ Start de spider
            const spiderRes = await fetch(`/api/spider?url=${encodeURIComponent(url)}`);
            const spiderData = await spiderRes.json();
            if (!spiderRes.ok) throw new Error(spiderData.error || "❌ Failed to start spider scan");

            console.log("✅ Spider scan started with ID:", spiderData.scanId);

            // 2️⃣ Wacht tot de spider klaar is
            let spiderStatus = "0";
            while (spiderStatus !== "100") {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const statusRes = await fetch(`/api/spider/status?scanId=${spiderData.scanId}`);
                const statusData = await statusRes.json();
                spiderStatus = statusData.status;
                setProgress(parseInt(spiderStatus) / 2); // Spider is 50% van het proces
                console.log(`🕷 Spider progress: ${spiderStatus}%`);
            }

            console.log("✅ Spider scan completed, starting active scan...");

            // 3️⃣ Start de actieve scan
            const scanRes = await fetch(`/api/scan?url=${encodeURIComponent(url)}`);
            const scanData = await scanRes.json();
            if (!scanRes.ok) throw new Error(scanData.error || "❌ Failed to start scan");

            setScanId(scanData.scanId);
            console.log("🛠 Active scan started with ID:", scanData.scanId);

            // 4️⃣ Wacht tot de actieve scan klaar is
            let scanStatus = "0";
            while (scanStatus !== "100") {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const statusRes = await fetch(`/api/status?scanId=${scanData.scanId}`);
                const statusData = await statusRes.json();
                scanStatus = statusData.status;
                setProgress(50 + parseInt(scanStatus) / 2); // Scan is 50%-100%
                console.log(`🛡 Scan progress: ${scanStatus}%`);
            }

            console.log("✅ Scan completed, fetching results...");

            // 5️⃣ Haal de resultaten op
            const resultsRes = await fetch(`/api/results?baseurl=${encodeURIComponent(url)}`);
            const resultsData = await resultsRes.json();
            if (!resultsRes.ok) throw new Error(resultsData.error || "❌ Failed to fetch results");

            // ✅ Filter dubbele kwetsbaarheden uit
            const uniqueResults = Array.from(new Map(resultsData.vulnerabilities.map(vul => [vul.name, vul])).values());
            setResults(uniqueResults);
            setScanComplete(true);
            setProgress(100);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background p-8 text-text">
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">CyberScan</h1>

                <div className="bg-card shadow-card p-6 rounded border border-border space-y-4">
                    <input
                        className="w-full border p-2 rounded"
                        placeholder="Voer een URL in"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={handleScanAndFetch}
                        disabled={loading}
                    >
                        {loading ? "🔄 Scannen..." : "🚀 Start Scan"}
                    </button>
                    {error && <p className="text-red-500">{error}</p>}
                    {scanId && <p>📌 Scan gestart met ID: <strong>{scanId}</strong></p>}
                </div>

                {/* 🚀 Voortgangsbalk */}
                {loading && (
                    <div className="relative w-full h-4 bg-gray-300 rounded">
                        <div
                            className="absolute top-0 left-0 h-4 bg-blue-500 rounded transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {scanComplete && results.length === 0 && (
                    <p className="text-green-500 p-4 border border-green-500 rounded">
                        ✅ Geen kwetsbaarheden gevonden!
                    </p>
                )}

                {results && results.length > 0 && (
                    <div className="bg-card shadow-card rounded border border-border">
                        <h2 className="text-xl font-semibold p-4 border-b border-border">
                            🔍 Scan Resultaten ({results.length})
                        </h2>
                        <ul>
                            {results.map((alert, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-center justify-between p-4 border-b border-border hover:bg-background cursor-pointer"
                                    onClick={() => setSelectedAlert(alert)}
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
