const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const TurndownService = require('turndown');

// Initialize Turndown to convert HTML to Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Custom rule for preserving tables
turndownService.addRule('tables', {
  filter: 'table',
  replacement: function(content, node) {
    // Keep tables as HTML for now
    return '\n\n' + node.outerHTML + '\n\n';
  }
});

async function parseWordPressXML() {
  const xmlPath = path.join(__dirname, '..', 'reference', 'sagabornd100srd.WordPress.2025-08-31.xml');
  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
  
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xmlContent);
  
  return result;
}

function cleanSlug(slug) {
  return slug
    .replace(/^[0-9]+-/, '') // Remove number prefixes like "1-"
    .replace(/^chapter-[0-9]+-/, '') // Remove "chapter-7-" prefixes
    .toLowerCase();
}

function determineContentPath(item, allItems) {
  const slug = item['wp:post_name'][0];
  const title = item.title[0];
  const parent = parseInt(item['wp:post_parent'][0]);
  
  // Find parent item
  const parentItem = allItems.find(i => parseInt(i['wp:post_id'][0]) === parent);
  
  // Special case for spells - they go in /content/spells/
  if (parentItem && parentItem['wp:post_name'][0] === '4-magic') {
    return {
      dir: path.join(__dirname, '..', 'content', 'spells'),
      filename: `${cleanSlug(slug)}.mdx`,
      type: 'spell'
    };
  }
  
  // Special case for creatures
  if (parentItem && (parentItem['wp:post_name'][0] === 'creature-compendium' || 
      parentItem['wp:post_name'][0] === 'sagaborn-d100-bestiary')) {
    return {
      dir: path.join(__dirname, '..', 'content', 'creatures'),
      filename: `${cleanSlug(slug)}.mdx`,
      type: 'creature'
    };
  }
  
  // Main chapter pages go in /content/rules/
  const chapterSlugs = [
    '1-introduction',
    '2-creating-your-character',
    '3-skills-and-talents',
    '4-magic',
    '5-equipment',
    '6-strongholds-and-homes',
    'chapter-7-system',
    '8-combat',
    '9-into-the-world',
    '10-storyguides-codex',
    'creature-compendium',
    '12-expansions',
    '3-1-talents',
    '2-3-professions'
  ];
  
  if (chapterSlugs.includes(slug)) {
    return {
      dir: path.join(__dirname, '..', 'content', 'rules'),
      filename: `${cleanSlug(slug)}.mdx`,
      type: 'chapter'
    };
  }
  
  // Sub-pages of chapters
  if (parentItem && chapterSlugs.includes(parentItem['wp:post_name'][0])) {
    return {
      dir: path.join(__dirname, '..', 'content', 'rules'),
      filename: `${cleanSlug(slug)}.mdx`,
      type: 'subpage'
    };
  }
  
  // Tools pages
  const toolSlugs = [
    'point-based-characteristic-calculator',
    'sagaborn-d100-encounter-calculator',
    'npc-and-creature-calculator',
    'talent-cards',
    'spell-card-generator',
    'sagaborn-d100-tools'
  ];
  
  if (toolSlugs.includes(slug)) {
    return {
      dir: path.join(__dirname, '..', 'content', 'tools'),
      filename: `${cleanSlug(slug)}.mdx`,
      type: 'tool'
    };
  }
  
  // Default to rules
  return {
    dir: path.join(__dirname, '..', 'content', 'rules'),
    filename: `${cleanSlug(slug)}.mdx`,
    type: 'other'
  };
}

function convertContentToMDX(item, contentType) {
  const title = item.title[0];
  const content = item['content:encoded'][0] || '';
  const slug = cleanSlug(item['wp:post_name'][0]);
  const menuOrder = item['wp:menu_order'][0] || 0;
  
  // Convert HTML to Markdown
  let markdownContent = turndownService.turndown(content);
  
  // Clean up WordPress-specific content
  markdownContent = markdownContent
    .replace(/\[caption[^\]]*\](.*?)\[\/caption\]/g, '$1') // Remove caption shortcodes
    .replace(/\[glossary[^\]]*\](.*?)\[\/glossary\]/g, '$1') // Remove glossary shortcodes
    .replace(/\[expand[^\]]*\](.*?)\[\/expand\]/g, '$1') // Remove expand shortcodes
    .replace(/\[spell[^\]]*\](.*?)\[\/spell\]/g, '**$1**') // Convert spell shortcodes to bold
    .replace(/\[table[^\]]*\](.*?)\[\/table\]/g, '$1') // Remove table shortcodes
    .replace(/<!--.*?-->/gs, '') // Remove HTML comments
    .trim();
  
  // Create frontmatter based on content type
  let frontmatter = {
    title: title,
    order: parseInt(menuOrder)
  };
  
  if (contentType === 'spell') {
    // Extract spell details from content if possible
    frontmatter.category = 'spell';
    frontmatter.description = `${title} spell for SagaBorn D100`;
  } else if (contentType === 'creature') {
    frontmatter.category = 'creature';
    frontmatter.description = `${title} creature stats for SagaBorn D100`;
  } else if (contentType === 'chapter') {
    frontmatter.category = 'chapter';
    frontmatter.description = `${title} - SagaBorn D100 SRD`;
  }
  
  // Build MDX file content
  let mdxContent = '---\n';
  for (const [key, value] of Object.entries(frontmatter)) {
    if (typeof value === 'string' && value.includes('"')) {
      mdxContent += `${key}: '${value.replace(/'/g, "\\'")}'\n`;
    } else if (typeof value === 'string') {
      mdxContent += `${key}: "${value}"\n`;
    } else {
      mdxContent += `${key}: ${value}\n`;
    }
  }
  mdxContent += '---\n\n';
  mdxContent += `# ${title}\n\n`;
  mdxContent += markdownContent;
  
  return mdxContent;
}

async function importWordPressContent() {
  console.log('Parsing WordPress XML...');
  const data = await parseWordPressXML();
  
  const channel = data.rss.channel[0];
  const items = channel.item;
  
  // Filter for published pages
  const pages = items.filter(item => 
    item['wp:post_type'][0] === 'page' &&
    item['wp:status'][0] === 'publish'
  );
  
  console.log(`Found ${pages.length} published pages to import`);
  
  // Create content directories if they don't exist
  const dirs = [
    path.join(__dirname, '..', 'content', 'rules'),
    path.join(__dirname, '..', 'content', 'spells'),
    path.join(__dirname, '..', 'content', 'creatures'),
    path.join(__dirname, '..', 'content', 'tools')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Process each page
  let imported = {
    chapters: 0,
    spells: 0,
    creatures: 0,
    tools: 0,
    other: 0
  };
  
  for (const page of pages) {
    const title = page.title[0];
    const slug = page['wp:post_name'][0];
    
    // Skip the home page and empty pages
    if (slug === 'sagaborn-d100-srd-home' || !page['content:encoded'][0]) {
      continue;
    }
    
    const pathInfo = determineContentPath(page, pages);
    const mdxContent = convertContentToMDX(page, pathInfo.type);
    
    // Write the MDX file
    const filePath = path.join(pathInfo.dir, pathInfo.filename);
    fs.writeFileSync(filePath, mdxContent);
    
    console.log(`✓ Imported: ${title} → ${path.relative(process.cwd(), filePath)}`);
    
    // Update counters
    switch(pathInfo.type) {
      case 'chapter': imported.chapters++; break;
      case 'spell': imported.spells++; break;
      case 'creature': imported.creatures++; break;
      case 'tool': imported.tools++; break;
      default: imported.other++; break;
    }
  }
  
  console.log('\n=== Import Complete ===');
  console.log(`Chapters: ${imported.chapters}`);
  console.log(`Spells: ${imported.spells}`);
  console.log(`Creatures: ${imported.creatures}`);
  console.log(`Tools: ${imported.tools}`);
  console.log(`Other: ${imported.other}`);
  console.log(`Total: ${imported.chapters + imported.spells + imported.creatures + imported.tools + imported.other}`);
}

// Run the import
importWordPressContent().catch(console.error);