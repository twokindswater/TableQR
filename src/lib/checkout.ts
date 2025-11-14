export const POLAR_PRODUCT_ID =
  process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID ?? "9889da63-746a-407b-9e61-69753ca1dc8c"

export const CHECKOUT_PATH = POLAR_PRODUCT_ID ? `/api/checkout?products=${POLAR_PRODUCT_ID}` : null

