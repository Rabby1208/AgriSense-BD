// কৃষি সহায়তার যোগাযোগের তথ্য। প্রতিটি তথ্যের উৎস ও যাচাইয়ের অবস্থা সঙ্গে রাখা হয়েছে।
// নিয়ম: যে নম্বর বা ঠিকানা সরকারি উৎস থেকে যাচাই হয়নি, সেখানে null রাখুন।
// null থাকলে UI "যাচাইয়ের অপেক্ষায়" দেখাবে। কোনো নম্বর আন্দাজে লিখবেন না।

export const KRISHI_CALL_CENTRE = {
  name: "কৃষি কল সেন্টার",
  organization: "কৃষি তথ্য সার্ভিস (AIS)",
  phone: "16123",
  source_url: "https://www.ais.gov.bd",
  verified_at: "2026-11-10",
  number_status: "সরকারি পোর্টালে পাওয়া গেছে",
  // সময় ও কলের খরচ পুরোনো উৎসে পাওয়া গেছে; AIS-এর সাইটে মিলিয়ে নেওয়া বাকি
  hours: null,
  cost: null,
  details_status: "TODO_VERIFY",
};

// উপজেলা কৃষি অফিসের নম্বর DAE বা জেলা-উপজেলার সরকারি পোর্টাল থেকে যাচাই করে বসাবেন।
export const UPAZILA_AGRICULTURE_OFFICES = [
  {
    upazilaId: "gazipur_sadar",
    name: "উপজেলা কৃষি অফিস, গাজীপুর সদর",
    phone: null,
    address: null,
    source_url: null,
    verified_at: null,
    data_status: "TODO_VERIFY",
  },
  {
    upazilaId: "savar",
    name: "উপজেলা কৃষি অফিস, সাভার",
    phone: null,
    address: null,
    source_url: null,
    verified_at: null,
    data_status: "TODO_VERIFY",
  },
  {
    upazilaId: "bogura_sadar",
    name: "উপজেলা কৃষি অফিস, বগুড়া সদর",
    phone: null,
    address: null,
    source_url: null,
    verified_at: null,
    data_status: "TODO_VERIFY",
  },
];