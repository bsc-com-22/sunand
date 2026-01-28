import { supabase } from './supabase-client.js';

const programs = [
    {
        name: 'Solar-powered Irrigation',
        description: 'Reliable, clean energy enabling year-round agricultural production and reduced dependence on rainfall.',
        sort_order: 1
    },
    {
        name: 'Climate-smart Agriculture',
        description: 'Practices that improve soil health, increase yields, and strengthen resilience to climate variability.',
        sort_order: 2
    },
    {
        name: 'Capacity Building',
        description: 'Practical training that transforms beneficiaries from subsistence farmers into market-oriented producers.',
        sort_order: 3
    },
    {
        name: 'Women & Youth Enterprise',
        description: 'Empowering women and youth as drivers of inclusive growth and community-level economic resilience.',
        sort_order: 4
    },
    {
        name: 'Sustainable Financing',
        description: 'Ensuring long-term viability through reinvestment and sustainable financial models.',
        sort_order: 5
    }
];

export async function seedPrograms() {
    console.log('Seeding programs...');
    for (const program of programs) {
        const { data, error } = await supabase
            .from('programs')
            .upsert(program, { onConflict: 'name' });

        if (error) {
            console.error(`Error seeding program ${program.name}:`, error.message);
        } else {
            console.log(`Program ${program.name} seeded successfully.`);
        }
    }
}
