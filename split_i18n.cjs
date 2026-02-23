const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, 'messages');

// Define the modules and their target top-level keys
const MODULE_MAPPING = {
    common: ['export', 'delete', 'userMenu'],
    home: [
        'home',
        'coreFeatures',
        'upcoming',
        'technology',
        'tools',
        'bilingual',
        'videoDubbing',
        'about',
        'contact'
    ],
    pricing: ['pricing'],
    // blog will catch explicitly defined keys plus any remaining unmapped keys
    blog: [
        'blog',
        'aeVsComfyUi',
        'video_translation_eval',
        'storyboardToPipeline',
        'SceneDetection'
    ]
};

function splitLocaleFiles() {
    const files = fs.readdirSync(MESSAGES_DIR);

    const jsonFiles = files.filter(file => file.endsWith('.json'));

    jsonFiles.forEach(fileName => {
        const locale = fileName.replace('.json', '');
        const filePath = path.join(MESSAGES_DIR, fileName);

        // Read the monolithic JSON file
        console.log(`Processing ${fileName}...`);
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const messages = JSON.parse(rawData);

        // Create the directory for the locale if it doesn't exist
        const localeDir = path.join(MESSAGES_DIR, locale);
        if (!fs.existsSync(localeDir)) {
            fs.mkdirSync(localeDir);
        }

        const outputModules = {
            common: {},
            home: {},
            pricing: {},
            blog: {}
        };

        // Keep track of mapped keys to catch unmapped ones
        const allMappedKeys = new Set([
            ...MODULE_MAPPING.common,
            ...MODULE_MAPPING.home,
            ...MODULE_MAPPING.pricing,
            ...MODULE_MAPPING.blog
        ]);

        // Distribute keys to respective modules
        for (const [key, value] of Object.entries(messages)) {
            if (MODULE_MAPPING.common.includes(key)) {
                outputModules.common[key] = value;
            } else if (MODULE_MAPPING.home.includes(key)) {
                outputModules.home[key] = value;
            } else if (MODULE_MAPPING.pricing.includes(key)) {
                outputModules.pricing[key] = value;
            } else if (MODULE_MAPPING.blog.includes(key)) {
                outputModules.blog[key] = value;
            } else {
                // Any unmapped keys will be grouped into the blog module as a fallback 
                // (as most extra keys belong to the blog posts)
                outputModules.blog[key] = value;
            }
        }

        // Write the modular JSON files into the locale directory
        for (const [moduleName, moduleData] of Object.entries(outputModules)) {
            // Only write the file if there is data for this module
            if (Object.keys(moduleData).length > 0) {
                const moduleFilePath = path.join(localeDir, `${moduleName}.json`);
                fs.writeFileSync(moduleFilePath, JSON.stringify(moduleData, null, 2), 'utf-8');
            }
        }

        console.log(`Finished processing ${fileName}. Output saved to ${localeDir}/`);
    });

    console.log("Migration script complete.");
}

splitLocaleFiles();
