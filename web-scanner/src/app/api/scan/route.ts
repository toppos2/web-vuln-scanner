//api/scan/route
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

        // ZAP kan weigeren een scan te starten als de URL niet toegankelijk is.
        console.log("Ensuring the URL is added to the scan tree...");
        await axios.get(`${ZAP_BASE_URL}/JSON/core/action/accessUrl/`, {
            params: { apikey: ZAP_API_KEY, url },
        });


        const response = await axios.get(`${ZAP_BASE_URL}/JSON/ascan/action/scan/`, {
            params: { apikey: ZAP_API_KEY, url },
        });

        console.log("Scan response:", response.data);

        if (!response.data.scan || response.data.scan === "0") {
            throw new Error("Failed to start active scan. Check if the site is allowed in ZAP.");
        }

        return NextResponse.json({ message: "Scan started", scanId: response.data.scan });
    } catch (error:unknown) {
        console.error("Error starting scan:" , error );
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
