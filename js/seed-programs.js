import { supabase } from './supabase-client.js';

const programs = [
    {
        name: 'Solar-Powered Irrigation Technology',
        description: 'Enabling year-round production and resilience against climate-induced droughts.',
        sort_order: 1
    },
    {
        name: 'Climate-Smart Agricultural Practices',
        description: 'Training farmers in techniques that increase productivity while protecting the environment.',
        sort_order: 2
    },
    {
        name: 'Capacity Building and Technical Training',
        description: 'Providing the knowledge and skills necessary for modern, efficient agribusiness management.',
        sort_order: 3
    },
    {
        name: 'Women and Youth Enterprise Development',
        description: 'Empowering women and youth as drivers of inclusive growth and community-level economic resilience.',
        sort_order: 4
    },
    {
        name: 'Sustainable Financing and Reinvestment',
        description: 'Ensuring long-term viability through reinvestment and sustainable financial models for community projects.',
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
