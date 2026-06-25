import type { AnalysisSession } from '@/types';
import { getRiskDisplayLabel, getRiskSupportTags } from '@/utils/risk';

export function groupSessionItems(session: AnalysisSession) {
  return {
    drugs: session.items.filter((item) => item.type === 'drug'),
    foods: session.items.filter((item) => item.type === 'food'),
    supplements: session.items.filter((item) => item.type === 'supplement'),
  };
}

export function formatSessionDate(date: Date) {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function getSessionFileDatePrefix(date: Date) {
  return `${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

export function buildShareText(session: AnalysisSession) {
  const { drugs, foods, supplements } = groupSessionItems(session);
  const dateStr = formatSessionDate(session.createdAt);

  let text = `[약 조심] 약물 상호작용 분석 결과\n`;
  text += `분석 일시: ${dateStr}\n\n`;

  text += `선택 항목\n`;
  text += `- 약물 (${drugs.length}개): ${drugs.length > 0 ? drugs.map((item) => item.name).join(', ') : '없음'}\n`;
  text += `- 음식 (${foods.length}개): ${foods.length > 0 ? foods.map((item) => item.name).join(', ') : '없음'}\n`;
  text += `- 영양제 (${supplements.length}개): ${supplements.length > 0 ? supplements.map((item) => item.name).join(', ') : '없음'}\n\n`;

  if (session.results.length === 0) {
    text += `분석 결과\n`;
    text += `- 확인 정보 없음\n`;
    text += `선택한 조합에 대해 확인된 상호작용 정보가 없습니다.\n\n`;
  } else {
    text += `분석 결과 (${session.results.length}건)\n`;

    for (const result of session.results) {
      text += `[${getRiskDisplayLabel(result.severity)}] ${result.rule.subjectName} + ${result.rule.objectName}\n`;
      text += `- 설명: ${result.explanation}\n`;
      const supportTags = getRiskSupportTags(result);
      if (supportTags.length > 0) {
        text += `- 복용 가이드: ${supportTags.join(', ')}\n`;
      }
      if (result.recommendation) {
        text += `- 권고: ${result.recommendation}\n`;
      }
      text += `\n`;
    }
  }

  text += `본 정보는 의료 진단을 대체하지 않습니다. 복약 관련 결정은 반드시 의사·약사와 상담하세요.\n`;
  return text;
}

function escapeText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapText(text: string, maxChars = 42) {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    if (`${current} ${word}`.length <= maxChars) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [''];
}

function buildExportLines(session: AnalysisSession) {
  const { drugs, foods, supplements } = groupSessionItems(session);
  const lines: { text: string; variant: 'title' | 'muted' | 'body' | 'badge' }[] = [
    { text: '약 조심', variant: 'title' },
    { text: formatSessionDate(session.createdAt), variant: 'muted' },
    { text: '선택 항목', variant: 'body' },
    { text: `약물 (${drugs.length}개): ${drugs.length > 0 ? drugs.map((item) => item.name).join(', ') : '없음'}`, variant: 'body' },
    { text: `음식 (${foods.length}개): ${foods.length > 0 ? foods.map((item) => item.name).join(', ') : '없음'}`, variant: 'body' },
    { text: `영양제 (${supplements.length}개): ${supplements.length > 0 ? supplements.map((item) => item.name).join(', ') : '없음'}`, variant: 'body' },
  ];

  if (session.results.length === 0) {
    lines.push({ text: '확인 정보 없음', variant: 'badge' });
    lines.push({ text: '선택한 조합에 대해 확인된 상호작용 정보가 없습니다.', variant: 'body' });
  } else {
    session.results.forEach((result) => {
      lines.push({ text: getRiskDisplayLabel(result.severity), variant: 'badge' });
      lines.push({ text: `${result.rule.subjectName} + ${result.rule.objectName}`, variant: 'body' });
      const tags = getRiskSupportTags(result);
      if (tags.length > 0) {
        lines.push({ text: tags.join(' · '), variant: 'muted' });
      }
      if (result.recommendation) {
        lines.push({ text: result.recommendation, variant: 'body' });
      }
    });
  }

  lines.push({
    text: '본 정보는 의료 진단을 대체하지 않습니다. 복약 관련 결정은 반드시 의사·약사와 상담하세요.',
    variant: 'muted',
  });

  return lines;
}

function buildSessionSvg(session: AnalysisSession) {
  const width = 1080;
  const cardX = 32;
  const cardY = 32;
  const cardWidth = width - 64;
  const nodes: string[] = [];
  let y = 96;
  const titleFont = `font-family="Pretendard, Apple SD Gothic Neo, Noto Sans KR, sans-serif"`;

  const { drugs, foods, supplements } = groupSessionItems(session);

  nodes.push(
    `<text x="72" y="${y}" ${titleFont} font-size="34" font-weight="800" fill="#12372D">약 조심</text>`,
  );
  y += 46;
  nodes.push(
    `<text x="72" y="${y}" ${titleFont} font-size="20" font-weight="500" fill="#64748B">${escapeText(formatSessionDate(session.createdAt))}</text>`,
  );
  y += 48;

  const itemLines = [
    `약물 (${drugs.length}개): ${drugs.length > 0 ? drugs.map((item) => item.name).join(', ') : '없음'}`,
    `음식 (${foods.length}개): ${foods.length > 0 ? foods.map((item) => item.name).join(', ') : '없음'}`,
    `영양제 (${supplements.length}개): ${supplements.length > 0 ? supplements.map((item) => item.name).join(', ') : '없음'}`,
  ];
  const wrappedItemLines = itemLines.map((line) => wrapText(line, 70));
  const totalWrappedLines = wrappedItemLines.reduce((sum, lines) => sum + lines.length, 0);
  const itemCardHeight = 104 + totalWrappedLines * 30;

  nodes.push(
    `<rect x="56" y="${y - 8}" width="${width - 112}" height="${itemCardHeight}" rx="28" fill="#F8FAFC" stroke="#E2E8F0" />`,
  );
  nodes.push(
    `<text x="88" y="${y + 28}" ${titleFont} font-size="24" font-weight="700" fill="#12372D">선택 항목</text>`,
  );

  let itemY = y + 74;
  wrappedItemLines.forEach((lines) => {
    lines.forEach((wrappedLine) => {
      nodes.push(
        `<text x="88" y="${itemY}" ${titleFont} font-size="18" font-weight="600" fill="#334155">${escapeText(wrappedLine)}</text>`,
      );
      itemY += 30;
    });
    itemY += 12;
  });

  y = y + itemCardHeight + 40;

  if (session.results.length === 0) {
    nodes.push(
      `<rect x="56" y="${y}" width="${width - 112}" height="132" rx="24" fill="#FFFFFF" stroke="#E2E8F0" />`,
    );
    nodes.push(
      `<rect x="84" y="${y + 28}" width="168" height="42" rx="21" fill="#F3F4F6" />`,
    );
    nodes.push(
      `<text x="110" y="${y + 56}" ${titleFont} font-size="18" font-weight="700" fill="#4B5563">확인 정보 없음</text>`,
    );
    nodes.push(
      `<text x="84" y="${y + 96}" ${titleFont} font-size="18" font-weight="500" fill="#475569">선택한 조합에 대해 확인된 상호작용 정보가 없습니다.</text>`,
    );
    y += 164;
  } else {
    session.results.forEach((result) => {
      const tags = getRiskSupportTags(result);
      const recommendationLines = result.recommendation ? wrapText(result.recommendation, 48) : [];
      const hasBody = tags.length > 0 || recommendationLines.length > 0;
      const cardHeight = hasBody ? (89 + tags.length * 26 + recommendationLines.length * 28) : 78;

      nodes.push(
        `<rect x="56" y="${y}" width="${width - 112}" height="${cardHeight}" rx="24" fill="#FFFFFF" stroke="#E2E8F0" />`,
      );

      const badgeFill =
        getRiskDisplayLabel(result.severity) === '금기' ? '#FEE2E2' : '#FFF7ED';
      const badgeTextColor =
        getRiskDisplayLabel(result.severity) === '금기' ? '#B91C1C' : '#C2410C';
      const badgeWidth = 86;

      nodes.push(
        `<rect x="84" y="${y + 18}" width="${badgeWidth}" height="36" rx="18" fill="${badgeFill}" />`,
      );
      nodes.push(
        `<text x="${84 + Math.round(badgeWidth / 2)}" y="${y + 41}" text-anchor="middle" ${titleFont} font-size="17" font-weight="800" fill="${badgeTextColor}">${escapeText(getRiskDisplayLabel(result.severity))}</text>`,
      );
      nodes.push(
        `<text x="${84 + badgeWidth + 16}" y="${y + 41}" ${titleFont} font-size="20" font-weight="800" fill="#12372D">${escapeText(`${result.rule.subjectName} + ${result.rule.objectName}`)}</text>`,
      );

      nodes.push(
        `<line x1="84" y1="${y + 62}" x2="${width - 56}" y2="${y + 62}" stroke="#E2E8F0" stroke-width="1" />`,
      );

      let detailY = y + 94;

      tags.forEach((tag) => {
        nodes.push(
          `<text x="84" y="${detailY}" ${titleFont} font-size="15" font-weight="600" fill="#94A3B8">${escapeText('· ' + tag)}</text>`,
        );
        detailY += 26;
      });

      recommendationLines.forEach((line) => {
        nodes.push(
          `<text x="84" y="${detailY}" ${titleFont} font-size="18" font-weight="500" fill="#334155">${escapeText(line)}</text>`,
        );
        detailY += 28;
      });

      y += cardHeight + 20;
    });
  }

  const noticeY = y + 8;
  nodes.push(
    `<rect x="56" y="${noticeY}" width="${width - 112}" height="78" rx="22" fill="#FFF7ED" stroke="#FED7AA" />`,
  );
  nodes.push(
    `<text x="84" y="${noticeY + 31}" ${titleFont} font-size="15" font-weight="800" fill="#C2410C">안내</text>`,
  );
  nodes.push(
    `<text x="84" y="${noticeY + 56}" ${titleFont} font-size="16" font-weight="500" fill="#9A3412">${escapeText('본 정보는 의료 진단을 대체하지 않습니다. 복약 관련 결정은 반드시 의사·약사와 상담하세요.')}</text>`,
  );

  const height = noticeY + 148;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#F8FAFC" />
      <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${height - 64}" rx="32" fill="#FFFFFF" stroke="#E2E8F0" />
      ${nodes.join('')}
    </svg>
  `;
}

export async function downloadSessionAsImage(session: AnalysisSession, fileName: string) {
  const svg = buildSessionSvg(session);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  await new Promise<void>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const scale = 2;
      const w = image.naturalWidth || image.width;
      const h = image.naturalHeight || image.height;
      const canvas = document.createElement('canvas');
      canvas.width = w * scale;
      canvas.height = h * scale;

      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context unavailable'));
        return;
      }

      context.scale(scale, scale);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, w, h);
      context.drawImage(image, 0, 0, w, h);

      canvas.toBlob((canvasBlob) => {
        if (!canvasBlob) {
          URL.revokeObjectURL(url);
          reject(new Error('Image export failed'));
          return;
        }

        const downloadUrl = URL.createObjectURL(canvasBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(downloadUrl);
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image export failed'));
    };

    image.src = url;
  });
}

function buildPrintableHtml(session: AnalysisSession) {
  const { drugs, foods, supplements } = groupSessionItems(session);
  const resultsHtml =
    session.results.length === 0
      ? `
        <div class="result-card">
          <div class="card-header">
            <span class="badge badge-unknown">확인 정보 없음</span>
          </div>
          <p class="card-body-text">선택한 조합에 대해 확인된 상호작용 정보가 없습니다.</p>
        </div>
      `
      : session.results
          .map((result) => {
            const label = getRiskDisplayLabel(result.severity);
            const badgeClass = label === '금기' ? 'badge-critical' : 'badge-caution';
            const tags = getRiskSupportTags(result);
            const hasBody = tags.length > 0 || !!result.recommendation;
            return `
              <div class="result-card">
                <div class="card-header">
                  <span class="badge ${badgeClass}">${escapeText(label)}</span>
                  <span class="card-title">${escapeText(`${result.rule.subjectName} + ${result.rule.objectName}`)}</span>
                </div>
                ${hasBody ? `
                  <hr class="card-divider" />
                  <div class="card-body">
                    ${tags.map((t) => `<p class="card-tag">· ${escapeText(t)}</p>`).join('')}
                    ${result.recommendation ? `<p class="card-body-text">${escapeText(result.recommendation)}</p>` : ''}
                  </div>
                ` : ''}
              </div>
            `;
          })
          .join('');

  return `
    <div class="sheet">
      <div class="header">
        <h1>약 조심</h1>
        <p class="header-date">${escapeText(formatSessionDate(session.createdAt))}</p>
      </div>
      <section class="section">
        <h2>선택 항목</h2>
        <p><strong>약물 (${drugs.length}개)</strong>: ${escapeText(drugs.length > 0 ? drugs.map((item) => item.name).join(', ') : '없음')}</p>
        <p><strong>음식 (${foods.length}개)</strong>: ${escapeText(foods.length > 0 ? foods.map((item) => item.name).join(', ') : '없음')}</p>
        <p><strong>영양제 (${supplements.length}개)</strong>: ${escapeText(supplements.length > 0 ? supplements.map((item) => item.name).join(', ') : '없음')}</p>
      </section>
      <section class="section">
        <h2>분석 결과</h2>
        ${resultsHtml}
      </section>
      <div class="notice-box">
        <p class="notice-label">안내</p>
        <p class="notice-text">본 정보는 의료 진단을 대체하지 않습니다. 복약 관련 결정은 반드시 의사·약사와 상담하세요.</p>
      </div>
    </div>
  `;
}

export function saveSessionAsPdf(session: AnalysisSession, title: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const iframeWindow = iframe.contentWindow;
  if (!iframeWindow) {
    document.body.removeChild(iframe);
    throw new Error('Print frame could not be opened');
  }

  iframeWindow.document.open();
  iframeWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 24px; background: #f9fafb; font-family: Pretendard, Apple SD Gothic Neo, Noto Sans KR, sans-serif; color: #12372D; font-size: 14px; }
          .sheet { max-width: 720px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 32px; }
          .header { margin-bottom: 8px; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 800; }
          .header-date { margin: 6px 0 0; color: #64748b; font-size: 13px; }
          .section { margin-top: 20px; }
          .section h2 { margin: 0 0 10px; font-size: 16px; font-weight: 700; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
          .section p { margin: 6px 0; line-height: 1.6; font-size: 13px; }
          .result-card { margin-top: 8px; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; page-break-inside: avoid; break-inside: avoid; }
          .card-header { display: flex; align-items: center; gap: 10px; padding: 10px 14px; }
          .badge { flex-shrink: 0; display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
          .badge-critical { background: #fee2e2; color: #b91c1c; }
          .badge-caution { background: #fff7ed; color: #c2410c; }
          .badge-unknown { background: #f3f4f6; color: #6b7280; }
          .card-title { font-size: 14px; font-weight: 700; color: #12372D; }
          .card-divider { border: none; border-top: 1px solid #e2e8f0; margin: 0; }
          .card-body { padding: 7px 14px 10px; }
          .card-tag { margin: 0 0 2px; font-size: 11px; font-weight: 600; color: #94a3b8; }
          .card-body-text { margin: 2px 0 0; font-size: 13px; line-height: 1.55; color: #334155; }
          .notice-box { margin-top: 20px; padding: 12px 16px; border: 1px solid #fed7aa; border-radius: 14px; background: #fff7ed; page-break-inside: avoid; break-inside: avoid; }
          .notice-label { margin: 0 0 4px; color: #c2410c; font-size: 11px; font-weight: 800; }
          .notice-text { margin: 0; font-size: 12px; color: #9a3412; line-height: 1.6; }
          @media print {
            body { padding: 20px 24px; background: #ffffff; }
            .sheet { border: none; border-radius: 0; padding: 0; }
          }
        </style>
      </head>
      <body>${buildPrintableHtml(session)}</body>
    </html>
  `);
  iframeWindow.document.close();

  window.setTimeout(() => {
    iframeWindow.focus();
    iframeWindow.print();
    window.setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 300);
}
