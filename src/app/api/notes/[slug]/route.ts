import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DataNote } from '@/models/DataNote';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await ctx.params;

    // Support both ObjectId and slug
    const query = slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: slug } : { slug: slug };
    const note = await DataNote.findOne(query).lean();

    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // If not approved, only creator and admin can see it
    if (note.status !== 'approved') {
        const token = request.cookies.get('auth-token')?.value;
        let currentUser: any = null;
        if (token) {
            try {
                currentUser = await verifyToken(token);
            } catch (err) {}
        }

        const isCreator = currentUser?.username === note.createdBy?.username;
        const isAdminOrOwner = currentUser?.role === 'admin' || currentUser?.role === 'owner';

        if (!isCreator && !isAdminOrOwner) {
            return NextResponse.json({ error: 'This hub is pending approval' }, { status: 403 });
        }
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('GET note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
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
    const body = await request.json();
    const isAdminOrOwner = user.role === 'admin' || user.role === 'owner';

    // Find note
    const note = await DataNote.findOne(
      slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: slug } : { slug: slug }
    );
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const isOwnerOfNote = note.createdBy?.username === user.username;

    // Admins can approve and edit freely
    if (isAdminOrOwner) {
      const allowed = ['title', 'icon', 'item', 'type', 'details', 'status', 'category',
        'imageUrl', 'fileUrl', 'htmlContent', 'pendingImageUrl', 'pendingFileUrl', 'pendingHtmlContent'];
      for (const key of allowed) {
        if (body[key] !== undefined) (note as Record<string, any>)[key] = body[key];
      }
    } else if (isOwnerOfNote) {
      // Owner of note can only edit pending fields (needs re-approval)
      const allowed = ['title', 'icon', 'item', 'type', 'details', 'pendingImageUrl', 'pendingFileUrl', 'pendingHtmlContent'];
      for (const key of allowed) {
        if (body[key] !== undefined) (note as Record<string, any>)[key] = body[key];
      }
      note.status = 'pending'; // goes back to pending
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await note.save();
    return NextResponse.json({ note });
  } catch (error) {
    console.error('PATCH note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'admin' && user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { slug } = await ctx.params;
    await DataNote.findOneAndDelete(
      slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: slug } : { slug: slug }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
