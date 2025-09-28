import { createHmac, timingSafeEqual } from 'node:crypto';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';

const app = new OpenAPIHono();

const lineTextMessageSchema = z.object({
  id: z.string(),
  type: z.literal('text'),
  text: z.string(),
}).passthrough();

const lineEventSchema = z
  .object({
    type: z.literal('message'),
    replyToken: z.string(),
    timestamp: z.number(),
    source: z.object({}).passthrough(),
    message: lineTextMessageSchema,
  })
  .passthrough();

const webhookPayloadSchema = z
  .object({
    destination: z.string().optional(),
    events: z.array(lineEventSchema),
  })
  .passthrough();

const errorResponseSchema = z.object({
  error: z.string(),
});

const webhookResponseSchema = z.object({
  success: z.boolean(),
  echoed: z.number(),
  results: z.array(
    z.object({
      replyToken: z.string(),
      status: z.enum(['fulfilled', 'rejected']),
      message: z.string().optional(),
    })
  ),
});

const webhookRoute = createRoute({
  path: '/webhook',
  method: 'post',
  tags: ['LINE'],
  summary: 'LINE公式アカウントのWebhookを受け取り、テキストメッセージをそのまま返信',
  request: {
    body: {
      content: {
        'application/json': {
          schema: webhookPayloadSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'テキストメッセージをエコー返信した結果を返却',
      content: {
        'application/json': {
          schema: webhookResponseSchema,
        },
      },
    },
    400: {
      description: '不正なWebhookリクエスト',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    401: {
      description: '署名検証に失敗',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: '設定不足などで返信に失敗',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

const LINE_REPLY_ENDPOINT = 'https://api.line.me/v2/bot/message/reply';
const LINE_SIGNATURE_HEADER = 'x-line-signature';

app.openapi(webhookRoute, async (c) => {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!channelAccessToken || !channelSecret) {
    console.log('LINE_CHANNEL_ACCESS_TOKEN or LINE_CHANNEL_SECRET is not set.');
    return c.json({ error: 'LINE_CHANNEL_ACCESS_TOKEN または LINE_CHANNEL_SECRET が設定されていません。' }, 500);
  }
  
  const signature = c.req.header(LINE_SIGNATURE_HEADER);

  if (!signature) {
    console.log('Missing X-Line-Signature header.');
    return c.json({ error: 'X-Line-Signature ヘッダーが見つかりません。' }, 401);
  }

  let bodyText: string;
  try {
    bodyText = await c.req.text();
  } catch (error) {
    console.error('Failed to read LINE webhook body:', error);
    return c.json({ error: 'リクエストボディの読み取りに失敗しました。' }, 500);
  }

  if (!verifyLineSignature(bodyText, signature, channelSecret)) {
    console.log('LINE signature verification failed.');
    return c.json({ error: '署名検証に失敗しました。' }, 401);
  }

  let payload: z.infer<typeof webhookPayloadSchema>;
  try {
    const parsed = JSON.parse(bodyText || '{}');
    payload = webhookPayloadSchema.parse(parsed);
  } catch (error) {
    console.error('Invalid LINE webhook payload:', error);
    return c.json({ error: 'Webhookペイロードの形式が正しくありません。' }, 400);
  }

  console.log('Received LINE webhook payload:', JSON.stringify(payload));

  const results = await Promise.allSettled(
    payload.events.map(async (event) => {
      const replyText = await buildReplyText(event.message.text);
      const response = await fetch(LINE_REPLY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${channelAccessToken}`,
        },
        body: JSON.stringify({
          replyToken: event.replyToken,
          messages: [
            {
              type: 'text',
              text: replyText,
            },
          ],
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        console.error(`LINE API error (${response.status}): ${body}`);
        throw new Error(`LINE API error (${response.status}): ${body}`);
      }

      return event.replyToken;
    })
  );
  console.log('LINE webhook processing results:', results);

  const mappedResults = results.map((result, index) => {
    const replyToken = payload.events[index]?.replyToken ?? 'unknown';
    if (result.status === 'fulfilled') {
      return { replyToken, status: 'fulfilled' as const };
    }
    return {
      replyToken,
      status: 'rejected' as const,
      message: result.reason instanceof Error ? result.reason.message : String(result.reason),
    };
  });

  const echoedCount = mappedResults.filter((result) => result.status === 'fulfilled').length;

  const success = echoedCount === payload.events.length;

  const responseBody: z.infer<typeof webhookResponseSchema> = {
    success,
    echoed: echoedCount,
    results: mappedResults,
  };

  return c.json(responseBody, 200);
});

function verifyLineSignature(body: string, signature: string, secret: string): boolean {
  try {
    const digest = createHmac('sha256', secret).update(body).digest('base64');
    const signatureBuffer = Buffer.from(signature, 'base64');
    const digestBuffer = Buffer.from(digest, 'base64');

    if (signatureBuffer.length !== digestBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, digestBuffer);
  } catch (error) {
    console.error('LINE signature verification failed:', error);
    return false;
  }
}

async function buildReplyText(originalText: string): Promise<string> {
  if (originalText.includes('待ち時間')) {
    const waitMinutes = await getEstimatedWaitMinutes();

    if (waitMinutes === null) {
      return '現在ご案内できる空き枠がありません。後ほどお試しください。';
    }

    if (waitMinutes <= 0) {
      return 'すぐにご案内可能です。受付までお越しください。';
    }

    return `現在の待ち時間は約${waitMinutes}分です。`;
  }

  return '申し訳ありませんが、待ち時間に関するご質問のみお答えできます。';
}

async function getEstimatedWaitMinutes(): Promise<number | null> {
  const now = new Date();
  const baseline = new Date('2025-11-01T01:00:00.000Z'); // JST 2025/11/1 10:00

  const referenceTime = now > baseline ? now : baseline;

  const nextAvailableSlot = await prisma.timeSlot.findFirst({
    where: {
      status: 'AVAILABLE',
      slotTime: {
        gte: referenceTime,
      },
    },
    orderBy: {
      slotTime: 'asc',
    },
  });

  if (!nextAvailableSlot) {
    return null;
  }

  const diffMs = nextAvailableSlot.slotTime.getTime() - referenceTime.getTime();
  const diffMinutes = Math.ceil(diffMs / (1000 * 60));

  return diffMinutes < 0 ? 0 : diffMinutes;
}

export default app;
