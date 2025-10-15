import { supabase } from './supabase';

/**
 * 이미지 파일을 Supabase Storage에 업로드
 * @param storeId 스토어 ID
 * @param file 이미지 파일
 * @returns 업로드된 이미지의 URL
 */
export async function uploadMenuImage(storeId: number, file: File) {
  try {
    // 파일 이름에 타임스탬프 추가하여 유니크하게 만듦
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${storeId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file);

    if (error) throw error;

    // 이미지 URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    throw error;
  }
}

/**
 * Supabase Storage에서 이미지 삭제
 * @param imageUrl 삭제할 이미지의 URL
 */
export async function deleteMenuImage(imageUrl: string) {
  try {
    // URL에서 파일 경로 추출
    const url = new URL(imageUrl);
    const pathSegments = url.pathname.split('/');
    const filePath = pathSegments.slice(-2).join('/'); // "storeId/filename.ext"

    const { error } = await supabase.storage
      .from('menu-images')
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    throw error;
  }
}

/**
 * Base64 이미지를 File 객체로 변환
 * @param dataUrl Base64 이미지 데이터
 * @param fileName 파일 이름
 */
export function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  return fetch(dataUrl)
    .then(res => res.blob())
    .then(blob => new File([blob], fileName, { type: blob.type }));
}

/**
 * 이미지 파일의 크기와 타입 검증
 * @param file 검증할 이미지 파일
 * @returns 검증 결과 (성공 여부와 에러 메시지)
 */
export function validateImageFile(file: File) {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: '지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WEBP만 가능)',
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: '이미지 크기가 너무 큽니다. (최대 5MB)',
    };
  }

  return { isValid: true, error: null };
}
