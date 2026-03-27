import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DataNote } from '@/models/DataNote';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ slug: string; commentId: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { slug, commentId } = await ctx.params;

    const query = slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: slug } : { slug: slug };
    const note = await DataNote.findOne(query);
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const comment = note.comments.id(commentId);
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

    // Use pull to remove the sub-document
    note.comments.pull(commentId);
    await note.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Comment delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
