import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DataNote } from '@/models/DataNote';
import { verifyToken } from '@/lib/auth';

// Toggle like on a note
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { slug } = await ctx.params;
    const note = await DataNote.findOne(
      slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: slug } : { slug: slug }
    );
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const idx = note.likes.indexOf(user.username);
    if (idx === -1) {
      note.likes.push(user.username);
    } else {
      note.likes.splice(idx, 1);
    }
    await note.save();

    return NextResponse.json({ likes: note.likes.length, liked: idx === -1 });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
