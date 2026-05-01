/**
 * Formats usage alerts for Slack and Discord.
 */

export function buildSlackAlert(opts: {
  userEmail: string;
  pct: number;
  consumed: number;
  limit: number;
  unit: string;
  resetAt: string;
}) {
  const progressBar = getProgressBar(opts.pct);
  const resetDate = new Date(opts.resetAt).toLocaleDateString();

  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*⚠️ QRise Usage Alert: ${opts.pct}% Reached*`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Account: *${opts.userEmail}*\nYou have consumed *${opts.consumed.toLocaleString()}* / ${opts.limit.toLocaleString()} ${opts.unit}.\n\n${progressBar} *${opts.pct}%*`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Quota resets on ${resetDate}.`,
          },
        ],
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Upgrade Plan" },
            url: "https://qrise.app/billing",
            style: "primary",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Manage Alerts" },
            url: "https://qrise.app/usage",
          },
        ],
      },
    ],
  };
}

export function buildDiscordAlert(opts: {
  userEmail: string;
  pct: number;
  consumed: number;
  limit: number;
  unit: string;
  resetAt: string;
}) {
  const progressBar = getProgressBar(opts.pct);
  const resetDate = new Date(opts.resetAt).toLocaleDateString();

  return {
    embeds: [
      {
        title: "⚠️ Usage Alert Reached",
        color: opts.pct >= 95 ? 0xef4444 : 0xf59e0b,
        description: `Your account **${opts.userEmail}** has reached **${opts.pct}%** of its monthly quota.`,
        fields: [
          {
            name: "Consumption",
            value: `**${opts.consumed.toLocaleString()}** / ${opts.limit.toLocaleString()} ${opts.unit}\n${progressBar}`,
            inline: false,
          },
          {
            name: "Reset Date",
            value: resetDate,
            inline: true,
          },
        ],
        footer: {
          text: "QRise Automation Engine",
        },
        url: "https://qrise.app/billing",
      },
    ],
  };
}

function getProgressBar(pct: number): string {
  const totalBlocks = 10;
  const filledBlocks = Math.round((pct / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  return "▓".repeat(Math.max(0, filledBlocks)) + "░".repeat(Math.max(0, emptyBlocks));
}
