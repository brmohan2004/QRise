export interface ActionMenuItem {
  id: string;
  label: string;
  actionType: string;
  actionValue: string;
  icon: string;
  displayOrder: number;
  color?: string;
}

export interface ActionMenuOptions {
  qrId: string;
  actions: ActionMenuItem[];
  title?: string;
  appUrl: string;
}

export function buildActionMenuPage(options: ActionMenuOptions): string {
  const { qrId, actions, title = 'Select an Action', appUrl } = options;

  const sortedActions = [...actions].sort((a, b) => a.displayOrder - b.displayOrder);

  const actionsHtml = sortedActions.map(action => {
    const iconUrl = action.icon ? `${appUrl}/icons/${action.icon}` : `${appUrl}/default-icon.png`;
    const bgColor = action.color || '#667eea';

    return `
      <a href="#" class="action-card" data-action-id="${action.id}" data-action-type="${action.actionType}" data-action-value="${action.actionValue}" style="--card-color: ${bgColor}">
        <div class="action-icon">
          <img src="${iconUrl}" alt="${action.label}" onerror="this.style.display='none'">
          ${action.icon ? '' : `<div class="icon-fallback">📋</div>`}
        </div>
        <div class="action-label">${action.label}</div>
      </a>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #f5f7fa;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      margin-bottom: 32px;
      color: #333;
      font-size: 24px;
    }
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
    }
    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: white;
      border-radius: 12px;
      padding: 24px 16px;
      text-decoration: none;
      color: #333;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
      border-top: 4px solid var(--card-color);
    }
    .action-card:active {
      transform: scale(0.96);
    }
    .action-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .action-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .icon-fallback {
      font-size: 32px;
    }
    .action-label {
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      line-height: 1.3;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <div class="actions-grid">
      ${actionsHtml}
    </div>
  </div>

  <script>
    document.querySelectorAll('.action-card').forEach(card => {
      card.addEventListener('click', async (e) => {
        e.preventDefault();
        const actionId = card.dataset.actionId;
        const actionType = card.dataset.actionType;
        const actionValue = card.dataset.actionValue;
        const qrId = '${qrId}';
        const appUrl = '${appUrl}';

        try {
          await fetch(\`\${appUrl}/api/track-action\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              qrId,
              actionId,
              actionType,
              actionValue
            })
          });
        } catch (err) {
          console.error('Failed to track action:', err);
        }

        switch(actionType) {
          case 'url':
            window.location.href = actionValue;
            break;
          case 'tel':
            window.location.href = 'tel:' + actionValue;
            break;
          case 'mailto':
            window.location.href = 'mailto:' + actionValue;
            break;
          case 'sms':
            window.location.href = 'sms:' + actionValue;
            break;
          case 'copy':
            await navigator.clipboard.writeText(actionValue);
            alert('Copied to clipboard: ' + actionValue);
            break;
          default:
            console.log('Unknown action type:', actionType);
        }
      });
    });
  </script>
</body>
</html>`;
}
