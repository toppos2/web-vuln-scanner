"use client";

import { useState } from "react";

export default function Scanner() {
    const [url, setUrl] = useState("");
    const [scanId, setScanId] = useState<string | null>(null);
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleScanAndFetch() {
        if (!url) {
            alert("Please enter a URL");
            return;
        }

        console.log("Using URL:", url);
        setLoading(true);
        setError("");
        setResults([]);
        setScanId(null);

        try {
            // Start de scan
            const scanRes = await fetch(`/api/scan?url=${encodeURIComponent(url)}`);
            const scanData = await scanRes.json();
            if (!scanRes.ok) {
                throw new Error(scanData.error || "Failed to start scan");
            }
            setScanId(scanData.scanId);
            console.log("Scan started:", scanData);

            // Direct daarna: haal de resultaten op op basis van de baseurl (dezelfde URL)
            const resultsRes = await fetch(`/api/results?baseurl=${encodeURIComponent(url)}`);
            const resultsData = await resultsRes.json();
            if (!resultsRes.ok) {
                throw new Error(resultsData.error || "Failed to fetch results");
            }
            setResults(resultsData.vulnerabilities || []);
        } catch (err: any) {
            console.error("Error in scan flow:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-4 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">OWASP ZAP Web Scanner</h1>
            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL (e.g. https://example.com)"
                className="border p-2 w-full mb-4"
            />
            <button
                onClick={handleScanAndFetch}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2"
            >
                {loading ? "Scanning..." : "Scan and Fetch Results"}
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {results.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold">Scan Results</h2>
                    <ul className="list-disc pl-4">
                        {results.map((alert, index) => (
                            <li key={index} className="mt-2">
                                <strong>{alert.name}</strong>: {alert.description}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
