"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa6";
import { useLanguage } from "@/components/shared/providers/LanguageProvider";
import HomeGallerySection from "@/components/website/HomeGallerySection";
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
    heroTitleTop: "बूथ बंधन प्रा. लि. में",
    heroTitleAccent: "आपका स्वागत है",
    heroTitleBottom: "",
    heroText:
      "मजबूत संगठन, जनता से सीधा संपर्क और सही डेटा की ताकत, यही है 'बूथ बंधन'।",
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
    workflowTitle: "हमारी 8-चरणीय चुनाव प्रक्रिया",
    workflowText:
      "एक संरचित, चरण-दर-चरण दृष्टिकोण - प्रारंभिक शोध से लेकर चुनाव बाद विश्लेषण तक - ताकि कुछ भी संयोग पर न छोड़ा जाए।",
    whyEyebrow: "क्यों बूथ बंधन",
    whyTitle: "क्यों चुनें बूथ बंधन",
    whyText:
      "हम जमीनी समझ को पेशेवर अनुशासन के साथ जोड़ते हैं - ऐसे परिणाम देते हैं जिन्हें सिर्फ संख्या से नहीं समझा जा सकता।",
    aboutEyebrow: "हमारे बारे में",
    aboutTitle:
      "जनता की सेवा, हमारा धर्म। संगठन की मजबूती, हमारा कर्तव्य।",
    aboutText:
      "बिहार के गांवों और कस्बों में बूथ-दर-बूथ काम कर चुकी एक टीम द्वारा निर्मित, बूथ बंधन बिखरे हुए जमीनी कार्य को एक जवाबदेह, डेटा-आधारित संगठन में बदलने के लिए अस्तित्व में है - सबसे छोटे पंचायत से लेकर राज्य की 243 विधानसभा सीटों तक।",
    resourceTitle: "संसाधन समन्वय",
    resourceText:
      "बजट, मानवबल और संचार संसाधनों को लक्ष्य-आधारित परिणामों के अनुसार संयोजित किया जाता है।",
    executionTitle: "क्रियान्वयन अनुशासन",
    executionText:
      "रणनीति के बाद फॉलो-अप, दस्तावेज़ीकरण और समयबद्ध डिलीवरी पर समान रूप से जोर दिया जाता है।",
    focusEyebrow: "मुख्य क्षेत्र",
    focusTitle: "बूथ से जुड़ाव, समाज के कई आयाम",
    impactEyebrow: "प्रभाव",
    impactTitle: "बिहार भर में सिद्ध प्रभाव",
    impactText:
      "हर संख्या जमीनी क्रियान्वयन का प्रतिनिधित्व करती है - बूथ दर बूथ, मतदाता दर मतदाता, चुनाव दर चुनाव।",
    servicesEyebrow: "सेवाएं",
    servicesTitle: "समग्र चुनाव सेवाएं",
    servicesText:
      "शोध से परिणाम तक - हर सेवा मापनीय चुनावी प्रभाव के लिए तैयार की गई है।",
    contactEyebrow: "संपर्क",
    contactTitle: "अभियान, सेवा और संगठन के लिए हमसे संपर्क करें",
    contactText:
      "यदि आप जनसंपर्क, बूथ सशक्तिकरण या मुद्दा-आधारित जमीनी अभियान पर काम करना चाहते हैं, तो हमारी टीम से सीधे जुड़ें।",
    trustTitle: "क्या आप मजबूत जनविश्वास बनाना चाहते हैं?",
    trustText:
      "बिहार में असली बदलाव बूथ से शुरू होता है - बाकी सब उसी का जोड़ है।",
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
      { step: "01", title: "शोध", description: "विधानसभा विश्लेषण और मतदाता प्रोफाइलिंग" },
      { step: "02", title: "सर्वे", description: "ओपिनियन पोल और जनभावना मानचित्रण" },
      { step: "03", title: "योजना", description: "बूथ-वार रणनीति और संसाधन आवंटन" },
      { step: "04", title: "बूथ गठन", description: "समिति निर्माण और एजेंट नियुक्ति" },
      { step: "05", title: "स्वयंसेवक प्रशिक्षण", description: "जमीनी टीम की तैयारी और अभ्यास" },
      { step: "06", title: "अभियान क्रियान्वयन", description: "मल्टी-चैनल संपर्क और संदेश प्रसार" },
      { step: "07", title: "मतदान दिवस प्रबंधन", description: "बूथ निगरानी और त्वरित प्रतिक्रिया" },
      { step: "08", title: "चुनाव बाद विश्लेषण", description: "प्रदर्शन समीक्षा और निष्कर्ष" },
    ],
    values: [
      { title: "जमीनी विशेषज्ञता", description: "बिहार के हर जिले में गहरी स्थानीय समझ", icon: Users },
      { title: "वैज्ञानिक योजना", description: "अनुभव नहीं, डेटा-आधारित कार्यप्रणाली", icon: FileCheck2 },
      { title: "डेटा आधारित निर्णय", description: "हर रणनीति सत्यापित मतदाता जानकारी पर आधारित", icon: LayoutGrid },
      { title: "पारदर्शी रिपोर्टिंग", description: "पूर्ण जवाबदेही के साथ दैनिक प्रगति अपडेट", icon: ShieldCheck },
      { title: "समर्पित टीम", description: "आपके अभियान पर पूर्ण रूप से समर्पित पेशेवर", icon: BadgeCheck },
      { title: "दैनिक मॉनिटरिंग", description: "बूथ से परिणाम तक रियल-टाइम ट्रैकिंग", icon: Phone },
    ],
    stats: [
      { value: "150+", label: "राजनीतिक प्रोजेक्ट", detail: "बिहार भर में क्रियान्वित" },
      { value: "5000+", label: "योजना बद्ध बूथ", detail: "वैज्ञानिक बूथ मैपिंग" },
      { value: "50+", label: "पेशेवर टीम", detail: "फुल-टाइम रणनीतिकार" },
      { value: "24×7", label: "वार रूम सपोर्ट", detail: "रियल-टाइम मॉनिटरिंग" },
    ],
    services: [
      { title: "चुनावी रणनीति", description: "बूथ-वार योजना और प्रतिस्पर्धी विश्लेषण", icon: BriefcaseBusiness },
      { title: "बूथ प्रबंधन", description: "बूथ समिति निर्माण और एजेंट प्रशिक्षण", icon: Building2 },
      { title: "राजनीतिक शोध", description: "जनसांख्यिकीय और मतदाता व्यवहार विश्लेषण", icon: BadgeCheck },
      { title: "सर्वे और एनालिटिक्स", description: "ओपिनियन पोल, जनभावना ट्रैकिंग और डेटा रिपोर्ट", icon: LayoutGrid },
      { title: "अभियान ब्रांडिंग", description: "उम्मीदवार पहचान, पोस्टर और विजुअल संचार", icon: Images },
      { title: "सोशल मीडिया प्रबंधन", description: "कंटेंट, विज्ञापन और डिजिटल आउटरीच", icon: Globe },
      { title: "स्वयंसेवक प्रबंधन", description: "भर्ती, प्रशिक्षण और तैनाती", icon: Users },
      { title: "डोर-टू-डोर अभियान", description: "संरचित मतदाता संपर्क कार्यक्रम", icon: MessageCircleMore },
      { title: "कॉल सेंटर", description: "आउटबाउंड मतदाता संवाद और फीडबैक", icon: Phone },
      { title: "मीडिया प्रबंधन", description: "प्रेस संबंध और मीडिया रणनीति", icon: Mail },
      { title: "वार रूम", description: "24×7 रियल-टाइम चुनाव कमांड सेंटर", icon: ShieldCheck },
      { title: "उम्मीदवार छवि निर्माण", description: "व्यक्तिगत ब्रांड और जनधारणा निर्माण", icon: HeartPulse },
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
    heroTitleTop: "Welcome To Booth Bandhan Pvt. ltd.",
    heroTitleAccent: "",
    heroTitleBottom: "",
    heroText:
      "Strong organization, direct connection with people, and the power of the right data, that is 'Booth Bandhan'.",
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
    workflowTitle: "Our 8-Step Election Process",
    workflowText:
      "A structured, phase-by-phase approach - from initial research to post-election analysis - ensuring nothing is left to chance.",
    whyEyebrow: "Why Booth Bandhan",
    whyTitle: "Why Choose Booth Bandhan",
    whyText:
      "We combine grassroots intelligence with professional discipline - delivering results that numbers alone cannot capture.",
    aboutEyebrow: "About us",
    aboutTitle:
      "Public service is our duty. Organizational strength is our commitment.",
    aboutText:
      "Built by a team that has worked booth-to-booth across Bihar's villages and towns, Booth Bandhan exists to turn scattered ground work into one accountable, data-led organisation - from the smallest panchayat to the state's 243 Assembly seats.",
    resourceTitle: "Resource alignment",
    resourceText:
      "Budget, manpower, and communication assets are mapped according to outcome-focused execution.",
    executionTitle: "Execution discipline",
    executionText:
      "After strategy, equal emphasis is placed on follow-up, documentation, and timeline-based delivery.",
    focusEyebrow: "Focus areas",
    focusTitle: "Many dimensions of social connection through booths",
    impactEyebrow: "Impact",
    impactTitle: "Proven Impact Across Bihar",
    impactText:
      "Every number represents ground-level execution - booth by booth, voter by voter, election by election.",
    servicesEyebrow: "Services",
    servicesTitle: "End-to-End Election Services",
    servicesText:
      "From research to results - every service designed for measurable electoral impact.",
    contactEyebrow: "Contact",
    contactTitle: "Connect with us for campaigns, service, and organization building",
    contactText:
      "If you want to work on public outreach, booth strengthening, or issue-based ground campaigns, connect directly with our team.",
    trustTitle: "Ready to build stronger public trust?",
    trustText:
      "Real change in Bihar starts at the booth - everything else is just the sum of it.",
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
      { step: "01", title: "Research", description: "Constituency analysis and voter profiling" },
      { step: "02", title: "Survey", description: "Opinion polls and sentiment mapping" },
      { step: "03", title: "Planning", description: "Booth-wise strategy and resource allocation" },
      { step: "04", title: "Booth Formation", description: "Committee setup and agent assignment" },
      { step: "05", title: "Volunteer Training", description: "Ground team preparation and drills" },
      { step: "06", title: "Campaign Execution", description: "Multi-channel outreach and messaging" },
      { step: "07", title: "Election Day Management", description: "Booth monitoring and rapid response" },
      { step: "08", title: "Post Election Analysis", description: "Performance review and insights" },
    ],
    values: [
      { title: "Grassroots Expertise", description: "Deep local knowledge across every Bihar district", icon: Users },
      { title: "Scientific Planning", description: "Methodology backed by data, not intuition", icon: FileCheck2 },
      { title: "Data Driven Decisions", description: "Every strategy anchored in verified voter intelligence", icon: LayoutGrid },
      { title: "Transparent Reporting", description: "Daily progress updates with full accountability", icon: ShieldCheck },
      { title: "Dedicated Team", description: "Fully committed professionals on your campaign", icon: BadgeCheck },
      { title: "Daily Monitoring", description: "Real-time tracking from booth to result", icon: Phone },
    ],
    stats: [
      { value: "150+", label: "Political Projects", detail: "Delivered across Bihar" },
      { value: "5000+", label: "Booths Planned", detail: "Scientific booth mapping" },
      { value: "50+", label: "Professional Team", detail: "Full-time strategists" },
      { value: "24×7", label: "War Room Support", detail: "Real-time monitoring" },
    ],
    services: [
      { title: "Election Strategy", description: "Booth-wise planning and competitive analysis", icon: BriefcaseBusiness },
      { title: "Booth Management", description: "Booth committee formation and agent training", icon: Building2 },
      { title: "Political Research", description: "Demographic and voter behavior analysis", icon: BadgeCheck },
      { title: "Survey & Analytics", description: "Opinion polls, sentiment tracking & data reports", icon: LayoutGrid },
      { title: "Campaign Branding", description: "Candidate identity, posters & visual communication", icon: Images },
      { title: "Social Media Management", description: "Content, ads & digital outreach", icon: Globe },
      { title: "Volunteer Management", description: "Recruitment, training & deployment", icon: Users },
      { title: "Door-to-Door Campaign", description: "Structured voter contact programs", icon: MessageCircleMore },
      { title: "Call Center", description: "Outbound voter outreach & feedback", icon: Phone },
      { title: "Media Management", description: "Press relations & media strategy", icon: Mail },
      { title: "War Room", description: "24×7 real-time election command center", icon: ShieldCheck },
      { title: "Candidate Image Building", description: "Personal brand & public perception", icon: HeartPulse },
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

const sectionLabels = {
  en: {
    welcomeTo: "Welcome To",
    registerNow: "Register Now",
    joinMovement: "Join the Movement",
    knowMore: "Know More",
    founder: "Founder",
    founderTitle: "A Visionary Leader With A Mission For Bihar",
    responsibility: "Our Responsibility",
    process: "Process",
    whatWeOffer: "What We Offer",
    quickLinks: "Quick Links",
    ourInitiatives: "Our Initiatives",
    contactUs: "Contact Us",
    footerTitle: "Let's Build a Stronger",
    footerTagline: "Empowering Wards. Strengthening Democracy.",
    footerRights: "© 2026 Boothbandhan. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    terms: "Terms & Conditions",
  },
  hi: {
    welcomeTo: "आपका स्वागत है",
    registerNow: "अभी रजिस्टर करें",
    joinMovement: "अभियान से जुड़ें",
    knowMore: "और जानें",
    founder: "संस्थापक",
    founderTitle: "बिहार के लिए मिशन के साथ एक दूरदर्शी नेता",
    responsibility: "हमारी जिम्मेदारी",
    process: "प्रक्रिया",
    whatWeOffer: "हम क्या देते हैं",
    quickLinks: "त्वरित लिंक",
    ourInitiatives: "हमारी पहल",
    contactUs: "संपर्क करें",
    footerTitle: "आइए एक मजबूत",
    footerTagline: "वार्ड बनाएं, लोकतंत्र मजबूत करें।",
    footerRights: "© 2026 Boothbandhan. सर्वाधिकार सुरक्षित।",
    privacyPolicy: "गोपनीयता नीति",
    terms: "नियम और शर्तें",
  },
};

export default function Page() {
  const [showTopBar, setShowTopBar] = useState(true);
  const { language, setLanguage, toggleLanguage } = useLanguage();
  const lastScrollY = useRef(0);
  const copy = content[language];
  const labels = sectionLabels[language] || sectionLabels.en;
  const navigationItems = [
    { label: copy.nav.programs, href: "#programs" },
    { label: copy.nav.process, href: "#process" },
    { label: copy.nav.benefits, href: "#benefits" },
    { label: copy.nav.gallery, href: "#gallery" },
    { label: copy.nav.about, href: "#about" },
    { label: copy.nav.contact, href: "#contact" },
  ];
  const heroHighlights = copy.values.slice(0, 4);
  const supportHighlights = copy.focusAreas || [];

  useEffect(() => {
    setLanguage("hi");
  }, [setLanguage]);

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
      className="overflow-x-hidden bg-[linear-gradient(180deg,_#fffdf8_0%,_#fff7ef_22%,_#ffffff_42%,_#f7f8f3_100%)] pb-24 text-slate-900 md:pb-0"
    >
      <header className="fixed inset-x-0 top-0 z-50 w-full">
        <div
          className={`overflow-hidden border-orange-300/40 bg-[#0d5c45] text-white transition-all duration-300 ${
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
                className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 text-[11px] font-semibold transition hover:bg-white/20"
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
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-white/10 transition hover:bg-white/20"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-b border-[#dfe7dd] bg-white/92 backdrop-blur">
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

            <nav className="hidden items-center gap-6 text-base font-semibold text-slate-700 lg:flex">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="border-b-2 border-transparent pb-1 transition hover:border-orange-400 hover:text-orange-600"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="inline-flex rounded-xl bg-[#0d5c45] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0a4a38] md:px-5 md:py-2.5"
              >
                {copy.login}
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] md:px-5 md:py-2.5"
              >
                {copy.helpDesk}
              </Link>
            </div>
          </div>

          <div className="mx-auto hidden w-full max-w-7xl gap-2 overflow-x-auto px-3 pb-3 min-[501px]:flex sm:px-6 lg:hidden">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="shrink-0 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-[#edf0e6] pt-36 md:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,_rgba(255,140,56,0.14),_transparent_34%),radial-gradient(circle_at_right_top,_rgba(10,74,56,0.08),_transparent_26%)]" />
        <div className="absolute left-0 top-40 hidden h-48 w-48 rounded-full border border-orange-200/40 md:block" />
        <div className="mx-auto max-w-7xl px-3 pb-10 sm:px-6 lg:pb-14">
          <div className="grid gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
            <div className="relative pt-8 lg:pt-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                {labels.welcomeTo}
              </div>

              <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[0.98] text-[#0a3f32] sm:text-6xl lg:text-[4.6rem]">
                {copy.heroTitleTop}
                {copy.heroTitleAccent ? (
                  <span className="mt-2 block text-orange-500">{copy.heroTitleAccent}</span>
                ) : null}
                {copy.heroTitleBottom ? (
                  <span className="mt-2 block text-slate-900">{copy.heroTitleBottom}</span>
                ) : null}
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                {copy.heroText}
              </p>

              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Link
                  href="#programs"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d5c45] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_36px_-20px_rgba(13,92,69,0.7)] transition hover:bg-[#0a4a38]"
                >
                  {labels.joinMovement}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#about"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0d5c45]/20 bg-white px-6 py-3.5 text-sm font-semibold text-[#0d5c45] transition hover:bg-[#f5faf7]"
                >
                  {labels.knowMore}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {heroHighlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[1.6rem] border border-[#e7ece3] bg-white/95 p-5 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.28)]"
                    >
                      <div className="inline-flex rounded-full bg-[#f3faf7] p-3 text-[#0d5c45]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-base font-bold leading-6 text-slate-900">
                        {item.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative lg:pt-10">
              <div className="absolute inset-y-12 left-4 hidden w-6 rounded-full bg-orange-500 lg:block" />
              <div className="absolute inset-y-6 left-8 hidden w-5 rounded-full bg-[#0d5c45] lg:block" />
              <div className="relative overflow-hidden rounded-[2.3rem] border border-[#e6e3dc] bg-white p-3 shadow-[0_36px_100px_-42px_rgba(15,23,42,0.42)] lg:ml-10">
                <div className="relative overflow-hidden rounded-[1.8rem]">
                  <Image
                    src="/assests/images/hero_home_20260709.webp"
                    alt="Booth Bandhan community leadership"
                    width={1024}
                    height={1024}
                    priority
                    className="h-full min-h-[360px] w-full object-cover"
                  />
                  <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] border border-white/35 bg-[#0b3b31]/82 p-4 text-white backdrop-blur sm:inset-x-6 sm:p-5">
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
        </div>
      </section>

      <section className="border-b border-[#edf0e6] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-3 py-10 sm:px-6 lg:grid-cols-[1.12fr_1.88fr] lg:items-center">
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-[1.6rem] border border-orange-100 bg-[#f8faf6] p-4 shadow-sm">
              <Image
                src="/assests/images/logo.webp"
                alt="Booth Bandhan"
                width={88}
                height={88}
                className="h-16 w-16 object-contain"
              />
            </div>
            <div className="max-w-md">
              <p className="text-3xl font-bold leading-tight text-slate-900">
                {copy.aboutTitle}
              </p>
              <p className="mt-3 text-xl font-semibold leading-8 text-orange-500">
                {copy.initiativesEyebrow} / {copy.workflowEyebrow}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {supportHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[1.7rem] border border-[#e7ece3] bg-white px-5 py-6 text-center shadow-[0_24px_50px_-44px_rgba(15,23,42,0.5)]"
                >
                  <div className="mx-auto inline-flex rounded-full bg-[#f3faf7] p-3 text-[#0d5c45]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <HomeGallerySection />

      <section
        id="about"
        className="border-y border-[#edf0e6] bg-[#0a4a38] lg:bg-[linear-gradient(90deg,_#0d5c45_0%,_#0a4a38_43%,_#f9f8f4_43%,_#f9f8f4_100%)]"
      >
        <div className="mx-auto grid max-w-7xl gap-0 px-3 py-16 sm:px-6 lg:grid-cols-[1.08fr_0.84fr_0.78fr]">
          <div className="rounded-t-[2rem] bg-transparent px-6 py-8 text-white lg:rounded-l-[2rem] lg:rounded-tr-none lg:px-10 lg:py-12">
            <p className="text-sm font-bold uppercase tracking-[0.26em] text-orange-300">
              {labels.founder}
            </p>
            <h2 className="mt-4 max-w-md text-4xl font-extrabold leading-tight">
              {labels.founderTitle}
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-slate-100/85">
              {copy.aboutText}
            </p>
            <div className="mt-8 h-px w-24 bg-orange-300/70" />
            <p className="mt-8 text-2xl font-bold text-orange-300">Aditya Kumar Mishra</p>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-200/85">
              {copy.founderRole}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-100">
              <Phone className="h-4 w-4 text-orange-300" />
              <span>7279998880</span>
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden bg-[#0a4a38] lg:min-h-full">
            <Image
              src="/assests/images/Picture7.webp"
              alt="Founder portrait"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />
          </div>

          <div className="flex items-center rounded-b-[2rem] bg-[#f9f8f4] px-6 py-8 lg:rounded-b-none lg:rounded-r-[2rem] lg:px-10 lg:py-12">
            <div>
              <div className="text-5xl font-black leading-none text-[#0d5c45]/18 sm:text-7xl">
                &ldquo;
              </div>
              <p className="mt-2 text-xl italic leading-8 text-[#c9953f] sm:text-3xl sm:leading-tight">
                {copy.trustText}
              </p>
              <div className="mt-6 h-1 w-16 rounded-full bg-orange-400" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#edf0e6] bg-[linear-gradient(180deg,_#fffdf8_0%,_#ffffff_100%)]">
        <div className="mx-auto max-w-7xl px-3 py-16 sm:px-6 sm:py-20">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.26em] text-orange-500">
              {copy.impactEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              {copy.impactTitle}
            </h2>
            <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">
              {copy.impactText}
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {copy.stats.map((item) => (
              <article
                key={item.label}
                className="rounded-[2rem] border border-[#ebe8df] bg-white px-8 py-8 shadow-[0_24px_70px_-56px_rgba(15,23,42,0.45)]"
              >
                <p className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
                  {item.value}
                </p>
                <h3 className="mt-3 text-lg font-bold text-slate-900 sm:text-xl">
                  {item.label}
                </h3>
                <p className="mt-2 text-xs text-slate-600 sm:text-sm">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="mx-auto max-w-7xl px-3 py-16 sm:px-6 sm:py-20">
        <div className="max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.26em] text-orange-500">
            {copy.whyEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            {copy.whyTitle}
          </h2>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="overflow-hidden rounded-[2rem] border border-[#e7ece3] bg-[#f8f4ef] shadow-[0_26px_70px_-56px_rgba(15,23,42,0.45)]">
            <Image
              src="/assests/images/Side-Image.webp"
              alt="Booth Bandhan strategy room"
              width={1400}
              height={900}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-base leading-8 text-slate-600 sm:text-xl sm:leading-9">
              {copy.whyText}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {copy.values.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-[1.7rem] border border-[#e7ece3] bg-white px-6 py-7 shadow-[0_22px_60px_-48px_rgba(15,23,42,0.5)]"
              >
                <div className="inline-flex rounded-full bg-[#fff2f2] p-3 text-[#cc6f8d]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        id="process"
        className="border-y border-[#edf0e6] bg-[linear-gradient(180deg,_#fffaf8_0%,_#ffffff_100%)]"
      >
        <div className="mx-auto max-w-7xl px-3 py-16 sm:px-6 sm:py-20">
          <div className="max-w-5xl">
            <p className="text-sm font-bold uppercase tracking-[0.26em] text-orange-500">
              {copy.workflowEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              {copy.workflowTitle}
            </h2>
            <p className="mt-5 max-w-5xl text-base leading-8 text-slate-600 sm:text-lg">
              {copy.workflowText}
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {copy.process.map((step) => (
              <article
                key={step.step}
                className="rounded-[1.8rem] border border-[#ebe6e1] bg-white px-6 py-6 shadow-[0_22px_60px_-50px_rgba(15,23,42,0.4)]"
              >
                <p className="text-3xl font-light text-slate-500">{step.step}</p>
                <div className="mt-2 h-px w-full bg-gradient-to-r from-[#df9ab2] to-transparent" />
                <h3 className="mt-4 text-2xl font-bold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-16 sm:px-6 sm:py-20">
        <div className="max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-[0.26em] text-orange-500">
            {copy.servicesEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            {copy.servicesTitle}
          </h2>
          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">
            {copy.servicesText}
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {copy.services.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="flex gap-4 rounded-[1.6rem] bg-white px-1 py-1">
                <div className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff2f2] text-[#d49cb0]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        id="contact"
        className="bg-[linear-gradient(180deg,_#0d5c45_0%,_#083428_100%)] text-white"
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

      <footer className="border-t border-[#d7dfd5] bg-[#f7f8f3]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-3 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-2xl font-extrabold text-[#0a3f32]">{labels.footerTitle}</p>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">{labels.footerTagline}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dbe5d9] bg-white text-[#0d5c45] shadow-sm transition hover:border-orange-300 hover:text-orange-500"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="text-left lg:text-right">
            <p className="text-sm text-slate-600">{labels.footerRights}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500 lg:justify-end">
              <span>{labels.privacyPolicy}</span>
              <span>{labels.terms}</span>
            </div>
          </div>
        </div>
      </footer>

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

