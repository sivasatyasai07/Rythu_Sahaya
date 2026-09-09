import React, { useState } from 'react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { ExternalLink, CheckCircle, Award, Landmark, Sparkles } from 'lucide-react';

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
      benefitsEn: 'Comprehensive crop insurance against natural calamities, droughts, unseasonal rains, pests and diseases at subsidized farmer premium rates (1.5% - 2%).',
      benefitsTe: 'ప్రకృతి వైపరీత్యాలు, అకాల వర్షాలు, కరువు మరియు తెగుళ్ల వల్ల పంట నష్టానికి అత్యల్ప ప్రీమియం రేటులో (1.5% - 2%) పూర్తి పంట పరిహార బీమా.',
      benefitsHi: 'प्राकृतिक आपदाओं, बेमौसम बारिश, सूखे और कीटों से फसल क्षति पर न्यूनतम प्रीमियम (1.5% - 2%) पर व्यापक सुरक्षा।',
      benefitsMl: 'പ്രകൃതിക്ഷോഭം, വരൾച്ച, കീടബാധ എന്നിവ മൂലം വിളനഷ്ടം സംഭവിച്ചാൽ കുറഞ്ഞ പ്രീമിയത്തിൽ സമഗ്ര ഇൻഷുറൻസ്.',
      benefitsTa: 'இயற்கை சீற்றங்கள், வறட்சி, பூச்சி தாக்குதலால் ஏற்படும் பயிர் இழப்பிற்கு மிகக் குறைந்த பிரீமியத்தில் முழுமையான காப்பீடு.',
      eligibilityEn: 'All farmers growing notified crops in notified areas including sharecroppers and tenant farmers.',
      eligibilityTe: 'నోటిఫై చేసిన పంటలు సాగుచేసే రైతులు, కౌలుదారులు మరియు భాగస్వామ్య రైతులు.',
      eligibilityHi: 'अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान और बटाईदार।',
      eligibilityMl: 'വിജ്ഞാപനം ചെയ്ത വിളകൾ കൃഷി ചെയ്യുന്ന എല്ലാ കർഷകരും പാട്ടക്കർഷകരും.',
      eligibilityTa: 'அறிவிக்கப்பட்ட பயிர்களை பயிரிடும் அனைத்து விவசாயிகளும் குத்தகைதாரர்களும்.',
      officialUrl: 'https://pmfby.gov.in/',
      badgeEn: 'Crop Risk & Disaster Insurance',
      badgeTe: 'పంట నష్టపరిహారం & విపత్తు బీమా',
      badgeHi: 'फसल जोखिम एवं आपदा सुरक्षा बीमा',
      badgeMl: 'വിള ഇൻഷുറൻസ് & നഷ്ടപരിഹാരം',
      badgeTa: 'பயிர் இடர் & பேரிடர் காப்பீடு',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'enam',
      nameEn: 'e-NAM (National Agriculture Market)',
      nameTe: 'ఈ-నామ్ (జాతీయ వ్యవసాయ డిజిటల్ మార్కెట్)',
      nameHi: 'ई-नाम (राष्ट्रीय कृषि डिजिटल बाजार)',
      nameMl: 'ഇ-നാം (ദേശീയ കാർഷിക ഡിജിറ്റൽ വിപണി)',
      nameTa: 'இ-நாம் (தேசிய விவசாய மின்னணு சந்தை)',
      category: 'central',
      benefitsEn: 'Pan-India electronic trading portal uniting 1,000+ APMC mandis for transparent online price bidding, weight verification, and direct digital payouts.',
      benefitsTe: 'దేశవ్యాప్తంగా 1,000కి పైగా APMC మార్కెట్‌లను అనుసంధానించే ఆన్‌లైన్ ట్రేడింగ్ పోర్టల్ ద్వారా పోటీ ధరలు మరియు పారదర్శక వేలం.',
      benefitsHi: '1,000+ एपीएमसी मंडियों को जोड़ने वाला अखिल भारतीय ऑनलाइन पोर्टल, पारदर्शी बोली एवं सीधा डिजिटल भुगतान।',
      benefitsMl: '1,000-ലധികം എപിഎംസി വിപണികളെ ബന്ധിപ്പിക്കുന്ന ദേശീയ ഡിജിറ്റൽ വിപണി വഴി മികച്ച വിലയും ഓൺലൈൻ പണമിടപാടും.',
      benefitsTa: '1,000+ மண்டிகளை இணைக்கும் தேசிய மின்னணு சந்தை மூலம் வெளிப்படையான விலை நிர்ணயம் மற்றும் நேரடி வங்கி வரவு.',
      eligibilityEn: 'All registered farmers, traders, FPOs, and APMC market yards across India.',
      eligibilityTe: 'భారతదేశంలోని నమోదు చేసుకున్న రైతులు, వ్యాపారులు, FPOలు మరియు వ్యవసాయ మార్కెట్ కమిటీలు.',
      eligibilityHi: 'भारत भर के सभी पंजीकृत किसान, व्यापारी और किसान उत्पादक संगठन (FPO)।',
      eligibilityMl: 'രജിസ്റ്റർ ചെയ്ത എല്ലാ കർഷകരും വ്യാപാരികളും കാർഷിക ഉത്പാദക സംഘങ്ങളും.',
      eligibilityTa: 'பதிவு செய்த அனைத்து விவசாயிகள், வியாபாரிகள் மற்றும் உழவர் உற்பத்தியாளர் அமைப்புகள்.',
      officialUrl: 'https://www.enam.gov.in/',
      badgeEn: 'Pan-India Digital Mandi Portal',
      badgeTe: 'దేశవ్యాప్త డిజిటల్ మండి పోర్టల్',
      badgeHi: 'अखिल भारतीय डिजिटल मंडी नेटवर्क',
      badgeMl: 'ദേശീയ ഡിജിറ്റൽ വിപണി പോർട്ടൽ',
      badgeTa: 'அகில இந்திய டிஜிட்டல் மண்டி தளம்',
      imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'kcc',
      nameEn: 'Kisan Credit Card (KCC) Scheme',
      nameTe: 'కిసాన్ క్రెడిట్ కార్డ్ (KCC) పథకం',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(216,243,220,0.4) 100%)', borderLeft: '6px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
              <Landmark size={20} />
              <span>{t.headerTag || 'OFFICIAL WELFARE & FINANCIAL SCHEMES'}</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
              {t.title}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.3rem', maxWidth: '800px' }}>
              {t.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              {t.allSchemes || 'All Schemes'}
            </button>
            <button
              onClick={() => setSelectedCategory('central')}
              className={selectedCategory === 'central' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              {t.centralGovt || 'Central Govt'}
            </button>
            <button
              onClick={() => setSelectedCategory('ap')}
              className={selectedCategory === 'ap' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              {t.andhraPradesh || 'Andhra Pradesh'}
            </button>
            <button
              onClick={() => setSelectedCategory('insurance')}
              className={selectedCategory === 'insurance' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              {t.insurance || 'Crop Insurance'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Schemes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className="glass-panel"
            style={{
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: '#ffffff',
            }}
          >
            {/* Cover Image & Badge */}
            <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden' }}>
              <img
                src={scheme.imageUrl}
                alt={scheme.nameEn}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(27,67,50,0.85) 0%, transparent 60%)' }} />
              
              <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                <span className="badge badge-green" style={{ background: '#ffffff', color: 'var(--primary-dark)', boxShadow: 'var(--shadow-sm)' }}>
                  <Award size={14} color="var(--primary)" />
                  {getBadge(scheme)}
                </span>
              </div>

              <h3 style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', color: '#ffffff', fontSize: '1.15rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {getName(scheme)}
              </h3>
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={14} />
                    {t.benefits}
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.5 }}>
                    {getBenefits(scheme)}
                  </p>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={14} color="var(--primary)" />
                    {t.eligibility}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {getEligibility(scheme)}
                  </p>
                </div>
              </div>

              {/* Action Link */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <a
                  href={scheme.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>{t.visitOfficialWebsite}</span>
                  <ExternalLink size={16} />
                </a>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
