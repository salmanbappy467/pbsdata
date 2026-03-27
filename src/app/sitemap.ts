import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import { DataNote } from '@/models/DataNote';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pbshub.com';

  // Fetch dynamic slugs
  let noteEntries: any[] = [];
  try {
    await connectDB();
    const notes = await DataNote.find({ status: 'approved' }).select('slug updatedAt').lean();
    noteEntries = notes.map((note) => ({
      url: `${baseUrl}/data-note/${note.slug}`,
      lastModified: note.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Sitemap fetch error:', error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...noteEntries,
  ];
}
