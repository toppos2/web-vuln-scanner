//api/spider/route.ts
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

        return NextResponse.json({ scanId });
    } catch (error: any) {
        console.error("Error starting spider scan:", error.response?.data || error.message);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}
