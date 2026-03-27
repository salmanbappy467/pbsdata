import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DataNote } from '@/models/DataNote';
import { verifyToken } from '@/lib/auth';
import slugify from '@/lib/slugify';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || '';
    const createdBy = searchParams.get('createdBy') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const token = request.cookies.get('auth-token')?.value;
    let currentUser: any = null;
    if (token) currentUser = await verifyToken(token);

    // Build query
    const query: any = {};
    if (status && (currentUser?.role === 'admin' || currentUser?.role === 'owner')) {
      query.status = status;
    } else if (createdBy) {
      query['createdBy.username'] = createdBy;
      // If a user is viewing their own, show all statuses. Otherwise only approved.
      if (currentUser?.username !== createdBy && currentUser?.role !== 'admin' && currentUser?.role !== 'owner') {
        query.status = 'approved';
      }
    } else {
      query.status = 'approved';
    }

    if (category) query.category = category;
    if (type) query.type = { $regex: type, $options: 'i' };

    if (search) {
      // Check if it's a meter number search
      const num = parseInt(search);
      if (!isNaN(num)) {
        // Search in meter number ranges stored in specification rows
        query.$or = [
          { $text: { $search: search } },
          {
            category: 'meter-manual',
            'specifications.rows': {
              $elemMatch: {
                name: { $regex: 'meter.number.range', $options: 'i' },
              },
            },
          },
        ];
      } else {
        query.$text = { $search: search };
      }
    }

    const [notes, total] = await Promise.all([
      DataNote.find(query)
        .select('slug category title icon item type details likes createdBy createdAt status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DataNote.countDocuments(query),
    ]);

    // Post-filter meter number ranges
    let filteredNotes = notes;
    if (search && !isNaN(parseInt(search))) {
      const num = parseInt(search);
      // Get all meter-manual notes and filter by range
      const meterNotes = await DataNote.find({
        status: 'approved',
        category: 'meter-manual',
      })
        .select('slug category title icon item type details likes createdBy createdAt status specifications')
        .lean();

      const rangeMatches = meterNotes.filter((note) => {
        const specRows = note.specifications?.rows || [];
        return specRows.some((row) => {
          if (/meter.number.range/i.test(row.name)) {
            return row.value.some((v: string) => {
              const parts = v.split(',').map((s: string) => s.trim());
              return parts.some((p: string) => {
                const [a, b] = p.split('-').map(Number);
                if (!isNaN(a) && !isNaN(b)) return num >= a && num <= b;
                return false;
              });
            });
          }
          return false;
        });
      });

      // Merge without duplicates
      const seen = new Set(filteredNotes.map((n) => String(n._id)));
      for (const m of rangeMatches) {
        if (!seen.has(String(m._id))) {
          filteredNotes.push(m);
          seen.add(String(m._id));
        }
      }
    }

    return NextResponse.json({
      notes: filteredNotes,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('GET /api/notes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const body = await request.json();
    const { title, category, icon, item, type, details } = body;

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    // Generate unique slug
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await DataNote.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const contributor = {
      username: user.username,
      full_name: user.full_name,
      designation: user.designation,
      profile_pic_url: user.profile_pic_url,
      facebook: user.facebook,
    };

    const note = await DataNote.create({
      slug,
      category,
      title,
      icon: icon || '📄',
      item: item || '',
      type: type || '',
      details: details || '',
      status: 'pending',
      likes: [],
      createdBy: contributor,
      specifications: { rows: [], contributors: [], status: 'approved' },
      manualSections: [],
      comments: [],
      photos: [],
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('POST /api/notes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
