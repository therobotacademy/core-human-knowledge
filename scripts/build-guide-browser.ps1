<#
.SYNOPSIS
    Builds and updates the standalone Guide Browser artifact in guides/index.html.
.DESCRIPTION
    Scans all canonical guides in guides/*.md and companion guides/*.svg, extracts
    metadata, and compiles a zero-dependency, 100% offline HTML reader application.
#>

param(
    [string]$GuidesDir = "$PSScriptRoot\..\guides",
    [string]$OutputFile = "$PSScriptRoot\..\guides\index.html"
)

$ErrorActionPreference = "Stop"

Write-Host "Scanning guides in: $GuidesDir"

$guides = @()
$mdFiles = Get-ChildItem -Path $GuidesDir -Filter "*.md" | Sort-Object Name

foreach ($file in $mdFiles) {
    if ($file.Name -match "^(\d{2})-([A-Z]+)-(.+)\.md$") {
        $id = $Matches[1]
        $type = $Matches[2]
        $slug = $Matches[3]

        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8

        # Extract title from first H1 (# Title)
        $title = "$($type): $slug"
        if ($content -match "(?m)^#\s+(.+)$") {
            $title = $Matches[1].Trim()
        }

        # Extract summary from first blockquote (> Summary)
        $summary = ""
        if ($content -match "(?m)^>\s+(.+)$") {
            $summary = $Matches[1].Trim()
        }

        # Check for companion SVG
        $svgName = "$id-$type-$slug.svg"
        $svgPath = Join-Path $GuidesDir $svgName
        $hasSvg = Test-Path $svgPath
        $svgContent = ""
        if ($hasSvg) {
            $svgContent = Get-Content -Path $svgPath -Raw -Encoding UTF8
        }

        # Build search tags
        $tags = @($type.ToLower(), $slug.Split('-'))
        if ($title -match "git") { $tags += "git" }
        if ($title -match "latex|overleaf") { $tags += "latex", "overleaf" }
        if ($title -match "spec|speckit") { $tags += "spec-kit", "sdd" }
        if ($title -match "superpowers") { $tags += "superpowers", "tdd" }

        $guideObj = [PSCustomObject]@{
            id = $id
            type = $type
            slug = $slug
            title = $title
            summary = $summary
            mdFilename = $file.Name
            svgFilename = $svgName
            hasSvg = $hasSvg
            tags = ($tags | Select-Object -Unique)
            contentMarkdown = $content
            contentSvg = $svgContent
        }

        $guides += $guideObj
        Write-Host "  -> Cataloged [$id] $($type): $title (SVG: $hasSvg)"
    }
}

$catalogJson = [PSCustomObject]@{
    version = "1.0.0"
    lastUpdated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    totalGuides = $guides.Count
    availableTypes = @("ALL", "CHEATSHEET", "TUTORIAL", "PROCEDIMIENTO", "REFERENCIA")
    guides = $guides
} | ConvertTo-Json -Depth 5 -Compress

# Escape any script tags or closing tags inside JSON string to avoid breaking HTML parser
$catalogJsonSafe = $catalogJson.Replace("</script>", "<\/script>")

$htmlTemplate = @'
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Explorador de Gu&iacute;as &middot; Core Human Knowledge</title>
  <style>
    :root {
      --c-navy: #1E3A5F;
      --c-navy-dark: #12243B;
      --c-accent-orange: #FF8C3B;
      --c-action-orange: #C2510A;
      --c-green: #0D7C5A;
      --c-green-light: #E7F1EC;
      --c-blue: #2E6B9E;
      --c-bg: #F5F2EC;
      --c-surface: #FFFFFF;
      --c-panel: #FAFAF7;
      --c-border: #E8E3D8;
      --c-text: #1F2937;
      --c-text-muted: #6B7280;
      --font-ui: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: Consolas, 'Courier New', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-ui);
      background-color: var(--c-bg);
      color: var(--c-text);
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background-color: var(--c-navy);
      color: #fff;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      border-left: 6px solid var(--c-accent-orange);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 800;
      font-size: 16px;
      letter-spacing: 0.02em;
    }
    .brand-sub {
      color: #9AB0C8;
      font-size: 12px;
      font-weight: normal;
      margin-left: 8px;
    }
    .badge-count {
      background: rgba(255,255,255,0.15);
      color: #fff;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
    }
    .container {
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      padding: 24px;
      flex: 1;
    }
    /* Toolbar / Controls */
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      background: var(--c-surface);
      padding: 16px 20px;
      border-radius: 8px;
      border: 1px solid var(--c-border);
    }
    .search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
      max-width: 480px;
    }
    .search-box input {
      width: 100%;
      padding: 10px 14px 10px 36px;
      font-size: 14px;
      font-family: inherit;
      border: 1px solid var(--c-border);
      border-radius: 6px;
      background: var(--c-panel);
      outline: none;
      transition: all 0.15s;
    }
    .search-box input:focus {
      border-color: var(--c-blue);
      background: #fff;
      box-shadow: 0 0 0 3px rgba(46,107,158,0.15);
    }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--c-text-muted);
      font-size: 14px;
      pointer-events: none;
    }
    .shortcut-hint {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-family: var(--font-mono);
      font-size: 11px;
      background: var(--c-border);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--c-text-muted);
      pointer-events: none;
    }
    .filter-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .chip {
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid var(--c-border);
      background: var(--c-panel);
      color: var(--c-text-muted);
      transition: all 0.15s;
      user-select: none;
    }
    .chip:hover {
      border-color: var(--c-navy);
      color: var(--c-navy);
    }
    .chip.active {
      background: var(--c-navy);
      color: #fff;
      border-color: var(--c-navy);
    }
    /* Catalog Grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 20px;
    }
    .card {
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
      position: relative;
    }
    .card:hover {
      transform: translateY(-2px);
      border-color: var(--c-blue);
      box-shadow: 0 6px 16px rgba(0,0,0,0.06);
    }
    .card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .card-num {
      font-family: var(--font-mono);
      font-weight: 800;
      font-size: 18px;
      color: var(--c-navy);
    }
    .card-badge {
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }
    .badge-CHEATSHEET { background: #FFF7ED; border: 1px solid var(--c-action-orange); color: #7C2D12; }
    .badge-TUTORIAL { background: #E7F1EC; border: 1px solid var(--c-green); color: #0A5C43; }
    .badge-PROCEDIMIENTO { background: #EBF3F9; border: 1px solid var(--c-blue); color: var(--c-navy); }
    .badge-REFERENCIA { background: #F3F4F6; border: 1px solid var(--c-text-muted); color: #374151; }
    .card-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--c-navy);
      margin-bottom: 8px;
      line-height: 1.35;
    }
    .card-desc {
      font-size: 13px;
      color: var(--c-text-muted);
      flex: 1;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11.5px;
      border-top: 1px solid var(--c-border);
      padding-top: 12px;
      color: var(--c-text-muted);
    }
    .svg-status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-weight: 600;
    }
    .svg-status.available { color: var(--c-green); }
    .svg-status.missing { color: #DC2626; }
    /* Reader View */
    #reader-view {
      display: none;
      flex-direction: column;
      gap: 16px;
    }
    .reader-header {
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--c-panel);
      border: 1px solid var(--c-border);
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 700;
      font-size: 13px;
      color: var(--c-navy);
    }
    .btn-back:hover {
      background: #fff;
      border-color: var(--c-navy);
    }
    .reader-title-area {
      flex: 1;
      min-width: 280px;
    }
    .reader-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--c-navy);
    }
    .reader-toggles {
      display: flex;
      background: var(--c-panel);
      border: 1px solid var(--c-border);
      border-radius: 6px;
      padding: 2px;
    }
    .toggle-btn {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: var(--c-text-muted);
    }
    .toggle-btn.active {
      background: #fff;
      color: var(--c-navy);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .reader-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      min-height: 680px;
    }
    .reader-content.mode-md-only { grid-template-columns: 1fr; }
    .reader-content.mode-md-only .pane-svg { display: none; }
    .reader-content.mode-svg-only { grid-template-columns: 1fr; }
    .reader-content.mode-svg-only .pane-md { display: none; }
    .pane {
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      border-radius: 8px;
      padding: 28px;
      overflow-y: auto;
      max-height: calc(100vh - 200px);
    }
    .pane-svg {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #FAFAF7;
      padding: 20px;
    }
    .svg-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
    }
    .svg-wrapper svg {
      width: 100%;
      height: auto;
      max-width: 1200px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    /* Markdown Styles */
    .md-body h1 { font-size: 22px; color: var(--c-navy); margin-bottom: 16px; border-bottom: 2px solid var(--c-border); padding-bottom: 8px; }
    .md-body h2 { font-size: 17px; color: var(--c-navy); margin: 24px 0 12px; border-bottom: 1px solid var(--c-border); padding-bottom: 6px; }
    .md-body h3 { font-size: 15px; color: var(--c-action-orange); margin: 18px 0 8px; }
    .md-body p { margin-bottom: 14px; font-size: 14px; line-height: 1.6; }
    .md-body blockquote {
      border-left: 4px solid var(--c-accent-orange);
      padding: 8px 16px;
      background: var(--c-panel);
      margin-bottom: 16px;
      font-style: italic;
      color: #4B5563;
      border-radius: 0 6px 6px 0;
    }
    .md-body ul, .md-body ol { margin: 0 0 16px 20px; font-size: 14px; }
    .md-body li { margin-bottom: 6px; }
    .md-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 13px;
    }
    .md-body th, .md-body td {
      border: 1px solid var(--c-border);
      padding: 8px 12px;
      text-align: left;
    }
    .md-body th { background: var(--c-panel); color: var(--c-navy); font-weight: 700; }
    .md-body tr:nth-child(even) { background: #FAFAF8; }
    .code-container {
      position: relative;
      margin: 16px 0;
    }
    .code-container pre {
      background: #1F2937;
      color: #F3F4F6;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 12.5px;
      line-height: 1.5;
    }
    .copy-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      color: #fff;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-family: var(--font-ui);
    }
    .copy-btn:hover { background: rgba(255,255,255,0.3); }
    .empty-msg {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      color: var(--c-text-muted);
      font-size: 15px;
    }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <span>core-human-knowledge</span>
      <span class="brand-sub">&middot; Explorador de Gu&iacute;as y Cheatsheets</span>
    </div>
    <div class="badge-count" id="header-count">Cargando gu&iacute;as...</div>
  </header>

  <div class="container">
    <!-- Catalog View -->
    <div id="catalog-view">
      <div class="toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="search-input" placeholder="Buscar por t&iacute;tulo, comando, palabra clave..." autofocus>
          <span class="shortcut-hint">/</span>
        </div>
        <div class="filter-chips" id="filter-container"></div>
      </div>
      <div class="grid" id="guide-grid"></div>
    </div>

    <!-- Reader View -->
    <div id="reader-view">
      <div class="reader-header">
        <button class="btn-back" id="btn-back">&larr; Volver al Cat&aacute;logo <span class="shortcut-hint" style="position:static;transform:none;">Esc</span></button>
        <div class="reader-title-area">
          <div class="reader-title" id="reader-title">T&iacute;tulo</div>
        </div>
        <div class="reader-toggles">
          <button class="toggle-btn active" data-mode="split">Dividida (50/50)</button>
          <button class="toggle-btn" data-mode="md-only">Texto (MD)</button>
          <button class="toggle-btn" data-mode="svg-only">Diagrama (SVG)</button>
        </div>
      </div>

      <div class="reader-content" id="reader-layout">
        <div class="pane pane-md">
          <div class="md-body" id="md-content"></div>
        </div>
        <div class="pane pane-svg">
          <div class="svg-wrapper" id="svg-content"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Embedded Catalog Data
    const CATALOG = __CATALOG_JSON_DATA__;

    let currentFilter = 'ALL';
    let currentSearch = '';
    let currentGuide = null;
    let currentDisplayMode = 'split';

    // Init App
    function init() {
      document.getElementById('header-count').textContent = CATALOG.guides.length + ' Gu\u00EDas';
      renderFilterChips();
      renderGuideCards();
      setupEventListeners();
    }

    // Filter Chips
    function renderFilterChips() {
      const container = document.getElementById('filter-container');
      container.innerHTML = '';
      CATALOG.availableTypes.forEach(type => {
        const chip = document.createElement('div');
        chip.className = 'chip' + (type === currentFilter ? ' active' : '');
        chip.textContent = type === 'ALL' ? 'Todas' : type;
        chip.addEventListener('click', () => {
          currentFilter = type;
          document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          renderGuideCards();
        });
        container.appendChild(chip);
      });
    }

    // Catalog Grid
    function renderGuideCards() {
      const grid = document.getElementById('guide-grid');
      grid.innerHTML = '';

      const filtered = CATALOG.guides.filter(g => {
        const matchesFilter = (currentFilter === 'ALL' || g.type === currentFilter);
        const q = currentSearch.toLowerCase();
        const matchesSearch = !q || 
          g.title.toLowerCase().includes(q) || 
          g.summary.toLowerCase().includes(q) || 
          g.tags.some(t => t.toLowerCase().includes(q));
        return matchesFilter && matchesSearch;
      });

      if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-msg">No se encontraron gu\u00EDas coincidentes con tu b\u00FAsqueda.</div>';
        return;
      }

      filtered.forEach(g => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="card-meta">
            <span class="card-num">#${g.id}</span>
            <span class="card-badge badge-${g.type}">${g.type}</span>
          </div>
          <div class="card-title">${escapeHtml(g.title)}</div>
          <div class="card-desc">${escapeHtml(g.summary || 'Sin resumen disponible.')}</div>
          <div class="card-footer">
            <span class="svg-status ${g.hasSvg ? 'available' : 'missing'}">
              ${g.hasSvg ? '\u25CF Diagrama SVG incluido' : '\u25CB Sin diagrama'}
            </span>
            <span style="font-weight:700; color:var(--c-blue);">Leer gu\u00EDa &rarr;</span>
          </div>
        `;
        card.addEventListener('click', () => openReader(g));
        grid.appendChild(card);
      });
    }

    // Open Reader
    function openReader(guide) {
      currentGuide = guide;
      document.getElementById('catalog-view').style.display = 'none';
      document.getElementById('reader-view').style.display = 'flex';

      document.getElementById('reader-title').textContent = '#' + guide.id + ' \u00B7 ' + guide.title;
      document.getElementById('md-content').innerHTML = renderSimpleMarkdown(guide.contentMarkdown);

      const svgContainer = document.getElementById('svg-content');
      if (guide.hasSvg && guide.contentSvg) {
        svgContainer.innerHTML = guide.contentSvg;
      } else {
        svgContainer.innerHTML = '<div style="color:var(--c-text-muted); padding:40px; text-align:center;">Diagrama SVG pendiente para esta gu\u00EDa.</div>';
      }

      attachCopyButtons();
      window.scrollTo(0, 0);
    }

    // Back to Catalog
    function closeReader() {
      document.getElementById('reader-view').style.display = 'none';
      document.getElementById('catalog-view').style.display = 'block';
      currentGuide = null;
    }

    // Simple Markdown Renderer (Zero dependencies)
    function renderSimpleMarkdown(md) {
      if (!md) return '';
      let html = md;

      // Extract and preserve code blocks
      const codeBlocks = [];
      html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gi, (match, lang, code) => {
        const id = 'CODE_BLOCK_' + codeBlocks.length;
        codeBlocks.push({ id, lang, code: escapeHtml(code.trim()) });
        return id;
      });

      // Headers
      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

      // Blockquotes
      html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

      // Bold & Italic
      html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
      html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

      // Inline code
      html = html.replace(/`([^`]+)`/gim, '<code style="background:var(--c-panel); padding:2px 5px; border-radius:4px; font-family:var(--font-mono); font-size:12px; color:var(--c-navy);">$1</code>');

      // Tables
      html = html.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (match) => {
        const lines = match.trim().split('\n').filter(l => !l.includes('---'));
        if (lines.length === 0) return '';
        let tableHtml = '<table>';
        lines.forEach((line, idx) => {
          const cells = line.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());
          if (idx === 0) {
            tableHtml += '<thead><tr>' + cells.map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>';
          } else {
            tableHtml += '<tr>' + cells.map(c => '<td>' + c + '</td>').join('') + '</tr>';
          }
        });
        tableHtml += '</tbody></table>';
        return tableHtml;
      });

      // Paragraphs
      html = html.split('\n\n').map(block => {
        block = block.trim();
        if (!block) return '';
        if (block.startsWith('<h') || block.startsWith('<blockquote') || block.startsWith('<table') || block.startsWith('CODE_BLOCK_')) {
          return block;
        }
        if (block.startsWith('- ')) {
          const items = block.split('\n').map(li => '<li>' + li.replace(/^- /, '') + '</li>').join('');
          return '<ul>' + items + '</ul>';
        }
        return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
      }).join('\n');

      // Re-insert code blocks with copy button
      codeBlocks.forEach(b => {
        const blockHtml = `
          <div class="code-container">
            <button class="copy-btn" data-code="${escapeAttr(b.code)}">Copiar</button>
            <pre><code>${b.code}</code></pre>
          </div>
        `;
        html = html.replace(b.id, blockHtml);
      });

      return html;
    }

    function attachCopyButtons() {
      document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const code = btn.getAttribute('data-code');
          navigator.clipboard.writeText(code).then(() => {
            const original = btn.textContent;
            btn.textContent = '\u00A1Copiado! \u2713';
            btn.style.background = 'var(--c-green)';
            setTimeout(() => {
              btn.textContent = original;
              btn.style.background = '';
            }, 2000);
          });
        });
      });
    }

    function setupEventListeners() {
      // Search Input
      const searchInput = document.getElementById('search-input');
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderGuideCards();
      });

      // Back Button
      document.getElementById('btn-back').addEventListener('click', closeReader);

      // Display Mode Toggles
      document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const mode = btn.getAttribute('data-mode');
          const layout = document.getElementById('reader-layout');
          layout.className = 'reader-content mode-' + mode;
        });
      });

      // Global Shortcuts
      window.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.getElementById('catalog-view').style.display !== 'none' && document.activeElement !== searchInput) {
          e.preventDefault();
          searchInput.focus();
        } else if (e.key === 'Escape') {
          if (document.getElementById('reader-view').style.display === 'flex') {
            closeReader();
          } else if (searchInput.value) {
            searchInput.value = '';
            currentSearch = '';
            renderGuideCards();
          }
        }
      });
    }

    function escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function escapeAttr(text) {
      if (!text) return '';
      return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // Launch
    window.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>
'@

$finalHtml = $htmlTemplate.Replace('__CATALOG_JSON_DATA__', $catalogJsonSafe)
$fullOutputPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputFile)
[System.IO.File]::WriteAllText($fullOutputPath, $finalHtml, [System.Text.UTF8Encoding]::new($false))
Write-Host "Successfully generated Guide Browser at: $OutputFile"
Write-Host "Total guides indexed: $($guides.Count)"
