import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { signToken } from '@/lib/auth';

const PBSNET_WORKER_URL = process.env.PBSNET_WORKER_URL || 'https://pbsnet.app/worker/get-user';
const OWNER_USERNAME = process.env.OWNER_USERNAME || 'salmanbappy';

export async function POST(request: NextRequest) {
  try {
    const { key: inputKey } = await request.json();

    if (!inputKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 400 });
    }

    const PBSNET_SECRET = process.env.NEXT_PUBLIC_PBSNET_ADMIN_SECRET || '';

    const targetKey = inputKey.startsWith('pbsnet-') ? inputKey : `pbsnet-${inputKey}`;
    let workerUrl = PBSNET_WORKER_URL.replace(/\/$/, '');
    if (!workerUrl.endsWith('/view')) {
      workerUrl += '/view';
    }

    // Call pbsnet-worker API
    const pbsRes = await fetch(workerUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-secret': PBSNET_SECRET
      },
      body: JSON.stringify({ target_user_key: targetKey }),
    });

    if (!pbsRes.ok) {
      return NextResponse.json({ error: 'User not found in pbsnet' }, { status: 401 });
    }

    const pbsData = await pbsRes.json();

    if (!pbsData.username) {
      return NextResponse.json({ error: 'Invalid pbsnet response' }, { status: 401 });
    }

    await connectDB();

    // Determine role
    const isOwner = pbsData.username.toLowerCase() === OWNER_USERNAME.toLowerCase();
    let role: 'owner' | 'admin' | 'user' = 'user';

    if (isOwner) {
      role = 'owner';
    } else {
      const existingUser = await User.findOne({ username: pbsData.username.toLowerCase() });
      if (existingUser?.role === 'admin') {
        role = 'admin';
      }
    }

    // Upsert user
    const userData = {
      username: pbsData.username.toLowerCase(),
      full_name: pbsData.full_name || '',
      designation: pbsData.designation || '',
      profile_pic_url: pbsData.profile_pic_url || '',
      facebook: pbsData.personal_json?.facebook || '',
      role,
    };

    await User.findOneAndUpdate(
      { username: userData.username },
      userData,
      { upsert: true, new: true }
    );

    // Sign JWT
    const token = await signToken(userData);

    const response = NextResponse.json({
      success: true,
      user: userData,
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
