import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { extractInviteCode } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);

    if (isNaN(page) || page < 1 || isNaN(size) || size < 1) {
      return new NextResponse("Invalid pagination parameters", { status: 400 });
    }

    const profile = await currentProfile();

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const servers = await db.server.findMany({
      include: {
        members: true,
        channels: true,
      },
      skip: (page - 1) * size,
      take: size,
    });

    return NextResponse.json(servers);
  } catch (error) {
    console.log("[SERVER_GET_SERVER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, imageUrl } = await req.json();
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const server = await db.server.create({
      data: {
        profileId: profile.id,
        name,
        imageUrl,
        inviteCode: uuidv4(),
        channels: {
          create: [{ name: "general", profileId: profile.id }],
        },
        members: {
          create: [{ profileId: profile.id, role: MemberRole.ADMIN }],
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[SERVERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { inviteCode } = await req.json();

    if (!inviteCode) {
      return new NextResponse("Invite code is required!", { status: 400 });
    }

    const trimCode = extractInviteCode(inviteCode);

    const existingServer = await db.server.findFirst({
      where: {
        inviteCode: trimCode,
      },
    });

    if (!existingServer) {
      return new NextResponse("Invalid invite code!", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        inviteCode: trimCode,
      },
      data: {
        members: {
          create: [
            {
              profileId: profile.id,
            },
          ],
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[SERVERS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
