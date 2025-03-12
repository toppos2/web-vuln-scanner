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
        console.log(`Starting spider scan for URL: ${url}`);


        const spiderRes = await axios.get(`${ZAP_BASE_URL}/JSON/spider/action/scan/`, {
            params: { apikey: ZAP_API_KEY, url },
        });

        const scanId = spiderRes.data.scan;
        if (!scanId) {
            throw new Error("No spider scan ID received from ZAP");
        }

        console.log(`Spider scan started with ID: ${scanId}`);


        let spiderStatus = "0";
        while (spiderStatus !== "100") {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            const statusRes = await axios.get(`${ZAP_BASE_URL}/JSON/spider/view/status/`, {
                params: { apikey: ZAP_API_KEY, scanId },
            });
            spiderStatus = statusRes.data.status;
            console.log(`Spider progress: ${spiderStatus}%`);
        }

        console.log("Spider scan completed, starting active scan...");


        const activeScanRes = await axios.get(`${ZAP_BASE_URL}/JSON/ascan/action/scan/`, {
            params: { apikey: ZAP_API_KEY, url },
        });

        if (!activeScanRes.data.scan) {
            throw new Error("No active scan ID received from ZAP");
        }

        return NextResponse.json({ message: "Active scan started", scanId: activeScanRes.data.scan });
    } catch (error:unknown) {
        console.error("Error starting scan:" , error );
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
