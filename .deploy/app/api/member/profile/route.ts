import { NextRequest, NextResponse } from "next/server";
import type { MemberProfile } from "@/lib/member-schema";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // In production, save to database
    // For now, simulate save
    const profile: Partial<MemberProfile> = {
      ...data,
      id: Date.now().toString(),
      slug: data.displayName?.toLowerCase().replace(/\s+/g, "-") || "member",
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      contributions: 0,
    };
    
    // Simulate database save
    console.log("Saving profile:", profile);
    
    return NextResponse.json({ 
      success: true, 
      profile,
      message: "Profile saved successfully" 
    });
  } catch (error) {
    console.error("Profile save error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  
  // In production, fetch from database
  if (slug) {
    // Return specific member profile
    return NextResponse.json({
      id: "1",
      slug,
      displayName: "Sample Member",
      bio: "This is a sample profile",
      role: "member" as const,
      joinedAt: new Date().toISOString(),
    });
  }
  
  // Return all members (for directory)
  return NextResponse.json({
    members: [],
    total: 0,
  });
}
