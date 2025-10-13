export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          TableQR
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          QR 코드로 시작하는 스마트 메뉴 관리
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            시작하기
          </a>
        </div>
      </div>
    </main>
  )
}

