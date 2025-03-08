import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ZAP_BASE_URL = process.env.ZAP_BASE_URL;
const ZAP_API_KEY = process.env.ZAP_API_KEY;

if (!ZAP_BASE_URL || !ZAP_API_KEY) {
    throw new Error("ZAP_BASE_URL or ZAP_API_KEY not set in .env.local");
}

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
        return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    try {
        console.log(`Starting scan for URL: ${url}`);
        // Start de scan via ZAP
        const response = await axios.get(`${ZAP_BASE_URL}/JSON/ascan/action/scan/`, {
            params: { apikey: ZAP_API_KEY, url },
        });
        console.log("Scan response:", response.data);
        if (!response.data.scan) {
            throw new Error("No scan ID received from ZAP");
        }
        return NextResponse.json({ message: "Scan started", scanId: response.data.scan });
    } catch (error: any) {
        console.error("Error starting scan:", error.response?.data || error.message);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}
