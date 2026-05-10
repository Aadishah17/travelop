import { NextRequest, NextResponse } from "next/server";

const APK_PATH = "/downloads/traveloop-android.apk";

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL(APK_PATH, request.url), 302);
}

export function HEAD(request: NextRequest) {
  return NextResponse.redirect(new URL(APK_PATH, request.url), 302);
}
