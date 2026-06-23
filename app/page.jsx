"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa6";
import { useLanguage } from "@/components/shared/providers/LanguageProvider";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  FileCheck2,
  Globe,
  HeartPulse,
  Landmark,
  LayoutGrid,
  Mail,
  MessageCircleMore,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  Images,
} from "lucide-react";

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/boothbandhan?rdid=dnhwRNqualzuBtZ4&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1A14tWGin9%2F#",
    icon: FaFacebookF,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/boothbandhan?igsh=MmI2Y2NmbTVzZDFh",
    icon: FaInstagram,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@boothbandhan",
    icon: FaYoutube,
  },
];

const mobileDockItems = [
  { key: "home", href: "#top", icon: Sparkles },
  { key: "programs", href: "#programs", icon: LayoutGrid },
  { key: "gallery", href: "#gallery", icon: Images },
  { key: "about", href: "#about", icon: BadgeCheck },
  { key: "contact", href: "#contact", icon: Phone },
];

const content = {
  hi: {
    langToggle: "English",
    nav: {
      programs: "कार्यक्रम",
      process: "प्रक्रिया",
      benefits: "लाभ",
      gallery: "गैलरी",
      about: "परिचय",
      contact: "संपर्क",
    },
    login: "लॉग इन",
    heroBadge: "बूथ से भारत तक सेवा और संगठन",
    heroTitleTop: "बूथ सशक्तिकरण",
    heroTitleAccent: "एवं विकास संकल्प",
    heroTitleBottom: "अभियान",
    heroText:
      "बूथ बंधन पॉलिटिकल कंसल्टेंसी ग्राउंड-लेवल मोबिलाइजेशन, जन संवाद और जनसेवा क्रियान्वयन को एक मजबूत ढांचे में लेकर आती है।",
    explorePrograms: "कार्यक्रम देखें",
    contactTeam: "टीम से संपर्क करें",
    onGroundExecution: "जमीनी क्रियान्वयन",
    onGroundText:
      "रणनीति, सेवा पहुंच, नागरिक सहभागिता और बूथ सशक्तिकरण को एक ही मिशन डैशबोर्ड में जोड़ा जाता है।",
    initiativesEyebrow: "हमारी पहल",
    initiativesTitle: "चुनाव से लेकर जनसेवा तक एक समेकित सहयोग व्यवस्था",
    initiativesText:
      "ये कार्यक्रम राजनीतिक संपर्क को जन-केंद्रित सेवा मॉडल से जोड़ते हैं, जहां दृश्यता के साथ प्रभाव भी उतना ही महत्वपूर्ण है।",
    workflowEyebrow: "कार्यप्रणाली",
    workflowTitle: "अभियान प्रक्रिया और जन-कार्यवाही का स्पष्ट रोडमैप",
    whyEyebrow: "क्यों बूथ बंधन",
    whyTitle: "हम क्या देते हैं, एक नजर में",
    aboutEyebrow: "हमारे बारे में",
    aboutTitle:
      "जनता की सेवा, हमारा धर्म। संगठन की मजबूती, हमारा कर्तव्य।",
    aboutText:
      "बूथ बंधन एक ऐसा जन-कार्य मंच है जो पॉलिटिकल कंसल्टेंसी को केवल चुनाव प्रबंधन तक सीमित नहीं रखता। हमारी पद्धति में फील्ड इंटेलिजेंस, स्थानीय विश्वास, सेवा वितरण और डिजिटल संचार एक साथ काम करते हैं।",
    resourceTitle: "संसाधन समन्वय",
    resourceText:
      "बजट, मानवबल और संचार संसाधनों को लक्ष्य-आधारित परिणामों के अनुसार संयोजित किया जाता है।",
    executionTitle: "क्रियान्वयन अनुशासन",
    executionText:
      "रणनीति के बाद फॉलो-अप, दस्तावेज़ीकरण और समयबद्ध डिलीवरी पर समान रूप से जोर दिया जाता है।",
    focusEyebrow: "मुख्य क्षेत्र",
    focusTitle: "बूथ से जुड़ाव, समाज के कई आयाम",
    contactEyebrow: "संपर्क",
    contactTitle: "अभियान, सेवा और संगठन के लिए हमसे संपर्क करें",
    contactText:
      "यदि आप जनसंपर्क, बूथ सशक्तिकरण या मुद्दा-आधारित जमीनी अभियान पर काम करना चाहते हैं, तो हमारी टीम से सीधे जुड़ें।",
    trustTitle: "क्या आप मजबूत जनविश्वास बनाना चाहते हैं?",
    trustText:
      "ग्रासरूट रणनीति, सेवा समन्वय और संचार सहयोग एक ही स्थान पर।",
    helpDesk: "हेल्प डेस्क",
    dock: {
      home: "होम",
      programs: "कार्यक्रम",
      gallery: "गैलरी",
      about: "परिचय",
      contact: "संपर्क",
    },
    programChip: "कार्यक्रम",
    stepChip: "स्टेप",
    founderRole: "संस्थापक एवं मुख्य कार्यकारी अधिकारी",
    contactCards: [
      { title: "क्षेत्र कार्यालय", detail: "बिहार, भारत", icon: Building2 },
      { title: "कॉल / व्हाट्सऐप", detail: "+91 771-735-9980", icon: Phone },
      { title: "अभियान सहयोग", detail: "boothbandhan@gmail.com", icon: MessageCircleMore },
    ],
    initiatives: [
      {
        title: "नामांकन शुल्क",
        description: "उम्मीदवार का पूरा नामांकन शुल्क हमारी ओर से वहन किया जाएगा।",
        image: "/assests/images/Picture11.webp",
      },
      {
        title: "प्रचार सामग्री",
        description:
          "चुनावी प्रचार के लिए सैंपल बैलेट, डिजिटल और प्रिंटेड पोस्टर, बैनर और पर्चे उपलब्ध कराए जाएंगे।",
        image: "/assests/images/Picture12.webp",
      },
      {
        title: "वित्तीय सहयोग",
        description:
          "चुनाव के अंतिम चरण में क्षेत्रीय प्रबंधन और प्रचार गतिविधियों के लिए आर्थिक सहायता दी जाएगी।",
        image: "/assests/images/Picture13.webp",
      },
      {
        title: "निःशुल्क स्वास्थ्य सेवा",
        description:
          "वार्ड क्षेत्र के सभी निवासियों के लिए अस्पतालों में निःशुल्क डॉक्टर परामर्श की सुविधा।",
        image: "/assests/images/Picture14.webp",
      },
      {
        title: "प्रशासनिक सहायता",
        description:
          "सरकारी योजनाओं का लाभ दिलाने और प्रक्रियाओं में मदद के लिए हमारी टीम हमेशा तैयार रहती है।",
        image: "/assests/images/Picture15.webp",
      },
      {
        title: "डिजिटल मीडिया सहयोग",
        description:
          "सोशल मीडिया प्लेटफॉर्म और स्थानीय मीडिया चैनलों पर आपकी मजबूत उपस्थिति बनाई जाएगी।",
        image: "/assests/images/Picture16.webp",
      },
    ],
    process: [
      {
        step: "01",
        title: "पहचान और संवाद",
        description:
          "हर क्षेत्र की असली जरूरत को सुनना, समझना और प्राथमिकता के साथ दर्ज करना।",
        accent: "from-orange-500 to-amber-400",
      },
      {
        step: "02",
        title: "योजना और अमल",
        description:
          "स्थानीय जरूरतों के अनुसार अभियान, सेवा कार्यक्रम और स्वयंसेवक समन्वय तैयार करना।",
        accent: "from-emerald-600 to-lime-400",
      },
      {
        step: "03",
        title: "निगरानी और प्रभाव",
        description:
          "कार्यान्वयन के बाद प्रगति समीक्षा, जन प्रतिक्रिया और अगले कदमों की स्पष्ट रिपोर्टिंग।",
        accent: "from-sky-500 to-cyan-400",
      },
    ],
    values: [
      {
        title: "पारदर्शी व्यवस्था",
        description:
          "हर अभियान और जनसेवा पहल को संरचित योजना और स्पष्ट प्रगति के साथ चलाया जाता है।",
        icon: ShieldCheck,
      },
      {
        title: "ग्राउंड-लेवल नेटवर्क",
        description:
          "बूथ से ब्लॉक तक स्वयंसेवकों, फील्ड वर्कर्स और समन्वय टीमों का सक्रिय ढांचा।",
        icon: Users,
      },
      {
        title: "नीति से जनता तक",
        description:
          "सरकारी योजना, शिकायत सहायता और मतदाता संपर्क के बीच एक व्यावहारिक पुल तैयार किया जाता है।",
        icon: Landmark,
      },
      {
        title: "तेज संवाद",
        description:
          "कॉल, व्हाट्सऐप और डिजिटल चैनलों के माध्यम से त्वरित प्रतिक्रिया और सतत फॉलो-अप।",
        icon: MessageCircleMore,
      },
    ],
    stats: [
      { value: "360 Degree", label: "अभियान योजना" },
      { value: "24x7", label: "समन्वय सहयोग" },
      { value: "100%", label: "जमीनी फोकस" },
      { value: "1 टीम", label: "रणनीति से क्रियान्वयन" },
    ],
    focusAreas: [
      {
        title: "जन सेवा सुविधा",
        icon: HeartPulse,
        description:
          "लोगों की रोजमर्रा की परेशानियों को सही प्रक्रिया और सही कार्यालय तक पहुंचाना।",
      },
      {
        title: "बूथ और संगठन",
        icon: Building2,
        description:
          "ग्रासरूट नेटवर्क को प्रशिक्षण, समन्वय और स्थानीय भागीदारी के साथ मजबूत बनाना।",
      },
      {
        title: "जन विश्वास निर्माण",
        icon: BadgeCheck,
        description:
          "सक्रिय संवाद, दिखाई देने वाले काम और निरंतर उपस्थिति से भरोसा मजबूत करना।",
      },
    ],
  },
  en: {
    langToggle: "हिंदी",
    nav: {
      programs: "Programs",
      process: "Process",
      benefits: "Benefits",
      gallery: "Gallery",
      about: "About",
      contact: "Contact",
    },
    login: "Log In",
    heroBadge: "Service and organization from booth to Bharat",
    heroTitleTop: "Booth empowerment",
    heroTitleAccent: "and development resolve",
    heroTitleBottom: "campaign",
    heroText:
      "Booth Bandhan Political Consultancy brings ground-level mobilization, public dialogue, and public service execution into one strong framework.",
    explorePrograms: "Explore Programs",
    contactTeam: "Contact Team",
    onGroundExecution: "On-ground execution",
    onGroundText:
      "Strategy, service outreach, citizen engagement, and booth strengthening are aligned inside one mission dashboard.",
    initiativesEyebrow: "Our initiatives",
    initiativesTitle: "An integrated support system from elections to public service",
    initiativesText:
      "These programs connect political outreach with a human-centered service model where visibility and impact matter equally.",
    workflowEyebrow: "Workflow",
    workflowTitle: "A clear roadmap for campaign process and public action",
    whyEyebrow: "Why Booth Bandhan",
    whyTitle: "What we deliver at a glance",
    aboutEyebrow: "About us",
    aboutTitle:
      "Public service is our duty. Organizational strength is our commitment.",
    aboutText:
      "Booth Bandhan is a public-action platform that does not limit political consultancy to election management alone. Our approach combines field intelligence, local trust, service delivery, and digital communication in one coordinated system.",
    resourceTitle: "Resource alignment",
    resourceText:
      "Budget, manpower, and communication assets are mapped according to outcome-focused execution.",
    executionTitle: "Execution discipline",
    executionText:
      "After strategy, equal emphasis is placed on follow-up, documentation, and timeline-based delivery.",
    focusEyebrow: "Focus areas",
    focusTitle: "Many dimensions of social connection through booths",
    contactEyebrow: "Contact",
    contactTitle: "Connect with us for campaigns, service, and organization building",
    contactText:
      "If you want to work on public outreach, booth strengthening, or issue-based ground campaigns, connect directly with our team.",
    trustTitle: "Ready to build stronger public trust?",
    trustText:
      "Grassroots strategy, service alignment, and communication support in one place.",
    helpDesk: "Help Desk",
    founderRole: "Founder & CEO",
    contactCards: [
      { title: "Regional Office", detail: "Bihar, India", icon: Building2 },
      { title: "Call / WhatsApp", detail: "+91 771-735-9980", icon: Phone },
      { title: "Campaign Support", detail: "boothbandhan@gmail.com", icon: MessageCircleMore },
    ],
    dock: {
      home: "Home",
      programs: "Programs",
      gallery: "Gallery",
      about: "About",
      contact: "Contact",
    },
    programChip: "Program",
    stepChip: "Step",
    initiatives: [
      {
        title: "Nomination Fee",
        description:
          "The complete nomination fee of the candidate will be covered by us.",
        image: "/assests/images/Picture11.webp",
      },
      {
        title: "Campaign Materials",
        description:
          "Sample ballot papers, digital and printed posters, banners, and pamphlets for election campaigning.",
        image: "/assests/images/Picture12.webp",
      },
      {
        title: "Funding Support",
        description:
          "Financial assistance for constituency management and campaign activities during the final phase of the election.",
        image: "/assests/images/Picture13.webp",
      },
      {
        title: "Free Healthcare Services",
        description:
          "Free doctor consultations at hospitals for all residents of the ward.",
        image: "/assests/images/Picture14.webp",
      },
      {
        title: "Administrative Assistance",
        description:
          "Our team is always ready to help residents access and benefit from government welfare schemes.",
        image: "/assests/images/Picture15.webp",
      },
      {
        title: "Digital Media Support",
        description:
          "A strong presence for you across social media platforms and local media channels.",
        image: "/assests/images/Picture16.webp",
      },
    ],
    process: [
      {
        step: "01",
        title: "Identification and Dialogue",
        description:
          "Listening to, understanding, and documenting the real needs of each area with clear priorities.",
        accent: "from-orange-500 to-amber-400",
      },
      {
        step: "02",
        title: "Planning and Execution",
        description:
          "Designing campaigns, service programs, and volunteer coordination based on local realities.",
        accent: "from-emerald-600 to-lime-400",
      },
      {
        step: "03",
        title: "Monitoring and Impact",
        description:
          "Reviewing progress, gathering public feedback, and reporting the next steps clearly after execution.",
        accent: "from-sky-500 to-cyan-400",
      },
    ],
    values: [
      {
        title: "Transparent System",
        description:
          "Every campaign and public-service initiative is run with structured planning and visible progress.",
        icon: ShieldCheck,
      },
      {
        title: "Ground-level Network",
        description:
          "An active framework of volunteers, field workers, and coordination teams from booth to block.",
        icon: Users,
      },
      {
        title: "Policy to People",
        description:
          "A practical bridge between government schemes, grievance support, and voter outreach.",
        icon: Landmark,
      },
      {
        title: "Fast Communication",
        description:
          "Quick response and consistent follow-up through calls, WhatsApp, and digital channels.",
        icon: MessageCircleMore,
      },
    ],
    stats: [
      { value: "360 Degree", label: "Campaign planning" },
      { value: "24x7", label: "Coordination support" },
      { value: "100%", label: "Ground-focus approach" },
      { value: "1 Team", label: "Strategy to execution" },
    ],
    focusAreas: [
      {
        title: "Public Service Facilitation",
        icon: HeartPulse,
        description:
          "Helping people take everyday issues through the right process to the right offices.",
      },
      {
        title: "Booth and Organization",
        icon: Building2,
        description:
          "Strengthening the grassroots network with training, alignment, and local ownership.",
      },
      {
        title: "Public Trust Building",
        icon: BadgeCheck,
        description:
          "Building trust through active communication, visible work, and continuous presence.",
      },
    ],
  },
};

export default function Page() {
  const [showTopBar, setShowTopBar] = useState(true);
  const { language, toggleLanguage } = useLanguage();
  const lastScrollY = useRef(0);
  const copy = content[language];
  const navigationItems = [
    { label: copy.nav.programs, href: "#programs" },
    { label: copy.nav.process, href: "#process" },
    { label: copy.nav.benefits, href: "#benefits" },
    { label: copy.nav.gallery, href: "#gallery" },
    { label: copy.nav.about, href: "#about" },
    { label: copy.nav.contact, href: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 24) {
        setShowTopBar(true);
      } else if (currentScrollY > lastScrollY.current) {
        setShowTopBar(false);
      } else {
        setShowTopBar(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <main
      id="top"
      className="overflow-x-hidden bg-slate-50 pb-24 text-slate-900 md:pb-0"
    >
      <header className="fixed inset-x-0 top-0 z-50 w-full">
        <div
          className={`overflow-hidden border-orange-300/40 bg-gradient-to-r from-orange-500 to-amber-400 text-white transition-all duration-300 ${
            showTopBar ? "max-h-12 border-b opacity-100" : "max-h-0 border-b-0 opacity-0"
          }`}
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-1.5 text-xs sm:px-6 sm:text-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="hidden flex-wrap items-center gap-x-5 gap-y-2 sm:flex">
              <a
                href="tel:+917717359980"
                className="inline-flex items-center gap-2 transition hover:text-orange-50"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>+91 7717359980</span>
              </a>
              <a
                href="mailto:boothbandhan@gmail.com"
                className="inline-flex items-center gap-2 transition hover:text-orange-50"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>boothbandhan@gmail.com</span>
              </a>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-auto">
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-2.5 text-[11px] font-semibold transition hover:bg-white/20"
              >
                <Globe className="h-3.5 w-3.5" />
                {copy.langToggle}
              </button>
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10 transition hover:bg-white/20"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-b border-white/60 bg-white/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6 md:gap-4 md:py-5">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/assests/images/logo.webp"
                alt="Booth Bandhan logo"
                width={240}
                height={96}
                className="h-14 w-auto sm:h-20"
                priority
              />
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 lg:flex">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="border-b border-transparent pb-1 transition hover:border-orange-400 hover:text-orange-600"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="inline-flex rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:scale-[1.02] md:px-5 md:py-2.5"
              >
                {copy.login}
              </Link>
            </div>
          </div>

          <div className="mx-auto hidden w-full max-w-7xl gap-2 overflow-x-auto px-3 pb-3 min-[501px]:flex sm:px-6 lg:hidden">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="shrink-0 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700 shadow-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <section className="relative isolate border-b border-orange-100 pt-40 md:pt-36 bg-[radial-gradient(circle_at_top_left,_rgba(253,186,116,0.26),_transparent_28%),linear-gradient(180deg,_#fef7ed_0%,_#fff_42%,_#fff_100%)]">
        <div className="mx-auto max-w-7xl overflow-hidden px-3 sm:px-6">
          <div className="grid gap-10 rounded-[2rem] bg-white/70 py-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.35)] md:rounded-none md:bg-transparent md:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                {copy.heroBadge}
              </div>

              <h1 className="mt-6 max-w-xl text-3xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                {copy.heroTitleTop}
                <span className="block bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  {copy.heroTitleAccent}
                </span>
                {copy.heroTitleBottom}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                {copy.heroText}
              </p>

              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Link
                  href="#programs"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {copy.explorePrograms}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  <Phone className="h-4 w-4" />
                  {copy.contactTeam}
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {copy.stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-orange-100 bg-white/95 p-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.45)]"
                  >
                    <div className="text-xl font-extrabold text-orange-600 sm:text-2xl">
                      {item.value}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-10 hidden h-24 w-24 rounded-full bg-orange-200/50 blur-2xl lg:block" />
              <div className="absolute -right-4 bottom-10 hidden h-28 w-28 rounded-full bg-emerald-200/60 blur-2xl lg:block" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-3 shadow-[0_40px_100px_-40px_rgba(15,23,42,0.55)]">
                <Image
                  src="/assests/images/hero_bg.webp"
                  alt="Rural development and community outreach"
                  width={1024}
                  height={1024}
                  priority
                  className="h-full min-h-[320px] w-full rounded-[1.4rem] object-cover"
                />

                <div className="absolute inset-x-4 bottom-4 rounded-3xl border border-white/60 bg-slate-900/78 p-4 text-white backdrop-blur sm:inset-x-8 sm:bottom-8 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-orange-400/20 p-3 text-orange-200">
                      <FileCheck2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-200">
                        {copy.onGroundExecution}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-100/90">
                        {copy.onGroundText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="programs" className="mx-auto max-w-7xl px-3 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.26em] text-orange-500">
            {copy.initiativesEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            {copy.initiativesTitle}
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {copy.initiativesText}
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {copy.initiatives.map((card) => (
            <article
              key={card.title}
              className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:shadow-[0_30px_80px_-42px_rgba(249,115,22,0.45)]"
            >
              <div className="relative overflow-hidden bg-orange-50">
                <Image
                  src={card.image}
                  alt={card.title}
                  width={800}
                  height={560}
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                  {copy.programChip}
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {card.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="process"
        className="border-y border-slate-100 bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffffff_35%,_#f8fafc_100%)]"
      >
        <div className="mx-auto max-w-6xl px-3 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.26em] text-orange-500">
              {copy.workflowEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              {copy.workflowTitle}
            </h2>
          </div>

          <div className="mt-12 space-y-5">
            {copy.process.map((step) => (
              <div
                key={step.step}
                className="grid overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_28px_80px_-52px_rgba(15,23,42,0.6)] md:grid-cols-[220px_1fr]"
              >
                <div
                  className={`bg-gradient-to-br ${step.accent} p-8 text-white`}
                >
                  <div className="text-5xl font-black">{step.step}</div>
                  <div className="mt-2 text-sm font-semibold uppercase tracking-[0.25em] text-white/85">
                    {copy.stepChip}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 p-6 sm:p-8">
                  <div className="max-w-2xl">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                  <ArrowRight className="hidden h-6 w-6 shrink-0 text-orange-400 md:block" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="mx-auto max-w-7xl px-3 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.26em] text-orange-500">
            {copy.whyEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            {copy.whyTitle}
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {copy.values.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_22px_60px_-48px_rgba(15,23,42,0.5)]"
              >
                <div className="inline-flex rounded-2xl bg-orange-50 p-3 text-orange-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        id="about"
        className="border-y border-slate-100 bg-[linear-gradient(135deg,_#fff_0%,_#fffbeb_52%,_#fff7ed_100%)]"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-3 py-16 sm:px-6 sm:py-20 lg:grid-cols-[420px_1fr] lg:items-center">
          <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-4 shadow-[0_34px_90px_-48px_rgba(15,23,42,0.55)]">
            <Image
              src="/assests/images/Picture7.webp"
              alt="Founder portrait"
              width={798}
              height={996}
              className="w-full rounded-[1.5rem] object-cover"
            />
            <div className="px-3 pb-2 pt-5">
              <p className="text-2xl font-extrabold text-orange-600">
                Aditya Kumar
              </p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                {copy.founderRole}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.26em] text-orange-500">
              {copy.aboutEyebrow}
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              {copy.aboutTitle}
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
              {copy.aboutText}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-orange-100 bg-white/80 p-5">
                <div className="flex items-center gap-3 text-orange-600">
                  <CircleDollarSign className="h-5 w-5" />
                  <span className="font-bold">{copy.resourceTitle}</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {copy.resourceText}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-emerald-100 bg-white/80 p-5">
                <div className="flex items-center gap-3 text-emerald-600">
                  <BriefcaseBusiness className="h-5 w-5" />
                  <span className="font-bold">{copy.executionTitle}</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {copy.executionText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="mx-auto max-w-7xl px-3 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.26em] text-orange-500">
            {copy.focusEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            {copy.focusTitle}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3 shadow-[0_30px_90px_-56px_rgba(15,23,42,0.55)]">
            <Image
              src="/assests/images/hero_bg.webp"
              alt="Community landscape"
              width={1024}
              height={1024}
              className="h-full min-h-[340px] w-full rounded-[1.5rem] object-cover"
            />
          </div>

          <div className="grid gap-5">
            {copy.focusAreas.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-white p-3 text-orange-600 shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="bg-[linear-gradient(180deg,_#0f172a_0%,_#111827_100%)] text-white"
      >
        <div className="mx-auto max-w-7xl px-3 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.26em] text-orange-300">
              {copy.contactEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              {copy.contactTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              {copy.contactText}
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {copy.contactCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur"
                >
                  <div className="inline-flex rounded-2xl bg-orange-400/10 p-3 text-orange-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {item.title}
                  </p>
                  <p className="mt-2 text-lg font-bold text-white">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-[2rem] border border-white/10 bg-white/5 px-6 py-6 text-center md:flex-row md:text-left">
            <div>
              <p className="text-2xl font-extrabold">{copy.trustTitle}</p>
              <p className="mt-2 text-slate-300">
                {copy.trustText}
              </p>
            </div>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white transition hover:scale-[1.02]"
            >
              {copy.helpDesk}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[1.9rem] border border-white/70 bg-white/92 p-2 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.45)] backdrop-blur md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {mobileDockItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold text-slate-600 transition active:scale-95"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <Icon className="h-4 w-4" />
                </span>
                <span>{copy.dock[item.key]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
