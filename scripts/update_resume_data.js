const fs = require('fs');
const path = require('path');

const LINKEDIN_DIR = path.join(process.cwd(), 'public/cv');
const OUTPUT_FILE = path.join(process.cwd(), 'public/resumeData.json');
const BASE_FILE = path.join(process.cwd(), 'public/cv.json');

// Helper to parse CSV lines respecting quotes
function parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const result = [];

    for (let i = 1; i < lines.length; i++) {
        // Simple regex to match CSV fields: values in quotes OR values without commas
        const row = [];
        const re = /"((?:""|[^"])*)"|([^,]+)|(,)/g;
        let match;
        let index = 0;

        // This loop is a bit simplistic for complex CSVs but works for standard exports
        // Better approach: manual char parsing to handle commas inside quotes
        let currentLine = lines[i];
        if (!currentLine) continue;

        // Reset loop
        let inQuote = false;
        let field = '';
        for (let j = 0; j < currentLine.length; j++) {
            const char = currentLine[j];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                row.push(field.trim());
                field = '';
            } else {
                field += char;
            }
        }
        row.push(field.trim());

        // Map to object
        const obj = {};
        headers.forEach((h, idx) => {
            let val = row[idx] || '';
            // Remove surrounding quotes if present
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1);
            }
            // Unescape double quotes
            val = val.replace(/""/g, '"');
            obj[h] = val;
        });
        result.push(obj);
    }
    return result;
}

function safeReadCSV(filename) {
    try {
        const content = fs.readFileSync(path.join(LINKEDIN_DIR, filename), 'utf8');
        return parseCSV(content);
    } catch (e) {
        console.warn(`Warning: Could not read ${filename}`);
        return [];
    }
}

// Main logic
try {

    let baseData;
    try {
        if (fs.existsSync(BASE_FILE)) {
            baseData = JSON.parse(fs.readFileSync(BASE_FILE, 'utf8'));
        } else if (fs.existsSync(OUTPUT_FILE)) {
            console.log('cv.json not found, using resumeData.json as base');
            baseData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
        } else {
            throw new Error('No base JSON file found');
        }
    } catch (e) {
        console.error('Failed to load base data', e);
        process.exit(1);
    }
    const profile = safeReadCSV('Profile.csv')[0] || {};
    const positions = safeReadCSV('Positions.csv');
    const education = safeReadCSV('Education.csv');
    const skills = safeReadCSV('Skills.csv');
    const certifications = safeReadCSV('Certifications.csv');
    const honors = safeReadCSV('Honors.csv');
    const projects = safeReadCSV('Projects.csv');
    const volunteering = safeReadCSV('Volunteering.csv');
    const recommendations = safeReadCSV('Recommendations_Received.csv');
    const courses = safeReadCSV('Courses.csv');

    // Update MAIN (Bio, Contact)
    // Note: LinkedIn profile data might be less "portfolio-ready" than existing cv.json, 
    // but user asked to incorporate it. We will use LinkedIn summary as Bio.
    if (profile['Summary']) {
        baseData.main = baseData.main || {};
        baseData.main.bio = profile['Summary'];
        // Keep existing name/image/contact unless specifically asked to override
        // baseData.main.name = `${profile['First Name']} ${profile['Last Name']}`;
    }

    // Update RESUME
    baseData.resume = baseData.resume || {};

    // Map Education
    baseData.resume.education = education.map(e => ({
        school: e['School Name'],
        degree: e['Degree Name'],
        graduated: e['End Date'] || 'Present',
        description: e['Notes'] || ''
    }));

    // Map Work
    baseData.resume.work = positions.map(p => ({
        company: p['Company Name'],
        title: p['Title'],
        years: `${p['Started On']} - ${p['Finished On'] || 'Present'}`,
        description: p['Description']
    }));

    // Map Skills
    // LinkedIn skills are just names. We'll give a default level for now.
    // Try to preserve existing levels if name matches?
    const existingSkills = new Map(baseData.resume.skills ? baseData.resume.skills.map(s => [s.name.toLowerCase(), s.level]) : []);

    baseData.resume.skills = skills.map(s => ({
        name: s['Name'],
        level: existingSkills.get(s['Name'].toLowerCase()) || '80%' // Default to 80%
    }));

    // Map Certifications (NEW)
    baseData.resume.certifications = certifications.map(c => ({
        name: c['Name'],
        authority: c['Authority'],
        date: c['Finished On'] || c['Started On'],
        license: c['License Number'],
        url: c['Url']
    }));

    // Map Honors (NEW)
    baseData.resume.honors = honors.map(h => ({
        title: h['Title'],
        issuer: 'LinkedIn', // Honors.csv doesn't explicitly have Issuer col but typically inferred or empty
        date: h['Issued On']
    }));

    // Map Volunteering (NEW)
    baseData.resume.volunteering = volunteering.map(v => ({
        organization: v['Company Name'],
        role: v['Role'],
        date: `${v['Started On']} - ${v['Finished On'] || 'Present'}`,
        description: v['Description']
    }));

    // Map Courses (NEW)
    baseData.resume.courses = courses.map(c => ({
        name: c['Name'],
        number: c['Number']
    }));

    // Update PORTFOLIO (Projects)
    // Dynamic Image Assignment
    console.log('Reading portfolio images...');
    const PORTFOLIO_IMG_DIR = path.join(process.cwd(), 'public/images/portfolio');
    let portfolioImages = [];
    try {
        if (fs.existsSync(PORTFOLIO_IMG_DIR)) {
            portfolioImages = fs.readdirSync(PORTFOLIO_IMG_DIR).filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
            });
            console.log(`Found ${portfolioImages.length} images:`, portfolioImages);
        } else {
            console.log('Portfolio dir does not exist:', PORTFOLIO_IMG_DIR);
        }
    } catch (e) {
        console.warn('Could not read portfolio images directory', e);
    }

    // Fallback if no images found
    if (portfolioImages.length === 0) {
        console.warn('No images found in public/images/portfolio. Projects will have no image.');
    }

    // Helper to pick an image
    // Helper to pick an image
    const assignImage = (title) => {
        if (portfolioImages.length === 0) return '';

        const sanitize = (str) => {
            let s = str.toLowerCase();
            s = s.replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
                .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');
            return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, '');
        };
        const sanitizedTitle = sanitize(title);

        // Find matching image
        const match = portfolioImages.find(img => {
            const imgExt = path.extname(img);
            const imgName = path.basename(img, imgExt); // filename without extension
            const sanitizedImgName = sanitize(imgName);

            // 1. Exact match of sanitized strings
            if (sanitizedImgName === sanitizedTitle) return true;

            // 2. Mutual inclusion (Project title in Image OR Image in Project Title)
            // Ensure length > 3 to avoid matching "C" inside "Cankal" falsely if short
            if (sanitizedImgName.length > 3 && sanitizedTitle.includes(sanitizedImgName)) return true;
            if (sanitizedTitle.length > 3 && sanitizedImgName.includes(sanitizedTitle)) return true;

            return false;
        });

        return match || '';
    };

    // Merge Base Projects and CSV Projects to preserve manually added items
    let allProjects = [];

    // 1. Add existing projects from base JSON
    if (baseData.portfolio && baseData.portfolio.projects) {
        allProjects = [...baseData.portfolio.projects];
    }

    // 2. Add/Update projects from CSV
    projects.forEach(p => {
        const title = p['Title'];
        // Dedupe by title (case-insensitive)
        const existingIndex = allProjects.findIndex(ap => ap.title && ap.title.toLowerCase() === title.toLowerCase());

        const newProject = {
            title: title,
            category: 'Project',
            image: '', // Will be re-assigned strictly
            url: p['Url'],
            description: p['Description']
        };

        if (existingIndex > -1) {
            allProjects[existingIndex] = { ...allProjects[existingIndex], ...newProject };
        } else {
            allProjects.push(newProject);
        }
    });

    // 3. Filter and Strict Image Assignment for ALL projects
    baseData.portfolio = baseData.portfolio || {};

    baseData.portfolio.projects = allProjects.map(p => {
        // Try to find strict matching image
        let validImage = assignImage(p.title);
        return { ...p, image: validImage };
    }).filter(p => p.image !== '');

    // Log results
    console.log(`Total merged projects candidates: ${allProjects.length}`);
    console.log(`Final preserved projects with images: ${baseData.portfolio.projects.length}`);
    if (allProjects.length > baseData.portfolio.projects.length) {
        console.log(`Filtered out ${allProjects.length - baseData.portfolio.projects.length} projects due to missing images.`);
    }

    // Update TESTIMONIALS (Recommendations)
    baseData.testimonials = baseData.testimonials || {};
    // LinkedIn recommendations: "Text", "First Name", "Last Name"
    const newTestimonials = recommendations.map(r => ({
        text: r['Text'],
        user: `${r['First Name']} ${r['Last Name']}`
    }));

    // Replace or append? Recommendations are specific. Let's replace to reflect "updated data".
    if (newTestimonials.length > 0) {
        baseData.testimonials.testimonials = newTestimonials;
    }

    let outputString = JSON.stringify(baseData, null, 2);
    // Replace all occurrences of uzmansoftware with cankalsoftware
    outputString = outputString.replace(/uzmansoftware/g, 'cankalsoftware');

    fs.writeFileSync(OUTPUT_FILE, outputString);
    console.log('Successfully generated resumeData.json');

} catch (err) {
    console.error('Error updating resume data:', err);
    process.exit(1);
}
