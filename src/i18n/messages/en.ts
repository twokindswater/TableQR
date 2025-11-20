const messages = {
  common: {
    brand: "TableQR",
    language: {
      label: "Language",
      placeholder: "Select language",
    },
    actions: {
      login: "Log in",
      logout: "Log out",
      loggingOut: "Signing out...",
      goToDashboard: "Go to dashboard",
      viewFeatures: "Explore features",
      retry: "Try again",
      goHome: "Back to home",
      back: "Go back",
      cancel: "Cancel",
      confirm: "Confirm",
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      create: "Create",
      manage: "Manage",
      download: "Download",
      close: "Close",
    },
    status: {
      loading: "Loading...",
      empty: "Nothing to show yet.",
    },
    toast: {
      success: "Success",
      error: "Error",
    },
    logout: {
      successTitle: "Signed out",
      successDescription: "You have been signed out safely.",
      errorTitle: "Sign-out failed",
      errorDescription: "Please try again.",
    },
    notFound: {
      heading: "We couldn't find that page",
      description: "It may have been moved or removed.",
      cta: "Back to home",
    },
    error: {
      title: "Error",
      heading: "Something went wrong",
      description: "An unexpected issue occurred. Please try again.",
      retry: "Try again",
    },
  },
  landing: {
    nav: {
      features: "Features",
      demo: "Demo",
      pricing: "Pricing",
    },
    hero: {
      badge: "QR Menu SaaS · TableQR Standard",
      title: "Run every location with a single QR menu.",
      description:
        "Edit menus, send wait alerts, and localize instantly from the web. Try every feature free for 7 days, then keep going for just $5 per month.",
      cta: {
        renew: "View billing help",
        trial: "See 7-day trial details",
        secondary: "Explore features",
      },
      status: {
        trialing: {
          countdown: "Trial ends in {days} days",
          active: "Trial in progress",
          body: "Enjoy every feature until {date}.",
        },
        active: {
          title: "TableQR Standard is active",
          body: "Multi-location tools, wait alerts, and media uploads are unlocked.",
        },
        renewal: {
          title: "Payment required",
          body: "Complete the payment to prevent any downtime.",
        },
        canceled: {
          title: "Subscription is canceled",
          body: "Restart any time and keep every piece of data.",
        },
      },
      card: {
        menuLabel: "TableQR Live Menu",
        syncLabel: "24/7 Sync",
        tableName: "Smart Table #12",
        dishes: {
          truffle: "Truffle Pasta",
          limeAde: "Lime Ade",
          updated: "Updated 5 minutes ago",
          inStock: "Fully stocked",
        },
        qrReadyLabel: "QR SCAN READY",
        qrReadyDescription: "This is what guests see right after scanning the code.",
        waitingTitle: "Realtime wait status",
        waitingBody: "Alex, your table is ready!",
      },
    },
    features: {
      sectionLabel: "Features",
      title: "Everything a digital menu needs",
      description: "Show menus with a single QR and update them from the dashboard in seconds.",
      list: {
        instantAccess: {
          title: "Instant access via QR",
          description: "No app install, no login, just scan and view.",
        },
        quickEdit: {
          title: "One-click menu edits",
          description: "Reflect price or menu changes immediately.",
        },
        multilingual: {
          title: "Built for every language",
          description: "Let the browser translate and guide global guests with ease.",
        },
        pushNotifications: {
          title: "Push alerts without an app",
          description: "Send wait number notifications straight to browsers.",
        },
        remoteManagement: {
          title: "Manage from anywhere",
          description: "Control menus and queues from an admin page.",
        },
      },
    },
    highlights: {
      sectionLabel: "Why TableQR",
      title: "See the impact within the 7-day trial",
      trial: {
        value: "7 days free",
        label: "Full access to Standard",
        description: "Multi-location and push tools included.",
      },
      coverage: {
        value: "1 QR code",
        label: "Covers every store",
        description: "Guests only need a single scan.",
      },
      updateSpeed: {
        value: "5 min → instant",
        label: "Menu update time",
        description: "Apply any change with one click.",
      },
    },
    demo: {
      sectionLabel: "Demo",
      title: "Preview",
      mobileHeading: "Mobile Menu",
      mobileMenuTitle: "Signature menu {index}",
      mobileMenuSubtitle: "Visible right after scanning",
      dashboardHeading: "Admin Dashboard",
      queueTitle: "Realtime queue",
      queueSubtitle: "Automatic push reminders",
      todayTitle: "Updates today",
      todayValue: "8 menu edits",
      visitorsTitle: "Countries served",
      visitorsValue: "5 countries",
    },
    faq: {
      sectionLabel: "FAQ",
      title: "Frequently asked questions",
      items: {
        install: {
          question: "Do I need to install anything?",
          answer: "TableQR is fully web-based. Just place the QR codes and you're live.",
        },
        language: {
          question: "Is there language support?",
          answer: "Browser-level translation lets every guest browse in their own language.",
        },
        mobile: {
          question: "Can I manage everything on my phone?",
          answer: "Yes. The dashboard is mobile-friendly, so you can control menus and queues on the go.",
        },
      },
    },
    ready: {
      sectionLabel: "Ready",
      title: "Connect your menu to the world with one QR.",
      description:
        "Build a smart, global menu experience with TableQR. Guests scan once, and you update from anywhere.",
    },
    footer: {
      terms: "Terms of Use",
      privacy: "Privacy Policy",
      contact: "Contact",
      instagram: "Instagram",
      youtube: "YouTube",
      rights: "© {year} TableQR. All rights reserved.",
    },
  },
  pricing: {
    title: "Try every feature free for 7 days.",
    subtitle: "Spin up a QR menu today and watch how quickly operations change.",
    plan: {
      tier: "TableQR Standard",
      price: "$5 per month",
      description: "Automatically continues after the trial. Cancel any time.",
      button: "Start the 7-day trial",
      benefits: [
        "Unlimited access to every feature",
        "Free for 7 days → then only $5 per month",
        "Cancel whenever you want",
      ],
    },
    toasts: {
      missingProduct: {
        title: "Checkout configuration required",
        description: "Ask an admin to verify the product ID.",
      },
      alreadyActive: {
        title: "Subscription already active",
        description: "Head to the dashboard to keep managing stores.",
      },
    },
  },
  auth: {
    login: {
      subtitle: "Smart menu management powered by QR codes",
      helper: "Sign in to start the free 7-day trial and explore every multi-store feature.",
      button: "Continue with Google",
      footnote: "Get started instantly",
      errorTitle: "Login failed",
      errorDescription: "Please try again.",
    },
  },
  dashboard: {
    stores: {
      heading: "Your stores",
      subheading: "You’re running {count} locations",
      actions: {
        add: "Add store",
        addEmpty: "Add your first store",
      },
      empty: {
        title: "No stores yet",
        description: "Register your first location to start managing menus.",
        button: "Add a store",
      },
      card: {
        noName: "Unnamed store",
        menuCount: "{count} menu items",
        manage: "Manage",
      },
      limitBanner: {
        trial: {
          title: "Add a second store after the 7-day trial begins.",
          body: "Start the trial to unlock multi-location tools, push alerts, and image uploads instantly.",
          button: "Start free trial",
        },
        renewal: {
          title: "Payment required",
          body: "Complete the payment to reactivate menu editing for every store.",
          button: "Continue payment",
        },
      },
      checkoutActions: {
        none: "Start free trial",
        trialing: "Keep trial active",
        active: "Manage subscription",
        canceled: "Resubscribe",
        past_due: "Retry payment",
        unpaid: "Retry payment",
        incomplete: "Retry payment",
        incomplete_expired: "Retry payment",
        default: "Continue payment",
      },
      upgradeDialog: {
        trial: {
          title: "Start the trial to use multi-store features",
          description: "Once the trial begins you can manage every additional store in real time.",
          action: "Start free trial",
        },
        renewal: {
          title: "Complete payment to add more stores",
          description: "Finish the payment and continue with every saved store.",
          action: "Retry payment",
        },
        canceled: {
          title: "Subscription is canceled",
          description: "Resubscribe to reactivate multi-store management and push alerts.",
          action: "Resubscribe",
        },
        default: {
          title: "Upgrade required",
          description: "A subscription is required to manage multiple stores.",
          action: "Manage subscription",
        },
      },
      billingBanner: {
        trialing: {
          titleCountdown: "Trial ends in {days} days",
          titleDefault: "Trial in progress",
          body: "Use every feature until {date}. Manage billing or cancel any time.",
          bodyNoDate: "Manage billing or cancel any time.",
          action: "Manage subscription",
        },
        active: {
          title: "{plan} active",
          body: "Multi-store tools, wait alerts, and image uploads are ready to go.",
          action: "Manage subscription",
        },
        none: {
          title: "Start for free with your first store",
          body: "Kick off the 7-day trial to unlock multi-store management and push alerts.",
          action: "Start free trial",
        },
        canceled: {
          title: "Subscription canceled",
          body: "Resubscribe to pick up right where you left off.",
          action: "Resubscribe",
          secondary: "Manage subscription",
        },
        renewal: {
          title: "Payment required",
          body: "Complete payment to keep managing every store.",
          action: "Retry payment",
          secondary: "Manage subscription",
        },
        cancellationNotice: "Cancels automatically on {date}.",
      },
      toasts: {
        loadError: {
          title: "Error",
          description: "Failed to load stores.",
        },
        checkoutMissing: {
          title: "Checkout not configured",
          description: "Ask an admin to set the Polar product ID.",
        },
        deleteUnauthorized: {
          title: "No permission to delete",
          description: "Please sign in again and try once more.",
        },
        deleteSuccess: {
          title: "Deleted",
          description: "The store was removed successfully.",
        },
        deleteError: {
          title: "Error",
          description: "Failed to delete the store.",
        },
      },
      confirmDelete: "Are you sure you want to delete this store?\nThis action cannot be undone.",
    },
    storeForm: {
      basicInfo: "Basic information",
      additionalInfo: "Additional details",
      fields: {
        name: {
          label: "Store name",
          placeholder: "e.g., Cafe Mocha",
          required: "Store name is required",
        },
        logo: {
          label: "Store logo",
          help: "Displayed as a circle (PNG, JPG)",
          alt: "Logo preview",
        },
        cover: {
          label: "Cover image",
          help: "16:9 ratio recommended (PNG, JPG)",
          alt: "Cover image preview",
        },
        phone: {
          label: "Phone number",
          placeholder: "010-1234-5678",
        },
        businessHours: {
          label: "Business hours",
          placeholder: "Mon-Fri: 09:00 - 22:00\nSat-Sun: 10:00 - 20:00",
        },
        notice: {
          label: "Notice",
          placeholder: "Share important announcements for guests.",
          hint: "Example: Parking available, pets welcome, etc.",
        },
        description: {
          label: "Store description",
          placeholder: "Describe your store for guests.",
        },
      },
      buttons: {
        cancel: "Cancel",
        create: "Create",
        update: "Save changes",
      },
      toasts: {
        uploadSuccess: "Upload complete",
        uploadSuccessDescription: "Image uploaded successfully.",
        uploadError: "Upload failed",
        uploadErrorDescription: "Could not upload the image. Please try again.",
      },
    },
    storeEditor: {
      back: "Go back",
      loading: "Loading...",
      create: {
        title: "Register a new store",
        description: "Enter the details and start managing menus.",
        successTitle: "Success",
        successDescription: "The new store has been created.",
        errorTitle: "Error",
        errorDescription: "Failed to create the store. Please try again.",
      },
      edit: {
        title: "Edit store information",
        description: "Update details for this store.",
        successTitle: "Success",
        successDescription: "The store information has been updated.",
        errorTitle: "Error",
        errorDescription: "Failed to update the store. Please try again.",
        notFound: "Store not found.",
      },
      authRequired: "You must be signed in.",
    },
    storeDetails: {
      loading: "Loading...",
      notFoundTitle: "Store not found",
      notFoundDescription: "The store you requested doesn’t exist.",
      contact: "Contact",
      hours: "Business hours",
      notice: "Notice",
      categories: "Categories",
      menus: "Menus",
      menuTab: "Menu management",
      queueTab: "Order management",
    },
  },
}

export default messages
