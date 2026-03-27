import mongoose from 'mongoose';
import { connectDB } from './src/lib/db';
import { DataNote } from './src/models/DataNote';
import { User } from './src/models/User';
import slugify from './src/lib/slugify';

// Using plain node to run this might require ts-node or similar, but since we're in Next.js environment
// We'll create a script that can be triggered via a temporary API route for convenience.

export async function seed() {
  await connectDB();
  
  // Clear existing
  // await DataNote.deleteMany({});

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
            { sl_no: 1, id_number: '0.0.0', display_unit: '-', parameter_name: 'Device ID', parameter_details: 'Standard ID assigned by manufacturer' },
            { sl_no: 2, id_number: '1.8.0', display_unit: 'kWh', parameter_name: 'Total Active Energy', parameter_details: 'Cumulative import active energy' }
          ]
        }
      ]
    },
    {
       title: 'V-Type Connector Application Form',
       category: 'application-form',
       icon: '📝',
       item: 'Material Request',
       type: 'Form-01',
       details: 'Official form required for requesting V-type connectors for pole-mounted transformers.',
       status: 'approved',
       createdBy: admin,
       imageUrl: 'https://via.placeholder.com/600x800?text=Application+Form+Sample',
       fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ];

  for (const note of exampleNotes) {
    const slug = slugify(note.title);
    await DataNote.findOneAndUpdate({ slug }, { ...note, slug }, { upsert: true });
  }

  console.log('Seed data inserted successfully');
}
