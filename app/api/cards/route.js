import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

function isValidDateString(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const cards = await db
      .collection('cards')
      .find({ userEmail: session.user.email })
      .sort({ dueDate: 1 })
      .toArray();

    return NextResponse.json(
      cards.map((c) => ({ ...c, _id: c._id.toString() }))
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, last4, dueDate } = body;

    if (!name || !dueDate) {
      return NextResponse.json(
        { error: 'name and dueDate are required' },
        { status: 400 }
      );
    }

    if (!isValidDateString(dueDate)) {
      return NextResponse.json(
        { error: 'dueDate must be a valid date (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    if (last4 && !/^\d{4}$/.test(last4)) {
      return NextResponse.json(
        { error: 'last4 must be exactly 4 digits' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const doc = {
      name: String(name).trim(),
      last4: last4 ? String(last4) : null,
      dueDate, // stored as 'YYYY-MM-DD' string; parsed client-side to avoid TZ shifts
      userEmail: session.user.email,
      createdAt: new Date(),
    };

    const result = await db.collection('cards').insertOne(doc);

    return NextResponse.json(
      { ...doc, _id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
