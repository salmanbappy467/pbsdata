import { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { DataNote } from '@/models/DataNote';
import DataNoteClient from './DataNoteClient';

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate Dynamic Metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    await connectDB();
    const note = await DataNote.findOne({ slug, status: 'approved' }).select('title details category type').lean();
    
    if (!note) {
      return {
        title: 'Note Not Found | PBShub',
      };
    }

    const title = `${note.title} - ${note.category.replace('-', ' ')} Manual | PBShub`;
    const description = note.details?.substring(0, 160) || `Technical specifications, manual data format and details for ${note.title}.`;
    
    // Combine note-specific keywords with global ones
    const keywords = `${note.title}, ${note.category}, ${note.type || ''}, pbs, palli bidyut, reb, meter manual, reading manual data format, technical spec`;

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: (note as any).createdAt?.toISOString(),
      },
    };
  } catch (error) {
    return {
       title: 'Technical Data | PBShub',
    };
  }
}

export default async function DataNotePage({ params }: Props) {
  const { slug } = await params;
  
  // Optional: Prefetch note on server to reduce client-side loading
  let initialNote = null;
  try {
    await connectDB();
    initialNote = await DataNote.findOne({ slug }).lean();
    if (initialNote) {
      initialNote = JSON.parse(JSON.stringify(initialNote)); // Serialize for client component
    }
  } catch (err) {}

  return <DataNoteClient initialNote={initialNote} slug={slug} />;
}
