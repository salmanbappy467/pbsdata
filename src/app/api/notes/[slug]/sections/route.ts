import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DataNote, IManualSection, IDisplayRow } from '@/models/DataNote';
import { verifyToken } from '@/lib/auth';

// Add or update a manual section
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
    const { sectionId, type, content, title, display_rows } = await request.json();

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

    const isAdminOrOwner = user.role === 'admin' || user.role === 'owner';

    if (sectionId) {
      // Find section by id and update it
      const sectionIndex = note.manualSections.findIndex((s: any) => String(s._id) === sectionId);
      if (sectionIndex === -1) return NextResponse.json({ error: 'Section not found' }, { status: 404 });

      const section = note.manualSections[sectionIndex];
      // All edits need admin approval to go public, but user can see their pending
      Object.assign(section, {
        section_type: type,
        content: content || '',
        title: title || '',
        display_rows: display_rows || [],
        status: isAdminOrOwner ? 'approved' : 'pending',
      });
      if (!section.contributors.some((c: any) => c.username === user.username)) {
        section.contributors.push(contributor);
      }
      note.markModified('manualSections');
    } else {
      // Create new section
      note.manualSections.push({
        section_type: type,
        content: content || '',
        title: title || '',
        display_rows: display_rows || [],
        likes: [],
        contributors: [contributor],
        status: isAdminOrOwner ? 'approved' : 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as IManualSection);
    }

    await note.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Manual section update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Like/Dislike a specific section
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
    const { sectionId, action } = await request.json();

    if (action !== 'like') return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    const note = await DataNote.findOne(
      slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: slug } : { slug: slug }
    );
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const section = note.manualSections.find((s: any) => String(s._id) === sectionId);
    if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 });

    const idx = section.likes.indexOf(user.username);
    if (idx === -1) {
      section.likes.push(user.username);
    } else {
      section.likes.splice(idx, 1);
    }

    await note.save();
    return NextResponse.json({ likes: section.likes.length, liked: idx === -1 });
  } catch (error) {
    console.error('Section like error:', error);
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
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Only admin can delete' }, { status: 403 });
    }

    await connectDB();
    const { slug } = await ctx.params;
    const { sectionId } = await request.json();

    const note = await DataNote.findOne(
      slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: slug } : { slug: slug }
    );
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    note.manualSections = note.manualSections.filter((s: any) => String(s._id) !== sectionId);
    await note.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Section delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

