import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DataNote } from '@/models/DataNote';
import { verifyToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ slug: string; commentId: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { slug, commentId } = await ctx.params;

    const query = slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: slug } : { slug: slug };
    const note = await DataNote.findOne(query);
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const comment = note.comments.id(commentId);
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

    if (!comment.likes) comment.likes = [];
    
    const likedIndex = comment.likes.indexOf(user.username);
    if (likedIndex > -1) {
      comment.likes.splice(likedIndex, 1);
    } else {
      comment.likes.push(user.username);
    }

    await note.save();

    return NextResponse.json({ likes: comment.likes, liked: comment.likes.includes(user.username) });
  } catch (error) {
    console.error('Comment like error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
