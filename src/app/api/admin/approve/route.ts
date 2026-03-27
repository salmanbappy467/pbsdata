import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DataNote } from '@/models/DataNote';
import { verifyToken } from '@/lib/auth';

// Admin: approve/reject a note or a section within a note
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { noteId, sectionType, sectionId, action } = await request.json(); // action: approve | reject

    const note = await DataNote.findById(noteId);
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

    const status = action === 'approve' ? 'approved' : 'rejected';

    if (!sectionType) {
      // Approve only the entire note itself
      note.status = status;
    } else if (sectionType === 'specification') {
      // Approve only specifications
      if (status === 'approved' && note.specifications.pendingRows?.length) {
        note.specifications.rows = note.specifications.pendingRows;
        note.specifications.contributors = note.specifications.pendingContributors || [];
        note.specifications.pendingRows = [];
        note.specifications.pendingContributors = [];
      }
      note.specifications.status = status;
      note.markModified('specifications');
    } else if (sectionType === 'manual-section') {
      // Approve a specific manual section
      const section = note.manualSections.find((s: any) => String(s._id) === sectionId);
      if (section) {
        section.status = status;
        note.markModified('manualSections');
      }
    } else if (sectionType === 'photo') {
      // Approve a photo
      const photo = note.photos.find((p: any) => String(p._id) === sectionId);
      if (photo) {
        photo.status = status;
        note.markModified('photos');
      }
    }

    await note.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin approval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get all pending notes for admin review
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    // Notes that are either pending or have pending sections
    const pendingNotes = await DataNote.find({
      $or: [
        { status: 'pending' },
        { 'specifications.status': 'pending' },
        { 'manualSections.status': 'pending' },
        { 'photos.status': 'pending' },
      ],
    }).sort({ updatedAt: -1 });

    return NextResponse.json({ pendingNotes });
  } catch (error) {
    console.error('Admin GET pending error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
