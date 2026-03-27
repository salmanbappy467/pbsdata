import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User, IUser } from '@/models/User';
import { verifyToken } from '@/lib/auth';

// Owner-only route to manage admins
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifyToken(token);
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden. Owner only.' }, { status: 403 });
    }

    await connectDB();
    const { targetUsername, role } = await request.json(); // role: admin | user

    if (!targetUsername) return NextResponse.json({ error: 'Username required' }, { status: 400 });

    const targetUser = await User.findOne({ username: targetUsername.toLowerCase() });
    if (!targetUser) return NextResponse.json({ error: 'Target user not found' }, { status: 404 });

    // Ensure owner remains owner
    if (targetUser.role === 'owner') {
      return NextResponse.json({ error: 'Cannot change owner role' }, { status: 403 });
    }

    targetUser.role = role || 'admin';
    await targetUser.save();

    return NextResponse.json({ success: true, user: targetUser });
  } catch (error) {
    console.error('Owner admin management error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Owner: list all users to manage
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifyToken(token);
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const query = search ? {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { full_name: { $regex: search, $options: 'i' } },
      ],
    } : {};

    const users = await User.find(query).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Owner GET users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
