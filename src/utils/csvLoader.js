
// Simple CSV Parser mirroring the Node script logic
export const parseCSV = (content) => {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const result = [];
    for (let i = 1; i < lines.length; i++) {
        let currentLine = lines[i];
        if (!currentLine) continue;

        let row = [];
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

        const obj = {};
        headers.forEach((h, idx) => {
            let val = row[idx] || '';
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1);
            }
            val = val.replace(/""/g, '"');
            obj[h] = val;
        });
        result.push(obj);
    }
    return result;
};

// Fetch and parsing helpers
export const fetchAndParse = async (filename) => {
    try {
        const response = await fetch(`/cv/${filename}`);
        if (!response.ok) throw new Error(`Failed to fetch ${filename}`);
        const text = await response.text();
        return parseCSV(text);
    } catch (error) {
        console.warn(`Could not load ${filename}`, error);
        return [];
    }
};

export const loadDynamicData = async (currentData) => {
    console.log("Loading dynamic CV data...");

    // Parallel fetch for speed
    const [
        education,
        profile,
        positions,
        skills,
        certifications,
        honors,
        projects,
        volunteering,
        recommendations,
        courses
    ] = await Promise.all([
        fetchAndParse('Education.csv'),
        fetchAndParse('Profile.csv'),
        fetchAndParse('Positions.csv'),
        fetchAndParse('Skills.csv'),
        fetchAndParse('Certifications.csv'),
        fetchAndParse('Honors.csv'),
        fetchAndParse('Projects.csv'),
        fetchAndParse('Volunteering.csv'),
        fetchAndParse('Recommendations_Received.csv'),
        fetchAndParse('Courses.csv')
    ]);

    // Clone current data to avoid direct mutation
    const newData = JSON.parse(JSON.stringify(currentData));

    // Update Main (Bio)
    const profileObj = profile[0] || {};
    if (profileObj['Summary']) {
        newData.main = newData.main || {};
        newData.main.bio = profileObj['Summary'];
    }

    // Update Resume Sections
    newData.resume = newData.resume || {};

    // Education
    newData.resume.education = education.map(e => ({
        school: e['School Name'],
        degree: e['Degree Name'],
        graduated: e['End Date'] || 'Present',
        description: e['Notes'] || ''
    }));

    // Work
    newData.resume.work = positions.map(p => ({
        company: p['Company Name'],
        title: p['Title'],
        years: `${p['Started On']} - ${p['Finished On'] || 'Present'}`,
        description: p['Description']
    }));

    // Skills - preserve levels?
    const existingSkills = new Map((newData.resume.skills || []).map(s => [s.name.toLowerCase(), s.level]));
    newData.resume.skills = skills.map(s => ({
        name: s['Name'],
        level: existingSkills.get(s['Name'].toLowerCase()) || '80%'
    }));

    // Certifications
    newData.resume.certifications = certifications.map(c => ({
        name: c['Name'],
        authority: c['Authority'],
        date: c['Finished On'] || c['Started On'],
        license: c['License Number'],
        url: c['Url']
    }));

    // Honors
    newData.resume.honors = honors.map(h => ({
        title: h['Title'],
        issuer: 'LinkedIn',
        date: h['Issued On']
    }));

    // Volunteering
    newData.resume.volunteering = volunteering.map(v => ({
        organization: v['Company Name'],
        role: v['Role'],
        date: `${v['Started On']} - ${v['Finished On'] || 'Present'}`,
        description: v['Description']
    }));

    // Courses
    newData.resume.courses = courses.map(c => ({
        name: c['Name'],
        number: c['Number']
    }));

    // Update Project - Note: Dynamic Image Logic is HARD to replicate exactly without file listing
    // But we can keep existing images if title matches?
    // Or we rely on the fact that existing projects in `currentData` already have correct images
    // and we only append/update text.
    // For now, let's just merge new projects.

    // Update Testimonials
    const newTestimonials = recommendations.map(r => ({
        text: r['Text'],
        user: `${r['First Name']} ${r['Last Name']}`
    }));
    if (newTestimonials.length > 0) {
        newData.testimonials = newData.testimonials || {};
        newData.testimonials.testimonials = newTestimonials;
    }

    return newData;
};
