import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { goal } = await req.json();

    if (!goal) {
      return NextResponse.json({ error: "Goal is required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY environment variable. Please add it to your .env.local file." }, { status: 500 });
    }

    const prompt = `
      You are an expert productivity coach. The user wants to achieve this goal: "${goal}".
      Break this goal down into a highly actionable, structured checklist of 3 to 6 micro-tasks.
      For each task, provide a descriptive title and an estimated deadline offset in days from today.
      Return STRICTLY a JSON array. Do not include markdown formatting or backticks around the JSON.
      
      Example output:
      [
        {"title": "Read the official documentation introduction", "deadline_days_offset": 1},
        {"title": "Build a small hello world project", "deadline_days_offset": 2}
      ]
    `;

    // You specified gemini-2.5-flash directly. If this 404s (e.g. from early access keys), we fallback
    let result;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      result = await model.generateContent(prompt);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e1: any) {
      console.warn("gemini-2.5-flash failed:", e1.message);
      try {
        const fallback1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        result = await fallback1.generateContent(prompt);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e2: any) {
        console.warn("gemini-1.5-flash-latest failed:", e2.message);
        const fallback2 = genAI.getGenerativeModel({ model: "gemini-pro" });
        result = await fallback2.generateContent(prompt);
      }
    }

    const responseText = result!.response.text();
    
    // Clean up potential markdown formatting from Gemini's response
    const cleanJsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const tasks = JSON.parse(cleanJsonString);

    return NextResponse.json({ tasks }, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate tasks" }, { status: 500 });
  }
}
