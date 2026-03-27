import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DataNote } from '@/models/DataNote';
import slugify from '@/lib/slugify';

export async function GET() {
  try {
    await connectDB();
    
    const admin = {
      username: 'salmanbappy',
      full_name: 'Salman Bappy',
      designation: 'Owner',
      profile_pic_url: 'https://via.placeholder.com/80',
      facebook: 'https://facebook.com/salmanbappy'
    };

    const exampleNotes = [
      {
        title: 'Shenzhen Sanxing Three Phase Smart Meter S34U18',
        category: 'meter-manual',
        icon: '📟',
        item: 'MTS-300',
        type: 'S34U18',
        details: 'Advanced three-phase smart energy meter with multi-tariff support and tamper detection.',
        status: 'approved',
        likes: ['salmanai', 'testuser'],
        createdBy: admin,
        specifications: {
          status: 'approved',
          contributors: [admin],
          rows: [
            { name: 'Rated Voltage', details: 'Phase to Neutral', value: ['230V', '400V'] },
            { name: 'Current Range', details: 'Basic/Max', value: ['10(100)A'] },
            { name: 'Meter Number Range', details: 'Searchable Range', value: ['500000-600000', '1200000-1300000'] }
          ]
        },
        manualSections: [
          {
            section_type: 'display-list',
            title: 'LCD Display Parameters',
            status: 'approved',
            contributors: [admin],
            display_rows: [
              { sl_no: 1, id_number: '0.0.0', display_unit: '-', parameter_name: 'Device ID', parameter_details: 'Standard ID assigned by manufacturer', remarks: 'Check for barcode match' },
              { sl_no: 2, id_number: '1.8.0', display_unit: 'kWh', parameter_name: 'Total Active Energy', parameter_details: 'Cumulative import active energy' }
            ]
          }
        ],
        photos: [
          { url: 'https://via.placeholder.com/600x400?text=S34U18+Front+View', caption: 'Front Panel Layout', status: 'approved', uploadedBy: admin }
        ],
        comments: [
          { username: 'testuser', full_name: 'Test Ai', profile_pic_url: 'https://via.placeholder.com/40', text: 'This meter range also covers the 2024 batch.', createdAt: new Date() }
        ]
      },
      {
         title: 'Silicon Seal Application Form',
         category: 'application-form',
         icon: '📝',
         item: 'Sealing Material',
         type: 'Form-SL-01',
         details: 'Standard operating procedure form for requesting silicon seals for transformer bushings.',
         status: 'approved',
         createdBy: admin,
         imageUrl: 'https://via.placeholder.com/600x800?text=Application+Form+Sample',
         fileUrl: '#'
      }
    ];

    for (const noteData of exampleNotes) {
      const slug = slugify(noteData.title);
      await DataNote.findOneAndUpdate({ slug }, { ...noteData, slug }, { upsert: true });
    }

    return NextResponse.json({ success: true, message: 'Sample data seeded successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
