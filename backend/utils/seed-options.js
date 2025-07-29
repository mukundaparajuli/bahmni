const db = require('../config/db');

const seedOptions = async () => {
    try {
        console.log('Seeding options data...');
        const educationCount = await db.education.count();
        if (educationCount === 0) {
            console.log('No education records found. Seeding education options...');
            const educationOptions = [
                { name: 'High School Diploma', description: 'Secondary education completion' },
                { name: 'Associate Degree', description: 'Two-year college degree' },
                { name: 'Bachelor\'s Degree', description: 'Four-year undergraduate degree' },
                { name: 'Master\'s Degree', description: 'Graduate level degree' },
                { name: 'Doctorate/PhD', description: 'Highest academic degree' },
                { name: 'Professional Degree', description: 'Professional certification or license' },
                { name: 'Trade Certificate', description: 'Vocational or technical certification' },
                { name: 'Other', description: 'Other educational qualification' }
            ];

            for (const education of educationOptions) {
                await db.education.upsert({
                    where: { name: education.name },
                    update: {}, // No updates if record exists
                    create: education
                });
            }
            console.log('Education options seeded successfully!');
        } else {
            console.log('Education records already exist. Skipping seeding.');
        }

        // Seed Profession options if none exist
        const professionCount = await db.profession.count();
        if (professionCount === 0) {
            console.log('No profession records found. Seeding profession options...');
            const professionOptions = [
                { name: 'Doctor', description: 'Medical practitioner' },
                { name: 'Nurse', description: 'Healthcare professional' },
                { name: 'Pharmacist', description: 'Medication specialist' },
                { name: 'Medical Technician', description: 'Medical equipment and lab specialist' },
                { name: 'Administrator', description: 'Administrative professional' },
                { name: 'IT Specialist', description: 'Information technology professional' },
                { name: 'Accountant', description: 'Financial professional' },
                { name: 'Human Resources', description: 'HR professional' },
                { name: 'Security Officer', description: 'Security professional' },
                { name: 'Maintenance Staff', description: 'Facility maintenance' },
                { name: 'Receptionist', description: 'Front desk professional' },
                { name: 'Manager', description: 'Management professional' },
                { name: 'Consultant', description: 'Professional consultant' },
                { name: 'Other', description: 'Other profession' }
            ];

            for (const profession of professionOptions) {
                await db.profession.upsert({
                    where: { name: profession.name },
                    update: {}, // No updates if record exists
                    create: profession
                });
            }
            console.log('Profession options seeded successfully!');
        } else {
            console.log('Profession records already exist. Skipping seeding.');
        }

        // Seed Department options if none exist
        const departmentCount = await db.department.count();
        if (departmentCount === 0) {
            console.log('No department records found. Seeding department options...');
            const departmentOptions = [
                { name: 'Emergency Department', description: 'Emergency medical services' },
                { name: 'Cardiology', description: 'Heart and cardiovascular care' },
                { name: 'Neurology', description: 'Brain and nervous system care' },
                { name: 'Orthopedics', description: 'Bone and joint care' },
                { name: 'Pediatrics', description: 'Children\'s healthcare' },
                { name: 'Obstetrics & Gynecology', description: 'Women\'s healthcare' },
                { name: 'Internal Medicine', description: 'General internal medicine' },
                { name: 'Surgery', description: 'Surgical services' },
                { name: 'Radiology', description: 'Medical imaging services' },
                { name: 'Laboratory', description: 'Medical testing and analysis' },
                { name: 'Pharmacy', description: 'Medication services' },
                { name: 'ICU/Critical Care', description: 'Intensive care unit' },
                { name: 'Oncology', description: 'Cancer care' },
                { name: 'Psychiatry', description: 'Mental health services' },
                { name: 'Physical Therapy', description: 'Rehabilitation services' },
                { name: 'Administration', description: 'Administrative services' },
                { name: 'IT Department', description: 'Information technology' },
                { name: 'Human Resources', description: 'HR department' },
                { name: 'Finance', description: 'Financial services' },
                { name: 'Security', description: 'Security department' },
                { name: 'Maintenance', description: 'Facility maintenance' },
                { name: 'Other', description: 'Other department' }
            ];

            for (const department of departmentOptions) {
                await db.department.upsert({
                    where: { name: department.name },
                    update: {}, // No updates if record exists
                    create: department
                });
            }
            console.log('Department options seeded successfully!');
        } else {
            console.log('Department records already exist. Skipping seeding.');
        }

        console.log('Options data seeding completed!');
    } catch (error) {
        console.error('Error seeding options data:', error);
        throw error;
    } finally {
        await db.$disconnect();
    }
};

module.exports = seedOptions;