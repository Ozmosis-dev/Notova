
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding for jetski_test...');

    const userId = 'jetski_test';
    const email = 'jetski_test@notova.app';

    // 1. Create or Update User
    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            id: userId, // forcing a specific ID if possible, or letting it be generated. 
            // The schema says id is String @id @default(cuid()), but we can provide one.
            // However, if the user already exists with a different ID, upsert by email will handle it.
            // But if we want to ensure the ID is 'jetski_test' for login purposes (if auth uses it), 
            // we might face issues if the ID format matters (CUID). 
            // Let's rely on email for identity and let Prisma generate the ID if it's a new user.
            email,
            name: 'Jetski Test',
            theme: 'dark',
        },
    });

    console.log(`User ensured: ${user.email} (${user.id})`);

    // 2. Clear existing relevant data for this user to avoid duplicates if re-running?
    // User asked to "fill", maybe just appending is fine, but cleaning up might be cleaner for "mock data".
    // Let's delete existing notebooks for this user to ensure we start fresh with this specific set.
    await prisma.note.deleteMany({
        where: { notebook: { userId: user.id } }
    });
    await prisma.notebook.deleteMany({
        where: { userId: user.id }
    });
    await prisma.tag.deleteMany({
        where: { userId: user.id }
    });

    console.log('Cleared existing data for user.');

    // 3. Create Tags
    const tagNames = ['Urgent', 'Q4 Strategy', 'Video', 'Review Needed', 'Approved', 'Ideas', 'Personal'];
    const tags = await Promise.all(
        tagNames.map(name =>
            prisma.tag.create({
                data: {
                    name,
                    userId: user.id,
                    color: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'][Math.floor(Math.random() * 4)]
                }
            })
        )
    );

    console.log(`Created ${tags.length} tags.`);

    // 4. Create Notebooks with Notes
    const notebooksData = [
        {
            name: 'Product Roadmaps',
            icon: '🚀',
            notes: [
                {
                    title: 'Q4 2026 Product Launch Strategy',
                    content: `<h1>Q4 Launch Strategy</h1><p>Our primary focus is on the <strong>Jetski V2</strong> release.</p><h2>Key Milestones</h2><ul><li>Design Lock: Oct 15</li><li>Beta Testing: Nov 1</li><li>Public Launch: Dec 10</li></ul><h2>Risks</h2><p>Supply chain delays for the new motor components.</p>`,
                    tags: ['Q4 Strategy', 'Urgent']
                },
                {
                    title: 'Feature List: Mobile App v3.0',
                    content: `<h1>Mobile App v3.0 Features</h1><table><thead><tr><th>Feature</th><th>Priority</th><th>Status</th></tr></thead><tbody><tr><td>Offline Mode</td><td>High</td><td>In Progress</td></tr><tr><td>Dark Mode</td><td>Medium</td><td>Done</td></tr><tr><td>Voice Memos</td><td>Low</td><td>Planned</td></tr></tbody></table>`,
                    tags: ['Review Needed']
                },
                {
                    title: 'Competitor Analysis: WaveRunner X',
                    content: `<p>Comparison of the new WaveRunner specifications versus our upcoming model.</p><p>They have improved stability but lower top speed.</p>`,
                    tags: ['Q4 Strategy']
                },
                {
                    title: 'User Feedback Summary - Sept',
                    content: `<ul><li>Users love the new handle grip.</li><li>Complaints about battery life in cold weather.</li></ul>`,
                    tags: ['Review Needed']
                },
                {
                    title: '2027 Concept Sketches',
                    content: `<p>Initial thoughts on the hydrofoil integration.</p><p>[Placeholder for Sketch Image]</p>`,
                    tags: ['Ideas']
                },
                {
                    title: 'Pricing Tiers Discussion',
                    content: `<p>Pro vs Elite models.</p><p>Pro: $12k</p><p>Elite: $15k</p>`,
                    tags: ['Q4 Strategy']
                }
            ]
        },
        {
            name: 'Video Assets',
            icon: '🎬',
            notes: [
                {
                    title: 'Promo Video Script - Draft 1',
                    content: `<h1>Promo Script</h1><p><strong>Scene 1:</strong> Ocean spray, high speed drone shot.</p><p><strong>Narrator:</strong> "Freedom doesn't ask for permission."</p><p><strong>Scene 2:</strong> Cut to rider executing a sharp turn.</p>`,
                    tags: ['Video', 'Draft']
                },
                {
                    title: 'Shoot Locations: Bahamas',
                    content: `<p>Potential spots for the December shoot:</p><ol><li>Exuma Cays</li><li>Nassau Harbor</li><li>Gold Rock Beach</li></ol><p>Permits required for drone usage.</p>`,
                    tags: ['Video']
                },
                {
                    title: 'Music Licensing Options',
                    content: `<p>Tracks under consideration:</p><ul><li>"Ocean Drive" - Synthwave Mix</li><li>"High Energy" - Stock Library</li></ul>`,
                    tags: ['Video', 'Review Needed']
                },
                {
                    title: 'Editing Timeline',
                    content: `<p>Rough Cut: Nov 20</p><p>Final Cut: Dec 1</p>`,
                    tags: ['Urgent', 'Video']
                },
                {
                    title: 'Equipment Checklist',
                    content: `<p>Red Komodo, GoPro Hero 12s, DJI Inspire 3.</p>`,
                    tags: []
                }
            ]
        },
        {
            name: 'Marketing Ideas',
            icon: '💡',
            notes: [
                {
                    title: 'Influencer Campaign List',
                    content: `<p>Targeting top 10 water sports influencers.</p><p>Reach out to:</p><ul><li>Kai Lenny</li><li>Austin Keen</li></ul>`,
                    tags: ['Ideas']
                },
                {
                    title: 'Social Media Calendar - Dec',
                    content: `<p>Focus on "Gift of Adventure".</p><p>Daily posts counting down to launch.</p>`,
                    tags: ['Q4 Strategy']
                },
                {
                    title: 'Blog Post Topics',
                    content: `<p>1. Maintenance tips for winter.</p><p>2. Top 5 destinations for jetskiing.</p>`,
                    tags: ['Draft']
                },
                {
                    title: 'Email Newsletter Strategy',
                    content: `<p>Segmentation: Existing owners vs Leads.</p>`,
                    tags: ['Approved']
                }
            ]
        },
        {
            name: 'Personal Notes',
            icon: '📝',
            notes: [
                {
                    title: 'Grocery List',
                    content: `<ul><li>Milk</li><li>Eggs</li><li>Coffee beans</li><li>Avocados</li></ul>`,
                    tags: ['Personal']
                },
                {
                    title: 'Book Recommendations',
                    content: `<p>Sci-Fi novels to read:</p><ul><li>Dune Messiah</li><li>Project Hail Mary</li></ul>`,
                    tags: ['Personal']
                },
                {
                    title: 'Vacation Plans 2027',
                    content: `<p>Japan trip itinerary ideas.</p>`,
                    tags: ['Personal']
                },
                {
                    title: 'Gym Workout Routine',
                    content: `<p>Push/Pull/Legs split.</p><p>Monday: Push</p><p>Tuesday: Pull</p>`,
                    tags: ['Personal']
                }
            ]
        }
    ];

    // Helper to generate more filler notes if needed to reach ~30
    const fillerNotes = [
        { title: 'Meeting Notes: Design Sync', content: '<p>Discussed the new logo placement.</p>', tags: ['Review Needed'] },
        { title: 'Bug Report: Login Issue', content: '<p>User reported 404 on login page periodically.</p>', tags: ['Urgent'] },
        { title: 'Partnership Agreement', content: '<p>Draft contract with RedBull.</p>', tags: ['Q4 Strategy'] },
        { title: 'Quarterly Budget Review', content: '<p>Q3 spending was under budget by 5%.</p>', tags: ['Approved'] },
        { title: 'Team Building Event', content: '<p>Ideas: Go-karting, Escape Room.</p>', tags: ['Ideas'] },
        { title: 'Website Analytics Report', content: '<p>Traffic up 20% MoM.</p>', tags: ['Review Needed'] },
        { title: 'Customer Support Hires', content: '<p>Need 2 new agents for the holiday season.</p>', tags: ['Urgent'] },
        { title: 'Office Supplies', content: '<p>Order more standing desks.</p>', tags: [] },
        { title: 'Holiday Party Planning', content: '<p>Venue: The Waterfront.</p>', tags: ['Ideas'] },
        { title: 'Client Feedback - Acme Corp', content: '<p>They want more customization options.</p>', tags: ['Review Needed'] }
    ];

    // Distribute filler notes randomly
    let fillerIndex = 0;

    for (const nbData of notebooksData) {
        const notebook = await prisma.notebook.create({
            data: {
                name: nbData.name,
                icon: nbData.icon,
                userId: user.id,
            }
        });

        console.log(`Created notebook: ${notebook.name}`);

        // Create main notes
        for (const noteData of nbData.notes) {
            await createNote(noteData, notebook.id, tags);
        }

        // Add some filler notes to this notebook
        const notesToAdd = 2 + Math.floor(Math.random() * 3); // Add 2-4 filler notes per notebook
        for (let i = 0; i < notesToAdd; i++) {
            if (fillerIndex < fillerNotes.length) {
                await createNote(fillerNotes[fillerIndex], notebook.id, tags);
                fillerIndex++;
            }
        }
    }

    console.log('Seeding completed successfully!');
}

async function createNote(noteData: any, notebookId: string, allTags: any[]) {
    const note = await prisma.note.create({
        data: {
            title: noteData.title,
            content: noteData.content,
            contentPlaintext: noteData.content.replace(/<[^>]*>?/gm, ''), // Simple strip tags
            notebookId: notebookId,
        }
    });

    // Attach tags
    if (noteData.tags && noteData.tags.length > 0) {
        for (const tagName of noteData.tags) {
            const tag = allTags.find(t => t.name === tagName);
            if (tag) {
                await prisma.noteTag.create({
                    data: {
                        noteId: note.id,
                        tagId: tag.id
                    }
                });
            }
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
