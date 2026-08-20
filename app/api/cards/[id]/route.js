import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

function isValidDateString(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !isNaN(Date.parse(value))
  );
}

function isValidAmount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0;
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    // Next.js 15+ treats dynamic route params as an async value, so this
    // is awaited before destructuring (safe on Next 14 too, since
    // awaiting a plain object just resolves immediately).
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const update = {};

    if (body.name !== undefined) update.name = String(body.name).trim();
    if (body.last4 !== undefined) {
      if (body.last4 && !/^\d{4}$/.test(body.last4)) {
        return NextResponse.json(
          { error: "last4 must be exactly 4 digits" },
          { status: 400 },
        );
      }
      update.last4 = body.last4 ? String(body.last4) : null;
    }
    if (body.dueDate !== undefined) {
      if (!isValidDateString(body.dueDate)) {
        return NextResponse.json(
          { error: "dueDate must be a valid date (YYYY-MM-DD)" },
          { status: 400 },
        );
      }
      update.dueDate = body.dueDate;
    }
    if (body.amount !== undefined) {
      if (body.amount !== null && !isValidAmount(body.amount)) {
        return NextResponse.json(
          { error: "amount must be a non-negative number" },
          { status: 400 },
        );
      }
      update.amount = body.amount !== null ? Number(body.amount) : 0;
    }
    if (body.creditLimit !== undefined) {
      if (body.creditLimit !== null && !isValidAmount(body.creditLimit)) {
        return NextResponse.json(
          { error: "creditLimit must be a non-negative number" },
          { status: 400 },
        );
      }
      update.creditLimit =
        body.creditLimit !== null ? Number(body.creditLimit) : null;
    }

    const db = await getDb();
    // Scope the update to cards owned by the signed-in user so nobody
    // can edit another account's cards by guessing an id.
    const result = await db
      .collection("cards")
      .updateOne(
        { _id: new ObjectId(id), userEmail: session.user.email },
        { $set: update },
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    const { id } = await params; // awaited per Next.js 15+ async-params requirement
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db
      .collection("cards")
      .deleteOne({ _id: new ObjectId(id), userEmail: session.user.email });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
