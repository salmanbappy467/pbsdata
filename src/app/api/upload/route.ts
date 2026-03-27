import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image');
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const imgbbFormData = new FormData();
    imgbbFormData.append('image', image);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMAGEBB_API_KEY}`, {
      method: 'POST',
      body: imgbbFormData,
    });

    const data = await response.json();
    
    if (data.success) {
      return NextResponse.json({ url: data.data.url });
    } else {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
