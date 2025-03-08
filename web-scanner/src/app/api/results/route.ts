import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ZAP_BASE_URL = process.env.ZAP_BASE_URL;
const ZAP_API_KEY = process.env.ZAP_API_KEY;

if (!ZAP_BASE_URL || !ZAP_API_KEY) {
    throw new Error("ZAP_BASE_URL or ZAP_API_KEY not set in .env.local");
}

export async function GET(req: NextRequest) {
    // We verwachten de target URL als 'baseurl'
    const baseurl = req.nextUrl.searchParams.get("baseurl");
    console.log("Results endpoint received baseurl:", baseurl);
    if (!baseurl) {
        return NextResponse.json({ error: "No baseurl provided" }, { status: 400 });
    }

    try {
        console.log(`Fetching alerts for baseurl: ${baseurl}`);
        // Ophalen van alle alerts voor deze baseurl
        const response = await axios.get(`${ZAP_BASE_URL}/JSON/alert/view/alerts/`, {
            params: { apikey: ZAP_API_KEY, baseurl, start: 0, count: 9999 },
        });
        return NextResponse.json({ vulnerabilities: response.data.alerts || [] });
    } catch (error: any) {
        console.error("Error fetching results:", error.response?.data || error.message);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}
