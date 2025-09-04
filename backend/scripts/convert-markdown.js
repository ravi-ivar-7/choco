import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import hljs from 'highlight.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(lang, code).value;
    }
    return hljs.highlightAuto(code).value;
  },
  gfm: true,
  breaks: true,
  headerIds: true,
  mangle: false
});

// Paths
const docsDir = path.join(__dirname, '../public/docs');
const templatePath = path.join(docsDir, 'template.html');

// Ensure output directory exists
const outputDir = path.join(docsDir, 'view');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read template
const template = fs.readFileSync(templatePath, 'utf8');

// Process all markdown files
const mdDir = path.join(docsDir, 'md');
fs.readdir(mdDir, (err, files) => {
  if (err) {
    console.error('Error reading docs directory:', err);
    return;
  }

  const markdownFiles = files.filter(file => file.endsWith('.md') && file !== 'README.md');
  
  markdownFiles.forEach(file => {
    const filePath = path.join(mdDir, file);
    const markdown = fs.readFileSync(filePath, 'utf8');
    
    // Convert markdown to HTML
    const content = marked(markdown);
    
    // Insert content into template
    const html = template.replace('{{CONTENT}}', content);
    
    // Save as HTML
    const outputFile = path.join(outputDir, `${path.basename(file, '.md')}.html`);
    fs.writeFileSync(outputFile, html);
    
    console.log(`Converted ${file} to HTML`);
  });
  
  console.log('\nConversion complete!');  
  console.log(`Output directory: ${outputDir}`);
});
