/**
 * Utility functions to interface with the Gemini API.
 * Uses vanilla fetch to connect to Gemini 1.5 Flash.
 * Falls back to high-fidelity simulated AI heuristics if no API Key is provided.
 */

// Helper to call Gemini REST API
async function callGemini(apiKey, prompt, jsonMode = false) {
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: jsonMode ? {
      responseMimeType: "application/json"
    } : {}
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error("Empty response received from Gemini API.");
    }
    
    return textResponse;
  } catch (error) {
    console.error("Gemini API Call failed:", error);
    throw error;
  }
}

// 1. Prospect/Scrape leads using AI
export async function prospectLeads(apiKey, industry, location, icp) {
  const localFallbacks = [
    {
      companyName: `${industry.replace(/s$/, '')}Flow Solutions`,
      contactName: "Sarah Jenkins",
      email: "sarah.j@flowsolutions.co",
      website: `www.${industry.toLowerCase().replace(/[^a-z0-9]/g, '')}flow.com`,
      description: `A fast-growing ${industry.toLowerCase()} company based in ${location} seeking to scale operations.`,
      industry: industry,
      location: location,
      source: "AI Prospector"
    },
    {
      companyName: `Apex ${industry} Group`,
      contactName: "Marcus Vance",
      email: "m.vance@apexgroup.io",
      website: `www.apex${industry.toLowerCase().replace(/[^a-z0-9]/g, '')}.io`,
      description: `Enterprise-level provider of ${industry.toLowerCase()} solutions in the greater ${location} area.`,
      industry: industry,
      location: location,
      source: "AI Prospector"
    },
    {
      companyName: `Nova ${location.split(',')[0]} Enterprises`,
      contactName: "Elena Rostova",
      email: "elena.r@novaenterprises.com",
      website: `www.nova${location.toLowerCase().split(',')[0].replace(/[^a-z0-9]/g, '')}.com`,
      description: `Medium-sized business focused on integrating new tech into their ${industry.toLowerCase()} services.`,
      industry: industry,
      location: location,
      source: "AI Prospector"
    },
    {
      companyName: `Vanguard ${industry.split(' ')[0]}`,
      contactName: "David Cho",
      email: "d.cho@vanguardcorp.org",
      website: `www.vanguard${industry.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '')}.org`,
      description: `Established player looking to optimize their workflow and address current customer pain points.`,
      industry: industry,
      location: location,
      source: "AI Prospector"
    },
    {
      companyName: `Zenith Digital`,
      contactName: "Chloe Dupont",
      email: "chloe@zenithdigital.net",
      website: "www.zenithdigital.net",
      description: `A boutique agency in ${location} specializing in digital operations for the ${industry.toLowerCase()} sector.`,
      industry: industry,
      location: location,
      source: "AI Prospector"
    }
  ];

  if (!apiKey) {
    // Artificial delay to simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    return localFallbacks;
  }

  const prompt = `You are a professional B2B lead generation assistant.
Generate 5 realistic, high-quality target prospect leads for a B2B campaign based on:
Target Industry: ${industry}
Target Location: ${location}
Ideal Customer Profile (ICP) notes: ${icp || 'Any relevant business'}

For each lead, create realistic company and contact details. Return ONLY a valid JSON array of objects. Do not include markdown formatting like \`\`\`json.
Each object in the array must have precisely these string fields:
- companyName
- contactName
- email
- website
- description (1-2 sentences about what they do and their likely challenges)
- industry (should be: ${industry})
- location (should be: ${location})
- source (should be: "AI Prospector")`;

  try {
    const rawResult = await callGemini(apiKey, prompt, true);
    // Parse json
    const cleanedJsonText = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJsonText);
  } catch (err) {
    console.warn("Falling back to local leads database simulation.", err);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return localFallbacks;
  }
}

// 2. Score & Enrich a lead
export async function scoreLead(apiKey, lead, senderProfile) {
  const defaultFallback = {
    score: 78,
    tier: "B",
    painPoints: ["Scaling customer outreach", "Legacy workflows", "Integration bottlenecks"],
    analysis: "Strong company profile with clear alignment to general B2B services. Likely has budget but might require a structured onboarding demo."
  };

  const senderDesc = senderProfile?.companyDescription || "B2B technology solutions and agency services";
  const targetOffer = senderProfile?.valueProposition || "increasing operational efficiency and sales via smart software";

  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Smart heuristic simulation based on industry match
    let score = 55 + Math.floor(Math.random() * 30);
    const matchTerms = [lead.industry, lead.description, lead.companyName].join(" ").toLowerCase();
    const offerTerms = [senderDesc, targetOffer].join(" ").toLowerCase();

    // Check overlaps
    let overlapCount = 0;
    const keywords = ['marketing', 'software', 'tech', 'finance', 'sales', 'consulting', 'medical', 'dental', 'retail'];
    keywords.forEach(kw => {
      if (matchTerms.includes(kw) && offerTerms.includes(kw)) {
        overlapCount++;
      }
    });

    score += overlapCount * 10;
    if (score > 98) score = 98;
    
    let tier = "C";
    if (score >= 85) tier = "A";
    else if (score >= 70) tier = "B";
    else if (score >= 50) tier = "C";
    else tier = "D";

    const commonPains = {
      tech: ["Legacy code maintainability", "Speed of feature deployment", "Developer hiring costs"],
      marketing: ["Low lead conversion rates", "High ad spend client attrition", "Reporting automation"],
      finance: ["Security & compliance overhead", "Manual reconciliation", "Data silos"],
      medical: ["Patient retention", "HIPAA compliant messaging", "Appointment scheduling friction"],
      retail: ["Inventory sync latency", "Cart abandonment rates", "B2B wholesale order volume"],
    };

    let industryKey = "tech";
    Object.keys(commonPains).forEach(k => {
      if (lead.industry.toLowerCase().includes(k)) {
        industryKey = k;
      }
    });

    return {
      score,
      tier,
      painPoints: commonPains[industryKey],
      analysis: `Evaluated ${lead.companyName} based on target offer of "${targetOffer.substring(0, 50)}...". Overlap analysis suggests ${tier}-Tier fit. Main contact is ${lead.contactName}.`
    };
  }

  const prompt = `You are an expert sales qualifier and lead scoring engine.
We are analyzing this prospect lead for our business.

OUR BUSINESS PROFILE:
- Description: ${senderDesc}
- Value Proposition / What we sell: ${targetOffer}

PROSPECT LEAD DETAILS:
- Company Name: ${lead.companyName}
- Industry: ${lead.industry}
- Location: ${lead.location}
- Description: ${lead.description}

Evaluate the qualification of this lead on a scale of 0 to 100 (where 100 is absolute perfect fit). Assign a Tier (A, B, C, or D) based on the score (A: >=85, B: 70-84, C: 50-69, D: <50). Identify 3 primary pain points they likely have which we can solve. Provide a brief analysis paragraph justifying your scoring.

Return ONLY a valid JSON object. Do not include markdown formatting.
Format:
{
  "score": number,
  "tier": "A" | "B" | "C" | "D",
  "painPoints": ["painpoint 1", "painpoint 2", "painpoint 3"],
  "analysis": "string"
}`;

  try {
    const rawResult = await callGemini(apiKey, prompt, true);
    const cleanedJsonText = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJsonText);
  } catch (err) {
    console.warn("Error scoring lead via Gemini. Using local heuristic fallback.", err);
    return defaultFallback;
  }
}

// 3. Write Personalized Cold Outreach
export async function generateOutreach(apiKey, lead, senderProfile, options) {
  const { tone = "Professional", length = "Medium", type = "Email" } = options;
  
  const senderName = senderProfile?.senderName || "Alex Rivera";
  const senderCompany = senderProfile?.companyName || "GrowthSpace";
  const senderDesc = senderProfile?.companyDescription || "B2B technology solutions and agency services";
  const targetOffer = senderProfile?.valueProposition || "increasing operational efficiency and sales via smart software";

  const defaultEmail = `Subject: Quick question regarding ${lead.companyName}'s current operations

Hi ${lead.contactName.split(' ')[0]},

I came across ${lead.companyName} and was impressed by your focus on the ${lead.industry} space in ${lead.location}. 

Many companies like yours encounter challenges with workflow bottlenecks and scaling outreach. We specialize in helping businesses like yours resolve these exact issues. Our clients typically see a 30% increase in productivity.

Would you be open to a brief 10-minute chat next Thursday to see if we might be a fit to help ${lead.companyName} scale?

Best regards,

${senderName}
${senderTitle(senderProfile)}
${senderCompany}`;

  const defaultLinkedIn = `Hi ${lead.contactName.split(' ')[0]}, saw your profile and your work in ${lead.industry} at ${lead.companyName}. We help companies like yours solve operational hurdles and boost productivity. Would love to connect and share a few ideas!`;

  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return type === "LinkedIn" ? defaultLinkedIn : defaultEmail;
  }

  const prompt = `You are a world-class B2B copywriter specializing in high-converting cold outreach.
Write a personalized ${type} outreach message to:
Recipient: ${lead.contactName} (Role: Decision Maker at ${lead.companyName})
Recipient Industry: ${lead.industry}
Recipient Details & Challenges: ${lead.description}
Recipient Key Pain Points: ${lead.painPoints ? lead.painPoints.join(", ") : "Workflow scale"}

SENDER INFO:
- Name: ${senderName}
- Company: ${senderCompany}
- Business offering: ${senderDesc}
- Our Value Prop: ${targetOffer}

OUTREACH SPECIFICATIONS:
- Tone: ${tone} (e.g. professional, friendly, bold, casual)
- Length: ${length} (e.g. Short, Medium, Long)
- Outreach Type: ${type} (Email or LinkedIn connection request)

Requirements:
- If Email: Include a compelling, clickable subject line at the very top.
- Customize the content to relate specifically to the recipient's industry and pain points.
- Avoid generic placeholders (like "[Company Name]"). Use the provided details directly.
- The tone should sound human, not robotic.

Return only the text of the message (Subject + Body, or just body if LinkedIn).`;

  try {
    return await callGemini(apiKey, prompt, false);
  } catch (err) {
    console.warn("Gemini outreach writing failed. Returning local copy template.", err);
    return type === "LinkedIn" ? defaultLinkedIn : defaultEmail;
  }
}

function senderTitle(profile) {
  if (profile?.senderTitle) return profile.senderTitle;
  return "Head of Business Development";
}
