import React, { useState } from 'react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { ExternalLink, CheckCircle, Award, Landmark, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  language: Language;
}

interface Scheme {
  id: string;
  nameEn: string;
  nameTe: string;
  nameHi: string;
  nameMl: string;
  nameTa: string;
  category: 'central' | 'ap' | 'insurance' | 'credit';
  benefitsEn: string;
  benefitsTe: string;
  benefitsHi: string;
  benefitsMl: string;
  benefitsTa: string;
  eligibilityEn: string;
  eligibilityTe: string;
  eligibilityHi: string;
  eligibilityMl: string;
  eligibilityTa: string;
  officialUrl: string;
  badgeEn: string;
  badgeTe: string;
  badgeHi: string;
  badgeMl: string;
  badgeTa: string;
  imageUrl: string;
}

export const GovernmentSchemesTab: React.FC<Props> = ({ language }) => {
  const t = translations[language].schemes;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedEligibilityId, setExpandedEligibilityId] = useState<string | null>(null);

  const schemes: Scheme[] = [
    {
      id: 'pm-kisan',
      nameEn: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      nameTe: 'పీఎం కిసాన్ (ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి)',
      nameHi: 'पीएम-किसान (प्रधान मंत्री किसान सम्मान निधि)',
      nameMl: 'പിഎം കിസാൻ (പ്രധാനമന്ത്രി കിസാൻ സമ്മാൻ നിധി)',
      nameTa: 'பிஎம்-கிசான் (பிரதான் மந்திரி கிசான் சம்மான் நிதி)',
      category: 'central',
      benefitsEn: '₹6,000 per year direct income support in 3 equal installments of ₹2,000 directly into farmer bank accounts via DBT.',
      benefitsTe: 'సంవత్సరానికి ₹6,000ల ఆర్థిక సహాయం 3 సమాన విడతలలో (రూ.2,000 చొప్పున) DBT ద్వారా నేరుగా రైతు బ్యాంక్ ఖాతాలో జమ.',
      benefitsHi: 'किसानों के बैंक खातों में सीधी ₹6,000 प्रति वर्ष 3 समान किस्तों में प्रत्यक्ष लाभ अंतरण (DBT) आय सहायता।',
      benefitsMl: 'വർഷത്തിൽ ₹6,000 സാമ്പത്തിക സഹായം കർഷക ബാങ്ക് അക്കൗണ്ടിലേക്ക് നേരിട്ട് 3 ഗഡുക്കളായി നൽകുന്നു.',
      benefitsTa: 'ஆண்டுக்கு ₹6,000 நேரடி உதவித்தொகை 3 தவணைகளாக விவசாயிகளின் வங்கி கணக்கில் நேரடியாக செலுத்தப்படுகிறது.',
      eligibilityEn: 'Small and marginal landowning farmer families across India with cultivable agricultural land.',
      eligibilityTe: 'సాగుభూమి కలిగిన దేశవ్యాప్త చిన్న మరియు సన్నకారు రైతు కుటుంబాలు.',
      eligibilityHi: 'कृषि योग्य भूमि वाले देश भर के छोटे और सीमांत किसान परिवार।',
      eligibilityMl: 'കൃഷിഭൂമിയുള്ള ചെറുകിട, നാമമാത്ര കർഷക കുടുംബങ്ങൾ.',
      eligibilityTa: 'விவசாய நிலம் உள்ள அனைத்து சிறு மற்றும் குறு விவசாய குடும்பங்கள்.',
      officialUrl: 'https://pmkisan.gov.in/',
      badgeEn: 'Central Government • Direct Transfer (DBT)',
      badgeTe: 'కేంద్ర ప్రభుత్వం • ప్రత్యక్ష నగదు బదిలీ (DBT)',
      badgeHi: 'केंद्र सरकार • प्रत्यक्ष लाभ अंतरण (DBT)',
      badgeMl: 'കേന്ദ്ര സർക്കാർ • നേരിട്ടുള്ള ബാങ്ക് സഹായം',
      badgeTa: 'மத்திய அரசு • நேரடி பணப் பரிமாற்றம் (DBT)',
      imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'annadata-sukhibhava',
      nameEn: 'Annadata Sukhibhava / PM Kisan (Andhra Pradesh)',
      nameTe: 'అన్నదాత సుఖీభవ / పీఎం కిసాన్ (ఆంధ్రప్రదేశ్)',
      nameHi: 'अन्नदाता सुखीभव / पीएम किसान (आंध्र प्रदेश)',
      nameMl: 'അന്നദാതാ സുഖീഭവ / പിഎം കിസാൻ (ആന്ധ്രപ്രദേശ്)',
      nameTa: 'அன்னதாதா சுகிபவ / பிஎம் கிசான் (ஆந்திரப் பிரதேசம்)',
      category: 'ap',
      benefitsEn: 'Comprehensive financial assistance of ₹20,000 per year per farmer family (₹14,000 from AP State Govt + ₹6,000 from PM-KISAN) for agricultural input and investment support.',
      benefitsTe: 'రైతు కుటుంబానికి సంవత్సరానికి ₹20,000 పెట్టుబడి సాయం (ఆంధ్రప్రదేశ్ ప్రభుత్వం ₹14,000 + కేంద్ర పీఎం కిసాన్ ₹6,000) విత్తనాలు, ఎరువుల కొనుగోలుకు ఆర్థిక భరోసా.',
      benefitsHi: 'प्रति किसान परिवार ₹20,000 प्रति वर्ष (आंध्र प्रदेश सरकार ₹14,000 + पीएम किसान ₹6,000) कृषि निवेश और सहायता।',
      benefitsMl: 'കർഷക കുടുംബത്തിന് പ്രതിവർഷം ₹20,000 (ആന്ധ്ര സർക്കാർ ₹14,000 + പിഎം കിസാൻ ₹6,000) കാർഷിക സഹായം.',
      benefitsTa: 'விவசாய குடும்பத்திற்கு ஆண்டுக்கு ₹20,000 (ஆந்திர அரசு ₹14,000 + பிஎம் கிசான் ₹6,000) விவசாய முதலீட்டு நிதி உதவி.',
      eligibilityEn: 'All eligible landowning farmers and tenant farmers in Andhra Pradesh.',
      eligibilityTe: 'ఆంధ్రప్రదేశ్‌లోని అర్హులైన పట్టాదారులు మరియు కౌలు రైతులు అందరూ.',
      eligibilityHi: 'आंध्र प्रदेश के सभी पात्र भूमिस्वामी एवं पट्टेदार (कौलू) किसान।',
      eligibilityMl: 'ആന്ധ്രപ്രദേശിലെ എല്ലാ ഭൂവുടമസ്ഥരും പാട്ടക്കർഷകരും.',
      eligibilityTa: 'ஆந்திராவில் உள்ள நில உரிமையாளர்கள் மற்றும் குத்தகை விவசாயிகள்.',
      officialUrl: 'https://apagrisnet.gov.in/',
      badgeEn: 'Andhra Pradesh State Govt • ₹20,000/yr Aid',
      badgeTe: 'ఆంధ్రప్రదేశ్ రాష్ట్ర ప్రభుత్వం • ₹20,000 వార్షిక సాయం',
      badgeHi: 'आंध्र प्रदेश सरकार • ₹20,000/वर्ष सहायता',
      badgeMl: 'ആന്ധ്രപ്രദേശ് സർക്കാർ • ₹20,000 സാമ്പത്തിക സഹായം',
      badgeTa: 'ஆந்திர அரசு • ₹20,000/ஆண்டு நிதி உதவி',
      imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'pmfby',
      nameEn: 'PM Fasal Bima Yojana (PMFBY - Crop Insurance)',
      nameTe: 'పీఎం ఫసల్ బీమా యోజన (పంట నష్టపరిహార బీమా)',
      nameHi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
      nameMl: 'പ്രധാനമന്ത്രി ഫസൽ ബീമ യോജന (വിള ഇൻഷുറൻസ്)',
      nameTa: 'பிரதான் மந்திரி பயிர் காப்பீட்டுத் திட்டம் (PMFBY)',
      category: 'insurance',
      benefitsEn: 'Comprehensive insurance coverage against non-preventable natural risks (drought, flood, cyclone, pests) at low premium rates (2% for Kharif, 1.5% for Rabi crops).',
      benefitsTe: 'కరువు, వరదలు, తుఫానులు మరియు తెగుళ్ళ వల్ల పంట నష్టపోతే తక్కువ ప్రీమియంతో (ఖరీఫ్‌కు 2%, రబీకి 1.5%) పూర్తి నష్టపరిహార బీమా రక్షణ.',
      benefitsHi: 'सूखा, बाढ़, कीट प्रकोप से होने वाले फसल नुकसान पर न्यूनतम प्रीमियम (खरीफ 2%, रबी 1.5%) पर व्यापक वित्तीय सुरक्षा।',
      benefitsMl: 'പ്രകൃതിദുരന്തങ്ങൾ മൂലം വിളനാശമുണ്ടായാൽ കുറഞ്ഞ പ്രീമിയത്തിൽ സമഗ്ര ഇൻഷുറൻസ് പരിരക്ഷ.',
      benefitsTa: 'இயற்கை சீற்றங்களால் ஏற்படும் பயிர் இழப்பிற்கு குறைந்த பிரீமியத்தில் முழு காப்பீட்டு இழப்பீடு.',
      eligibilityEn: 'All farmers cultivating notified crops in notified areas including sharecroppers and tenant farmers.',
      eligibilityTe: 'నోటిఫై చేయబడిన ప్రాంతాలలో పంటలు సాగుచేసే రైతులు, కౌలు రైతులు అందరూ అర్హులు.',
      eligibilityHi: 'अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी काश्तकार और पट्टेदार किसान।',
      eligibilityMl: 'വിള ഇൻഷുറൻസ് പരിധിയിലുള്ള എല്ലാ കർഷകർക്കും അർഹതയുണ്ട്.',
      eligibilityTa: 'அறிவிக்கப்பட்ட பயிர்களை பயிரிடும் அனைத்து விவசாயிகளும் விண்ணப்பிக்கலாம்.',
      officialUrl: 'https://pmfby.gov.in/',
      badgeEn: 'Crop Insurance & Risk Protection',
      badgeTe: 'పంట బీమా & నష్టపరిహారం',
      badgeHi: 'फसल बीमा एवं जोखिम सुरक्षा',
      badgeMl: 'വിള ഇൻഷുറൻസ് പരിരക്ഷ',
      badgeTa: 'பயிர் காப்பீடு மற்றும் பாதுகாப்பு',
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'kcc',
      nameEn: 'Kisan Credit Card (KCC) Low-Interest Loans',
      nameTe: 'కిసాన్ క్రెడిట్ కార్డ్ (KCC - తక్కువ వడ్డీ రుణాలు)',
      nameHi: 'किसान क्रेडिट कार्ड (KCC) योजना',
      nameMl: 'കിസാൻ ക്രെഡിറ്റ് കാർഡ് (KCC) പദ്ധതി',
      nameTa: 'கிசான் கிரெடிட் கார்டு (KCC) திட்டம்',
      category: 'credit',
      benefitsEn: 'Affordable institutional credit up to ₹3 Lakhs at 4% subsidized interest rate with prompt repayment incentive for crop inputs, seeds, and machinery.',
      benefitsTe: 'విత్తనాలు, ఎరువులు మరియు వ్యవసాయ యంత్రాల కోసం 4% రాయితీ వడ్డీకే ₹3 లక్షల వరకు సకాల బ్యాంక్ రుణ సదుపాయం.',
      benefitsHi: 'फसल की लागत, बीज एवं उर्वरक हेतु 4% रियायती ब्याज दर पर ₹3 लाख तक का आसान संस्थागत कृषि ऋण।',
      benefitsMl: 'വിത്ത്, വളം, യന്ത്രങ്ങൾ എന്നിവയ്ക്കായി 4% പലിശ നിരക്കിൽ ₹3 ലക്ഷം വരെ കുറഞ്ഞ പലിശ വായ്പ.',
      benefitsTa: 'விதை, உரம் மற்றும் வேளாண் உபகரணங்கள் வாங்க 4% வட்டி மானியத்தில் ₹3 லட்சம் வரை உடனடி கடன் உதவி.',
      eligibilityEn: 'Farmers, individual/joint borrowers, tenant farmers, oral lessees, and Self-Help Groups (SHGs).',
      eligibilityTe: 'రైతులు, కౌలు రైతులు, భాగస్వామ్య రైతులు మరియు స్వయం సహాయక బృందాలు.',
      eligibilityHi: 'सभी किसान, काश्तकार, पट्टेदार और स्वयं सहायता समूह (SHG)।',
      eligibilityMl: 'എല്ലാ കർഷകരും പാട്ടക്കർഷകരും സ്വയം സഹായ സംഘങ്ങളും.',
      eligibilityTa: 'அனைத்து விவசாயிகள், குத்தகை விவசாயிகள் மற்றும் மகளிர் சுய உதவிக்குழுக்கள்.',
      officialUrl: 'https://www.myscheme.gov.in/schemes/kcc',
      badgeEn: 'Agricultural Credit & 4% Interest Loan',
      badgeTe: 'వ్యవసాయ రుణం & 4% వడ్డీ సదుపాయం',
      badgeHi: 'कृषि ऋण एवं 4% रियायती ब्याज',
      badgeMl: 'കാർഷിക വായ്പ & 4% പലിശ',
      badgeTa: 'விவசாயக் கடன் & 4% வட்டி மானியம்',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'soil-health',
      nameEn: 'Soil Health Card Scheme',
      nameTe: 'సాయిల్ హెల్త్ కార్డ్ (నేల ఆరోగ్య కార్డ్)',
      nameHi: 'मृदा स्वास्थ्य कार्ड योजना',
      nameMl: 'സോയിൽ ഹെൽത്ത് കാർഡ് (മണ്ണ് പരിശോധന)',
      nameTa: 'மண் வள அட்டை திட்டம்',
      category: 'central',
      benefitsEn: 'Free laboratory testing of soil samples measuring 12 vital parameters (NPK, pH, micronutrients) with personalized crop-wise fertilizer dosage recommendations.',
      benefitsTe: 'భూమి సారాన్ని ఉచితంగా ల్యాబ్‌లో పరీక్షించి 12 పోషక విలువల నివేదిక మరియు పంటల వారీగా ఖచ్చితమైన ఎరువుల సిఫార్సులు.',
      benefitsHi: '12 आवश्यक पोषक तत्वों के साथ मुफ्त मिट्टी जांच रिपोर्ट और फसल अनुसार संतुलित उर्वरक सिफारिशें।',
      benefitsMl: 'മണ്ണിന്റെ ഫലഭൂയിഷ്ഠത സൗജന്യമായി പരിശോധിച്ച് വിളകൾക്കനുസരിച്ചുള്ള സന്തുലിത വളപ്രയോഗ നിർദ്ദേശങ്ങൾ.',
      benefitsTa: 'இலவச மண் பரிசோதனை மூலம் 12 சத்துக்களின் அளவு மற்றும் பயிருக்கேற்ற சமச்சீர் உரப் பரிந்துரைகள்.',
      eligibilityEn: 'All agricultural landholders and cultivating farmers across India.',
      eligibilityTe: 'భారతదేశంలోని సాగుభూమి ఉన్న రైతులందరూ మరియు సాగుదారులు.',
      eligibilityHi: 'भारत के सभी कृषि भूमिस्वामी एवं काश्तकार किसान।',
      eligibilityMl: 'എല്ലാ കർഷകർക്കും സൗജന്യമായി ലഭ്യമാണ്.',
      eligibilityTa: 'அனைத்து விவசாயிகளுக்கும் இலவசமாக வழங்கப்படுகிறது.',
      officialUrl: 'https://soilhealth.dac.gov.in/',
      badgeEn: 'Soil Nutrient Testing & Advisory',
      badgeTe: 'నేల సార పరీక్ష & ఎరువుల సలహా',
      badgeHi: 'मृदा स्वास्थ्य परीक्षण एवं सलाह',
      badgeMl: 'മണ്ണ് പരിശോധന & കാർഷിക നിർദ്ദേശം',
      badgeTa: 'மண் பரிசோதனை & உர ஆலோசனை',
      imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'pmksy',
      nameEn: 'PM Krishi Sinchayee Yojana (Drip & Micro-Irrigation)',
      nameTe: 'పీఎం కృషి సంచాయీ యోజన (సూక్ష్మ సేద్యం - డ్రిప్ & స్ప్రింక్లర్ రాయితీ)',
      nameHi: 'प्रधानमंत्री कृषि सिंचाई योजना (ड्रिप एवं स्प्रिंकलर सब्सिडी)',
      nameMl: 'പ്രധാനമന്ത്രി കൃഷി സിഞ്ചായി യോജന (സൂക്ഷ്മ ജലസേചനം)',
      nameTa: 'பிரதான் மந்திரி கிருஷி சிஞ்சாயி யோஜனா (சொட்டு நீர் பாசன மானியம்)',
      category: 'central',
      benefitsEn: 'Up to 55% - 90% government subsidy for installing drip irrigation, sprinklers, and water-saving micro-irrigation systems on farms.',
      benefitsTe: 'డ్రిప్ మరియు స్ప్రింక్లర్ సూక్ష్మ సేద్య పరికరాల కొనుగోలుపై రైతులకు 55% నుండి 90% వరకు ప్రభుత్వ రాయితీ (సబ్సిడీ).',
      benefitsHi: 'ड्रिप एवं स्प्रिंकलर सिंचाई प्रणाली स्थापित करने पर 55% से 90% तक की भारी सरकारी सब्सिडी।',
      benefitsMl: 'ഡ്രിപ്പ്, സ്പ്രിങ്ക്ലർ ജലസേചന ഉപകരണങ്ങൾക്ക് 55% മുതൽ 90% വരെ സർക്കാർ സബ്‌സിഡി.',
      benefitsTa: 'சொட்டு நீர் மற்றும் தெளிப்பு நீர் பாசன அமைப்புகளுக்கு 55% முதல் 90% வரை அரசு மானியம்.',
      eligibilityEn: 'All farmers possessing cultivable land and an assured water source.',
      eligibilityTe: 'సాగుభూమి మరియు నీటి వనరు ఉన్న రైతులందరూ అర్హులు.',
      eligibilityHi: 'कृषि भूमि और जल स्रोत वाले सभी किसान।',
      eligibilityMl: 'കൃഷിഭൂമിയും ജലസ്രോതസ്സുമുള്ള എല്ലാ കർഷകരും.',
      eligibilityTa: 'விவசாய நிலமும் நீர் ஆதாரமும் உள்ள அனைத்து விவசாயிகளும்.',
      officialUrl: 'https://pmksy.gov.in/',
      badgeEn: 'Micro-Irrigation & Drip Subsidy',
      badgeTe: 'సూక్ష్మ సేద్యం & డ్రిప్ రాయితీ',
      badgeHi: 'सूक्ष्म सिंचाई एवं ड्रिप सब्सिडी',
      badgeMl: 'സൂക്ഷ്മ ജലസേചന സബ്‌സിഡി',
      badgeTa: 'சொட்டு நீர் பாசன மானியம்',
      imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const filteredSchemes = selectedCategory === 'all' 
    ? schemes 
    : schemes.filter(s => s.category === selectedCategory);

  const getName = (s: Scheme) => {
    switch (language) {
      case 'te': return s.nameTe;
      case 'hi': return s.nameHi;
      case 'ml': return s.nameMl;
      case 'ta': return s.nameTa;
      default: return s.nameEn;
    }
  };

  const getBenefits = (s: Scheme) => {
    switch (language) {
      case 'te': return s.benefitsTe;
      case 'hi': return s.benefitsHi;
      case 'ml': return s.benefitsMl;
      case 'ta': return s.benefitsTa;
      default: return s.benefitsEn;
    }
  };

  const getEligibility = (s: Scheme) => {
    switch (language) {
      case 'te': return s.eligibilityTe;
      case 'hi': return s.eligibilityHi;
      case 'ml': return s.eligibilityMl;
      case 'ta': return s.eligibilityTa;
      default: return s.eligibilityEn;
    }
  };

  const getBadge = (s: Scheme) => {
    switch (language) {
      case 'te': return s.badgeTe;
      case 'hi': return s.badgeHi;
      case 'ml': return s.badgeMl;
      case 'ta': return s.badgeTa;
      default: return s.badgeEn;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      
      {/* Header Banner */}
      <div className="glass-panel responsive-card-pad" style={{ borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(216,243,220,0.4) 100%)', borderLeft: '5px solid var(--primary)', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.8rem' }}>
              <Landmark size={16} />
              <span>{t.headerTag || 'OFFICIAL WELFARE & FINANCIAL SCHEMES'}</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.15rem, 4vw, 1.65rem)', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
              {t.title}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.25rem', lineHeight: 1.4 }}>
              {t.subtitle}
            </p>
          </div>

          {/* Horizontal Scrollable Category Pills */}
          <div className="horizontal-scroll-chips" style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
            {[
              { id: 'all', label: t.allSchemes || 'All Schemes' },
              { id: 'central', label: t.centralGovt || 'Central Govt' },
              { id: 'ap', label: t.andhraPradesh || 'Andhra Pradesh' },
              { id: 'insurance', label: t.insurance || 'Crop Insurance' },
              { id: 'credit', label: language === 'te' ? 'వ్యవసాయ రుణాలు' : (language === 'hi' ? 'कृषि ऋण' : (language === 'ta' ? 'விவசாயக் கடன்' : (language === 'ml' ? 'കാർഷിക വായ്പ' : 'Credit & Loans'))) },
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={isSelected ? 'btn-primary' : 'btn-secondary'}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.4rem 0.85rem',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    minHeight: '38px',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cards: 1 Card per row on mobile, multi-column on desktop */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '1.15rem',
          width: '100%',
        }}
      >
        {filteredSchemes.map((scheme) => {
          const isEligibilityOpen = expandedEligibilityId === scheme.id;

          return (
            <div
              key={scheme.id}
              className="glass-panel"
              style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                background: '#ffffff',
                width: '100%',
              }}
            >
              {/* Cover Image & Badge */}
              <div style={{ position: 'relative', height: '160px', width: '100%', overflow: 'hidden' }}>
                <img
                  src={scheme.imageUrl}
                  alt={scheme.nameEn}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(27,67,50,0.85) 0%, transparent 60%)' }} />
                
                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', maxWidth: 'calc(100% - 1.5rem)' }}>
                  <span className="badge badge-green" style={{ background: '#ffffff', color: 'var(--primary-dark)', boxShadow: 'var(--shadow-sm)', fontSize: '0.68rem' }}>
                    <Award size={12} color="var(--primary)" />
                    <span className="truncate">{getBadge(scheme)}</span>
                  </span>
                </div>

                <h3 style={{ position: 'absolute', bottom: '0.75rem', left: '0.85rem', right: '0.85rem', color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)', margin: 0 }} className="break-words">
                  {getName(scheme)}
                </h3>
              </div>

              {/* Content */}
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Sparkles size={13} />
                      {t.benefits}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.45 }} className="break-words">
                      {getBenefits(scheme)}
                    </p>
                  </div>

                  {/* Expandable Eligibility Accordion */}
                  <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => setExpandedEligibilityId(isEligibilityOpen ? null : scheme.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.75rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle size={13} color="var(--primary)" />
                        <span>{t.eligibility} Criteria</span>
                      </div>
                      {isEligibilityOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isEligibilityOpen && (
                      <div style={{ padding: '0 0.75rem 0.75rem 0.75rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }} className="break-words">
                        {getEligibility(scheme)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Link Button */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <a
                    href={scheme.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', minHeight: '44px', fontSize: '0.88rem' }}
                  >
                    <span>{t.visitOfficialWebsite}</span>
                    <ExternalLink size={15} />
                  </a>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
