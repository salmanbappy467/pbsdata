import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DataNote } from '@/models/DataNote';
import { verifyToken } from '@/lib/auth';

// Add a comment (public-visible, no approval needed)
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
    const { text } = await request.json();
    if (!text?.trim()) return NextResponse.json({ error: 'Text required' }, { status: 400 });

    const note = await DataNote.findOne(
      slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: slug } : { slug: slug }
    );
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    note.comments.push({
      username: user.username,
      full_name: user.full_name,
      profile_pic_url: user.profile_pic_url,
      text: text.trim(),
      createdAt: new Date(),
    });
    await note.save();

    return NextResponse.json({ comments: note.comments });
  } catch (error) {
    console.error('Comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
