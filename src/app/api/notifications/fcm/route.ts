import { NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import { MulticastMessage } from 'firebase-admin/messaging';

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

export async function POST(request: Request) {
  // Admin SDK가 초기화되었는지 확인
  if (!admin.apps.length) {
    return NextResponse.json(
      { error: 'Firebase Admin SDK is not initialized' },
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

  // Admin SDK의 MulticastMessage 타입에 맞게 페이로드 구성
  const message: MulticastMessage = {
    tokens,
    notification: {
      title: body.notification?.title ?? '주문 준비 완료',
      body: body.notification?.body ?? '주문이 준비되었습니다.',
    },
    data: body.data ?? {},
    android: mergeAndroid(body.android),
    apns: mergeApns(body.apns),
    webpush: mergeWebpush(body.webpush),
  };
  
  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    // sendMulticast에서 sendEachForMulticast로 변경하여 개별 결과를 더 잘 처리합니다.
    // 실패한 토큰만 필터링하여 클라이언트에게 더 유용한 정보를 제공할 수 있습니다.
    const failedTokens = response.responses
      .map((resp, idx) => (resp.success ? null : tokens[idx]))
      .filter(Boolean);
      
    return NextResponse.json({ success: true, result: response, failedTokens });
  } catch (error) {
    console.error('FCM notification failed:', error);
    return NextResponse.json(
      { error: 'Failed to send FCM notification', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
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
