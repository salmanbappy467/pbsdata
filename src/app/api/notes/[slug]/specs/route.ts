import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DataNote, ISpecRow } from '@/models/DataNote';
import { verifyToken } from '@/lib/auth';

// Update specifications (needs admin approval)
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
    const { rows } = await request.json(); // Array of { name, details, value[] }

    if (!Array.isArray(rows)) return NextResponse.json({ error: 'Invalid rows' }, { status: 400 });

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

    if (user.role === 'admin' || user.role === 'owner') {
      // Direct update for admins
      note.specifications.rows = rows.map((r: any) => ({
        name: r.name,
        value: r.value,
        details: r.details || ''
      }));
      
      if (!note.specifications.contributors.some((c: any) => c.username === user.username)) {
        note.specifications.contributors.push(contributor);
      }
      note.specifications.status = 'approved';
      note.markModified('specifications');
    } else {
      // Pending update for users
      note.specifications.pendingRows = rows.map((r: any) => ({
        name: r.name,
        value: r.value,
        details: r.details || ''
      }));
      note.specifications.pendingContributors = [contributor];
      note.specifications.status = 'pending';
      note.markModified('specifications');
    }

    await note.save();
    return NextResponse.json({ success: true, status: note.specifications.status });
  } catch (error) {
    console.error('Specs update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
