import { Client } from '@notionhq/client';

let notionClient = null;

function getClient() {
  if (!notionClient) {
    notionClient = new Client({ auth: process.env.NOTION_TOKEN });
  }
  return notionClient;
}

/**
 * Write a feedback item to the Notion database.
 * Returns the created page ID.
 */
export async function writeFeedbackItem({ data, ip, userAgent, country }) {
  const notion = getClient();
  const databaseId = process.env.NOTION_ITEMS_DB;

  if (!databaseId) {
    throw new Error('NOTION_ITEMS_DB environment variable is not set');
  }

  const feedbackId = crypto.randomUUID();

  const page = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      ID: {
        title: [{ text: { content: feedbackId } }],
      },
      'Page path': {
        rich_text: [{ text: { content: data.pagePath } }],
      },
      'Page ID': {
        rich_text: [{ text: { content: data.pageId || '' } }],
      },
      'Page title': {
        rich_text: [{ text: { content: data.pageTitle || '' } }],
      },
      Kind: {
        select: { name: data.kind },
      },
      Vote: {
        select: { name: data.vote },
      },
      Comment: {
        rich_text: [{ text: { content: data.comment || '' } }],
      },
      'User agent': {
        rich_text: [{ text: { content: (userAgent || '').slice(0, 500) } }],
      },
      Country: {
        rich_text: [{ text: { content: country || '' } }],
      },
      Status: {
        select: { name: 'new' },
      },
    },
  });

  return { id: feedbackId, notionPageId: page.id };
}
