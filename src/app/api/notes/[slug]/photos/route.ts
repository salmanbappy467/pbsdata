import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DataNote, IPhoto } from '@/models/DataNote';
import { verifyToken } from '@/lib/auth';

// Add a photo to the note gallery
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
    const { url, caption } = await request.json();

    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const note = await DataNote.findOne(
      slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: slug } : { slug: slug }
    );
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const contributor = {
      username: user.username,
      full_name: user.full_name,
      designation: user.designation,
      profile_pic_url: user.profile_pic_url,
      facebook: user.facebook,
    };

    note.photos.push({
      url,
      caption: caption || '',
      uploadedBy: contributor,
      status: (user.role === 'admin' || user.role === 'owner') ? 'approved' : 'pending',
      createdAt: new Date(),
    } as IPhoto);

    await note.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
