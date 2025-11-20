const messages = {
  common: {
    brand: "TableQR",
    language: {
      label: "언어",
      placeholder: "언어 선택",
    },
    actions: {
      login: "로그인",
      logout: "로그아웃",
      loggingOut: "로그아웃 중...",
      goToDashboard: "대시보드로 이동",
      viewFeatures: "기능 살펴보기",
      retry: "다시 시도",
      goHome: "홈으로 돌아가기",
      back: "뒤로가기",
      cancel: "취소",
      confirm: "확인",
      add: "추가",
      edit: "수정",
      delete: "삭제",
      create: "생성",
      manage: "관리하기",
      download: "다운로드",
      close: "닫기",
    },
    status: {
      loading: "로딩 중...",
      empty: "표시할 내용이 없습니다.",
    },
    toast: {
      success: "성공",
      error: "오류",
    },
    logout: {
      successTitle: "로그아웃 완료",
      successDescription: "안전하게 로그아웃되었습니다.",
      errorTitle: "로그아웃 실패",
      errorDescription: "다시 시도해주세요.",
    },
    notFound: {
      heading: "페이지를 찾을 수 없습니다",
      description: "요청하신 페이지가 존재하지 않거나 이동되었습니다.",
      cta: "홈으로 돌아가기",
    },
    error: {
      title: "오류",
      heading: "문제가 발생했습니다",
      description: "일시적인 오류가 발생했습니다. 다시 시도해주세요.",
      retry: "다시 시도",
    },
  },
  landing: {
    nav: {
      features: "기능",
      demo: "데모",
      pricing: "요금제",
    },
    hero: {
      badge: "QR 메뉴 SaaS · TableQR Standard",
      title: "한 번의 QR로 다점포 운영을 끝내세요.",
      description:
        "메뉴 수정, 대기 알림, 다국어 대응까지 모두 웹에서 즉시 반영됩니다. 7일 동안 제한 없이 체험하고, 계속 쓰고 싶다면 월 $5면 충분해요.",
      cta: {
        renew: "결제 안내 보기",
        trial: "7일 무료 체험 안내",
        secondary: "기능 살펴보기",
      },
      status: {
        trialing: {
          countdown: "무료 체험 D-{days}",
          active: "무료 체험 이용 중",
          body: "{date}까지 모든 기능을 제한 없이 사용할 수 있어요.",
        },
        active: {
          title: "TableQR Standard 이용 중",
          body: "다점포, 대기 알림, 이미지 업로드까지 이미 활성화되어 있습니다.",
        },
        renewal: {
          title: "결제가 필요합니다",
          body: "결제를 완료하면 서비스가 중단되지 않고 이어집니다.",
        },
        canceled: {
          title: "구독이 해지된 상태입니다",
          body: "다시 구독하면 저장된 모든 데이터를 그대로 사용할 수 있어요.",
        },
      },
      card: {
        menuLabel: "TableQR Live Menu",
        syncLabel: "24/7 Sync",
        tableName: "스마트 테이블 #12",
        dishes: {
          truffle: "트러플 파스타",
          limeAde: "라임 에이드",
          updated: "5분 전 업데이트",
          inStock: "재고 넉넉",
        },
        qrReadyLabel: "QR SCAN READY",
        qrReadyDescription: "손님이 QR을 스캔하면 바로 이 화면을 확인합니다.",
        waitingTitle: "실시간 대기 안내",
        waitingBody: "홍길동님, 입장 준비되었어요!",
      },
    },
    features: {
      sectionLabel: "Features",
      title: "매장 운영에 필요한 디지털 메뉴의 핵심",
      description: "QR 한 번으로 메뉴를 보여주고, 관리자 페이지에서 즉시 업데이트할 수 있는 기능을 모두 담았습니다.",
      list: {
        instantAccess: {
          title: "QR 하나로 즉시 접속",
          description: "앱 설치나 로그인 없이 누구나 바로 메뉴 확인",
        },
        quickEdit: {
          title: "클릭 한 번으로 메뉴 수정",
          description: "메뉴나 가격이 바뀌면 즉시 반영",
        },
        multilingual: {
          title: "언어가 달라도 걱정 끝",
          description: "브라우저 자동 번역으로 글로벌 손님에게도 쉽게",
        },
        pushNotifications: {
          title: "푸시 알림도 앱 없이",
          description: "대기번호 알림을 브라우저로 바로 전송",
        },
        remoteManagement: {
          title: "어디서나 관리하세요",
          description: "관리자 페이지에서 메뉴·대기 모두 제어 가능",
        },
      },
    },
    highlights: {
      sectionLabel: "Why TableQR",
      title: "7일 체험으로 확인할 수 있는 변화",
      trial: {
        value: "7일 무료",
        label: "TableQR Standard 체험",
        description: "다점포·푸시 알림까지 전부 열려요.",
      },
      coverage: {
        value: "1개의 QR",
        label: "모든 매장을 커버",
        description: "고객은 QR만 스캔하면 끝.",
      },
      updateSpeed: {
        value: "5분 → 즉시",
        label: "메뉴 업데이트 시간",
        description: "변동 사항을 클릭 한 번으로 반영.",
      },
    },
    demo: {
      sectionLabel: "Demo",
      title: "미리보기",
      mobileHeading: "Mobile Menu",
      mobileMenuTitle: "시그니처 메뉴 {index}",
      mobileMenuSubtitle: "QR 스캔 즉시 노출",
      dashboardHeading: "Admin Dashboard",
      queueTitle: "실시간 대기 인원",
      queueSubtitle: "자동 푸시 알림 전송",
      todayTitle: "오늘 업데이트",
      todayValue: "8개 메뉴",
      visitorsTitle: "방문 국가",
      visitorsValue: "5개국",
    },
    faq: {
      sectionLabel: "FAQ",
      title: "자주 묻는 질문",
      items: {
        install: {
          question: "설치가 필요한가요?",
          answer: "TableQR은 100% 웹 기반이기 때문에 어떤 설치도 필요하지 않습니다. QR을 비치하기만 하면 됩니다.",
        },
        language: {
          question: "언어 지원은 되나요?",
          answer: "브라우저 자동 번역을 지원해 외국인 고객도 자신의 언어로 메뉴를 확인할 수 있습니다.",
        },
        mobile: {
          question: "스마트폰만으로 관리 가능한가요?",
          answer: "예, 관리자 페이지 역시 모바일 최적화가 되어 있어 스마트폰으로 메뉴와 대기를 제어할 수 있습니다.",
        },
      },
    },
    ready: {
      sectionLabel: "Ready",
      title: "QR 하나면 당신의 메뉴가 전 세계로 연결됩니다.",
      description:
        "TableQR로 스마트하고 글로벌한 메뉴 경험을 만들어보세요. 고객은 QR을 스캔하고, 당신은 한 번의 클릭으로 메뉴를 업데이트하면 됩니다.",
    },
    footer: {
      terms: "이용약관",
      privacy: "개인정보 처리방침",
      contact: "문의하기",
      instagram: "인스타그램",
      youtube: "유튜브",
      rights: "© {year} TableQR. 모든 권리 보유.",
    },
  },
  pricing: {
    title: "7일 동안 무료로 사용해보세요.",
    subtitle: "지금 바로 QR 메뉴판을 만들어보고 매장의 운영을 바꿔보세요.",
    plan: {
      tier: "TableQR Standard",
      price: "월 $5",
      description: "7일 무료 체험 후 자동 전환됩니다. 언제든 취소 가능해요.",
      button: "7일 무료 체험 시작",
      benefits: [
        "모든 기능 무제한 사용",
        "7일 무료 체험 → 이후 월 $5로 자동 전환",
        "언제든 취소 가능",
      ],
    },
    toasts: {
      missingProduct: {
        title: "결제 설정이 필요합니다",
        description: "관리자에게 상품 ID를 확인해달라고 요청해주세요.",
      },
      alreadyActive: {
        title: "이미 활성 상태입니다",
        description: "대시보드에서 매장을 계속 관리하세요.",
      },
    },
  },
  auth: {
    login: {
      subtitle: "QR 코드로 시작하는 스마트 메뉴 관리",
      helper: "로그인 후 7일 무료 체험을 시작하고 다점포 기능을 바로 확인해보세요.",
      button: "Google로 로그인",
      footnote: "간편하게 시작하세요",
      errorTitle: "로그인 실패",
      errorDescription: "다시 시도해주세요.",
    },
  },
  dashboard: {
    stores: {
      heading: "내 가게 목록",
      subheading: "총 {count}개의 가게를 운영 중입니다",
      actions: {
        add: "가게 추가",
        addEmpty: "가게 추가하기",
      },
      empty: {
        title: "아직 등록된 가게가 없습니다",
        description: "첫 번째 가게를 등록하고 메뉴 관리를 시작해보세요!",
        button: "가게 추가하기",
      },
      card: {
        noName: "매장명 없음",
        menuCount: "메뉴 {count}개",
        manage: "관리하기",
      },
      limitBanner: {
        trial: {
          title: "두 번째 매장은 7일 무료 체험 후 이용할 수 있어요.",
          body: "Trial을 시작하면 다점포 관리, 푸시 알림, 이미지 업로드가 즉시 열립니다.",
          button: "7일 무료 체험 시작",
        },
        renewal: {
          title: "결제가 필요한 상태입니다",
          body: "결제를 완료하면 모든 매장과 메뉴 편집 기능이 다시 활성화됩니다.",
          button: "결제 진행하기",
        },
      },
      checkoutActions: {
        none: "7일 무료 체험 시작",
        trialing: "체험 유지하기",
        active: "구독 관리하기",
        canceled: "다시 구독하기",
        past_due: "결제 다시 진행하기",
        unpaid: "결제 다시 진행하기",
        incomplete: "결제 다시 진행하기",
        incomplete_expired: "결제 다시 진행하기",
        default: "결제 진행하기",
      },
      upgradeDialog: {
        trial: {
          title: "다점포 관리는 Trial 시작 후 이용할 수 있어요",
          description: "무료 체험을 시작하면 두 번째 매장부터 실시간으로 관리할 수 있습니다.",
          action: "7일 무료 체험 시작",
        },
        renewal: {
          title: "결제를 완료해야 추가 매장을 등록할 수 있어요",
          description: "결제를 다시 진행하면 저장된 매장을 그대로 이어서 사용할 수 있습니다.",
          action: "결제 다시 진행하기",
        },
        canceled: {
          title: "구독이 해지된 상태입니다",
          description: "다시 구독하면 다점포 관리와 푸시 알림 기능이 다시 활성화됩니다.",
          action: "다시 구독하기",
        },
        default: {
          title: "업그레이드가 필요합니다",
          description: "다점포 관리 기능을 이용하려면 구독이 필요합니다.",
          action: "구독 관리하기",
        },
      },
      billingBanner: {
        trialing: {
          titleCountdown: "무료 체험 D-{days}",
          titleDefault: "무료 체험 이용 중",
          body: "{date}까지 모든 기능을 사용할 수 있어요. 결제/취소는 언제든 구독 관리에서 가능합니다.",
          bodyNoDate: "결제/취소는 언제든 구독 관리에서 가능합니다.",
          action: "구독 관리",
        },
        active: {
          title: "{plan} 이용 중",
          body: "다점포, 실시간 대기 알림, 이미지 업로드까지 모두 활성화되었습니다.",
          action: "구독 관리",
        },
        none: {
          title: "첫 매장은 무료로 시작할 수 있어요",
          body: "7일 무료 체험을 시작하면 다점포 관리와 푸시 알림이 즉시 열립니다.",
          action: "7일 무료 체험 시작",
        },
        canceled: {
          title: "구독이 해지된 상태입니다",
          body: "다시 구독하면 저장된 매장을 그대로 이어서 사용할 수 있어요.",
          action: "다시 구독하기",
          secondary: "구독 관리",
        },
        renewal: {
          title: "결제가 필요해요",
          body: "결제를 완료해야 모든 매장을 계속 관리할 수 있습니다.",
          action: "결제 다시 진행하기",
          secondary: "구독 관리",
        },
        cancellationNotice: "{date}에 자동 해지됩니다.",
      },
      toasts: {
        loadError: {
          title: "오류",
          description: "스토어 목록을 불러오는데 실패했습니다.",
        },
        checkoutMissing: {
          title: "결제 설정 필요",
          description: "관리자에게 Polar 상품 ID를 설정해달라고 요청해주세요.",
        },
        deleteUnauthorized: {
          title: "삭제 권한이 없습니다",
          description: "다시 로그인한 뒤 시도해주세요.",
        },
        deleteSuccess: {
          title: "삭제 완료",
          description: "스토어가 성공적으로 삭제되었습니다.",
        },
        deleteError: {
          title: "오류",
          description: "스토어 삭제에 실패했습니다.",
        },
      },
      confirmDelete: "정말로 이 가게를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.",
    },
    storeForm: {
      basicInfo: "기본 정보",
      additionalInfo: "추가 정보",
      fields: {
        name: {
          label: "매장명",
          placeholder: "예: 카페 모카",
          required: "매장명은 필수입니다",
        },
        logo: {
          label: "매장 로고",
          help: "원형으로 표시됩니다 (PNG, JPG)",
          alt: "로고 미리보기",
        },
        cover: {
          label: "커버 이미지",
          help: "16:9 비율 권장 (PNG, JPG)",
          alt: "커버 이미지 미리보기",
        },
        phone: {
          label: "연락처",
          placeholder: "010-1234-5678",
        },
        businessHours: {
          label: "영업시간",
          placeholder: "월-금: 09:00 - 22:00\n토-일: 10:00 - 20:00",
        },
        notice: {
          label: "주의사항",
          placeholder: "고객에게 알리고 싶은 중요한 공지사항을 입력하세요",
          hint: "예: 주차 가능, 반려동물 동반 가능 등",
        },
        description: {
          label: "매장 소개",
          placeholder: "매장에 대한 소개를 작성해주세요",
        },
      },
      buttons: {
        cancel: "취소",
        create: "등록하기",
        update: "수정하기",
      },
      toasts: {
        uploadSuccess: "업로드 성공",
        uploadSuccessDescription: "이미지가 성공적으로 업로드되었습니다.",
        uploadError: "업로드 실패",
        uploadErrorDescription: "이미지 업로드에 실패했습니다. 다시 시도해주세요.",
      },
    },
    storeEditor: {
      back: "뒤로가기",
      loading: "로딩 중...",
      create: {
        title: "새 가게 등록",
        description: "가게 정보를 입력하고 메뉴 관리를 시작하세요",
        successTitle: "성공",
        successDescription: "새로운 가게가 등록되었습니다!",
        errorTitle: "오류",
        errorDescription: "가게 등록에 실패했습니다. 다시 시도해주세요.",
      },
      edit: {
        title: "가게 정보 수정",
        description: "가게 정보를 업데이트하세요",
        successTitle: "성공",
        successDescription: "스토어 정보가 수정되었습니다!",
        errorTitle: "오류",
        errorDescription: "스토어 수정에 실패했습니다. 다시 시도해주세요.",
        notFound: "스토어를 찾을 수 없습니다.",
      },
      authRequired: "로그인이 필요합니다.",
    },
    storeDetails: {
      loading: "로딩 중...",
      notFoundTitle: "스토어를 찾을 수 없습니다",
      notFoundDescription: "요청하신 스토어가 존재하지 않습니다.",
      contact: "연락처",
      hours: "영업시간",
      notice: "주의사항",
      categories: "카테고리",
      menus: "메뉴",
      menuTab: "메뉴 관리",
      queueTab: "주문 관리",
    },
  },
}

export default messages
