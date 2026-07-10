export function baseLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f5f5f5; color: #1a1a1a; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
    .card { background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .header { background: #1a1a2e; padding: 24px 32px; text-align: center; }
    .header img { height: 36px; }
    .header-title { color: #fff; font-size: 22px; font-weight: 700; margin-top: 8px; letter-spacing: 0.5px; }
    .body { padding: 32px; }
    h2 { font-size: 20px; color: #1a1a1a; margin-bottom: 12px; }
    p { font-size: 15px; line-height: 1.6; color: #444; margin-bottom: 12px; }
    .highlight { background: #f0f7ff; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 4px; margin-bottom: 16px; }
    .highlight strong { color: #1a1a1a; }
    table.items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    table.items th { text-align: left; font-size: 13px; color: #888; padding: 6px 0; border-bottom: 1px solid #e5e7eb; }
    table.items td { padding: 10px 0; font-size: 14px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    table.items td.right { text-align: right; white-space: nowrap; }
    .total-row td { font-weight: 700; font-size: 16px; color: #1a1a1a; border-bottom: none; padding-top: 16px; }
    .btn { display: inline-block; background: #2563eb; color: #fff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 8px 0; }
    .footer { padding: 24px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 13px; color: #888; text-align: center; line-height: 1.8; }
    .footer a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="header-title">🐟 Treefish</div>
      </div>
      <div class="body">
        ${bodyHtml}
      </div>
      <div class="footer">
        <strong>Treefish</strong> – drukowane akcesoria wędkarskie<br/>
        <a href="https://treefish.pl">treefish.pl</a> | <a href="mailto:zamowienia@treefish.pl">zamowienia@treefish.pl</a><br/>
        Jeśli masz pytania, odpowiedz na tę wiadomość lub napisz do nas bezpośrednio.
      </div>
    </div>
  </div>
</body>
</html>`;
}
