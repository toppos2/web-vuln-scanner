import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ZAP_BASE_URL = process.env.ZAP_BASE_URL;
const ZAP_API_KEY = process.env.ZAP_API_KEY;

if (!ZAP_BASE_URL || !ZAP_API_KEY) {
    throw new Error("ZAP_BASE_URL or ZAP_API_KEY not set in .env.local");
}

export async function GET(req: NextRequest) {
    const scanId = req.nextUrl.searchParams.get("scanId");
    if (!scanId) {
        return NextResponse.json({ error: "No scanId provided" }, { status: 400 });
    }

    try {
        console.log(`Checking status of active scan with ID: ${scanId}`);

        const statusRes = await axios.get(`${ZAP_BASE_URL}/JSON/ascan/view/status/`, {
            params: { apikey: ZAP_API_KEY, scanId },
        });

        return NextResponse.json({ status: statusRes.data.status });
    } catch (error:unknown) {
        console.error("Error starting scan:" , error );
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
