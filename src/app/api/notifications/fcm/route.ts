import { NextResponse } from 'next/server';

type AnyRecord = Record<string, unknown>;

interface FcmRequestBody {
  tokens?: string[];
  notification?: {
    title?: string;
    body?: string;
    sound?: string;
  };
  data?: Record<string, string>;
  android?: AnyRecord;
  apns?: AnyRecord;
  webpush?: AnyRecord;
}

const DEFAULT_FCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send';
const FCM_ENDPOINT = process.env.FCM_ENDPOINT || DEFAULT_FCM_ENDPOINT;

export async function POST(request: Request) {
  const serverKey = process.env.FCM_SERVER_KEY;

  if (!serverKey) {
    return NextResponse.json(
      { error: 'FCM_SERVER_KEY is not configured' },
      { status: 500 }
    );
  }

  let body: FcmRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const tokens = body.tokens?.filter(Boolean) ?? [];

  if (tokens.length === 0) {
    return NextResponse.json({ error: 'No tokens provided' }, { status: 400 });
  }

  const payload = {
    registration_ids: tokens,
    notification: {
      title: body.notification?.title ?? '주문 준비 완료',
      body: body.notification?.body ?? '주문이 준비되었습니다.',
      sound: body.notification?.sound ?? 'default',
    },
    data: body.data ?? {},
    android: mergeAndroid(body.android),
    apns: mergeApns(body.apns),
    webpush: mergeWebpush(body.webpush),
  };

  const response = await fetch(FCM_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `key=${serverKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: 'Failed to send FCM notification', details: errorText },
      { status: 502 }
    );
  }

  const result = await response.json();

  return NextResponse.json({ success: true, result });
}

function mergeAndroid(android?: AnyRecord) {
  const defaultAndroidNotification = {
    sound: 'default',
    default_vibrate_timings: true,
    default_sound: true,
  };

  const mergedNotification = {
    ...defaultAndroidNotification,
    ...((android?.notification as AnyRecord | undefined) ?? {}),
  };

  return {
    ...android,
    notification: mergedNotification,
  };
}

function mergeApns(apns?: AnyRecord) {
  const defaultAps = {
    sound: 'default',
  };

  const payload = (apns?.payload as AnyRecord | undefined) ?? {};
  const aps = {
    ...defaultAps,
    ...((payload.aps as AnyRecord | undefined) ?? {}),
  };

  return {
    ...apns,
    payload: {
      ...payload,
      aps,
    },
  };
}

function mergeWebpush(webpush?: AnyRecord) {
  const defaultHeaders = {
    Urgency: 'high',
  };

  const defaultNotification = {
    vibrate: [200, 100, 200, 100, 200],
    renotify: true,
    requireInteraction: true,
    sound: 'default',
  };

  const headers = {
    ...defaultHeaders,
    ...((webpush?.headers as AnyRecord | undefined) ?? {}),
  };

  const notification = {
    ...defaultNotification,
    ...((webpush?.notification as AnyRecord | undefined) ?? {}),
  };

  return {
    ...webpush,
    headers,
    notification,
  };
}
