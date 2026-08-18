import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

const ROOT = 'C:/Users/madan/my-career-ops';
const CL_DIR = join(ROOT, 'output', 'cover-letters');
const CL_PDF_DIR = join(ROOT, 'output', 'cover-letters');

const files = readdirSync(CL_DIR).filter(f => f.startsWith('cover-letter-') && f.endsWith('.md'));

function mdToHTML(md) {
  const lines = md.split('\n');
  let title = "Cover Letter — Madan Mohan CH";
  let bodyHTML = "";
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('# ')) {
      title = line.replace('# ', '');
    } else if (line.startsWith('**Position:**')) {
      bodyHTML += `<div class="meta-line">${line.replace(/\*\*/g, '<b>').replace(/\*\*/g, '</b>')}</div>`;
    } else if (line.startsWith('**Company:**') || line.startsWith('**Date:**') || line.startsWith('**Contact:**') || line.startsWith('**Credentials:**')) {
      bodyHTML += `<div class="meta-line">${line.replace(/\*\*/g, '<b>').replace(/\*\*/g, '</b>')}</div>`;
    } else if (line === '---') {
      bodyHTML += `<hr class="divider" />`;
    } else if (line.startsWith('### ')) {
      bodyHTML += `<h3 class="subheading">${line.replace('### ', '')}</h3>`;
    } else if (line.startsWith('- ')) {
      const boldFixed = line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      bodyHTML += `<li class="bullet-item">${boldFixed}</li>`;
    } else if (line.length > 0) {
      const boldFixed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      bodyHTML += `<p class="paragraph">${boldFixed}</p>`;
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @page {
    size: letter;
    margin: 0.6in 0.7in 0.6in 0.7in;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-variant-ligatures: none;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.45;
    color: #1a1e24;
    background: #ffffff;
  }
  .header-name {
    font-size: 20pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  .meta-line {
    font-size: 9pt;
    color: #334155;
    margin-bottom: 2px;
  }
  .meta-line a {
    color: #1e3a8a;
    text-decoration: none;
  }
  .divider {
    border: none;
    border-top: 1.5px solid #1e3a8a;
    margin: 12px 0 14px 0;
  }
  .paragraph {
    font-size: 9.5pt;
    color: #334155;
    margin-bottom: 10px;
    text-align: justify;
    line-height: 1.45;
  }
  .subheading {
    font-size: 10.5pt;
    font-weight: 700;
    color: #1e3a8a;
    margin-top: 12px;
    margin-bottom: 6px;
  }
  .bullet-item {
    font-size: 9.5pt;
    color: #334155;
    margin-left: 18px;
    margin-bottom: 6px;
    line-height: 1.4;
    text-align: justify;
  }
</style>
</head>
<body>
  <div class="header-name">Madan Mohan CH</div>
  ${bodyHTML}
</body>
</html>`;
}

async function renderCoverLetters() {
  console.log("🚀 Launching Playwright Chromium to render Cover Letter PDFs...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const f of files) {
    const mdPath = join(CL_DIR, f);
    const mdContent = readFileSync(mdPath, 'utf-8');
    const html = mdToHTML(mdContent);
    const baseName = f.replace('.md', '');
    const htmlPath = join(CL_DIR, `${baseName}.html`);
    const pdfPath = join(CL_DIR, `${baseName}.pdf`);

    writeFileSync(htmlPath, html, 'utf-8');
    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.6in',
        bottom: '0.6in',
        left: '0.7in',
        right: '0.7in'
      }
    });

    console.log(`✅ Generated Cover Letter PDF: ${pdfPath}`);
  }

  await browser.close();
  console.log(`\n🎉 Successfully generated all ${files.length} Cover Letter PDFs!`);
}

renderCoverLetters().catch(err => {
  console.error("❌ Cover letter PDF generation failed:", err);
  process.exit(1);
});
