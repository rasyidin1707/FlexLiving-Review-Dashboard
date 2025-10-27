import { NextRequest, NextResponse } from "next/server";
import { autoApprovalRules, type AutoApprovalRules } from "@/data/mock/config";
import fs from "node:fs";
import path from "node:path";

const CONFIG_PATH = path.join(process.cwd(), "data", "mock", "config.ts");

export async function GET() {
  return NextResponse.json(autoApprovalRules);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AutoApprovalRules>;
    const next: AutoApprovalRules = {
      ratingThreshold: typeof body.ratingThreshold === "number" ? body.ratingThreshold : autoApprovalRules.ratingThreshold,
      channels: Array.isArray(body.channels) ? body.channels.map(String) : autoApprovalRules.channels,
    };
    const content = `export type AutoApprovalRules = {\n  ratingThreshold: number;\n  channels: string[];\n};\n\nexport const autoApprovalRules: AutoApprovalRules = ${JSON.stringify(next, null, 2)} as const;\n`;
    fs.writeFileSync(CONFIG_PATH, content, "utf8");
    return NextResponse.json({ status: "ok", rules: next });
  } catch (e: any) {
    return NextResponse.json({ status: "error", message: e?.message || "Failed to save" }, { status: 400 });
  }
}

