import { GoogleGenAI, Type } from "@google/genai";

export interface AnalysisResult {
  dressName: string;
  confidence: number; // 0 to 1
  retailMatches: {
    name: string;
    store: string;
    brand: string;
    price: string;
    shipping: string;
    url: string;
    imageUrl: string;
  }[];
  blueprint: {
    palette: { hex: string; name: string }[];
    primaryMaterial: string;
    patternDiagram: string; // Description of pattern
    beadDetails: string;
    laceDescription: string;
    stitchingNotes: string;
    components: string[];
    technicalNotes: string;
  };
}

export async function analyzeDressImage(base64Image: string): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    Analyze this fashion inspiration image with extreme precision for the app "Lumina". 
    
    VISUAL ANALYSIS:
    - Color: Specific shade of lilac, lavender, or light mauve.
    - Neckline: High round neckline with heavy, intricate silver/crystal beadwork and embroidery.
    - Silhouette: Sleeveless, long/maxi length, straight or slightly A-line.
    - Key Feature: Sheer organza side panels or a cape-like attachment that flows from the sides/back.
    - Style: Luxury Pret / Festive Wear. This aesthetic is highly characteristic of South Asian (specifically Pakistani) luxury designers.
    
    SEARCH INSTRUCTIONS:
    1. Use Google Search to find ONLY the 100% EXACT match for this dress. 
    2. Search for specific terms like: "lilac dress beaded neckline organza panels", "lavender sleeveless dress with organza cape", "Pakistani luxury pret lilac beaded dress".
    3. Look for brands like UY Collection, Raja Salahuddin, or similar boutique luxury labels.
    4. Provide ONLY retail matches that are the EXACT SAME ITEM as shown in the image. 
    5. If no 100% exact match is found, return an empty array for retailMatches.
    6. Include store name, brand, price, shipping info, and the REAL direct URL to the product page.
    7. Do NOT return generic results, similar styles, or hallucinated URLs.
    
    TECHNICAL BLUEPRINT:
    Provide a "Recreate" technical blueprint:
    - Color palette (hex codes and names).
    - Primary material/fabric details (e.g., "Pure Raw Silk", "Organza").
    - Pattern diagram description.
    - Bead details (types of beads, placement).
    - Lace/Embroidery description.
    - Stitching notes (finishing, lining).
    - List of specific components.
    - Detailed technical notes.
    
    Return the result in JSON format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image
            }
          }
        ]
      }
    ],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dressName: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          retailMatches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                store: { type: Type.STRING },
                brand: { type: Type.STRING },
                price: { type: Type.STRING },
                shipping: { type: Type.STRING },
                url: { type: Type.STRING },
                imageUrl: { type: Type.STRING }
              },
              required: ["name", "store", "price", "brand", "shipping"]
            }
          },
          blueprint: {
            type: Type.OBJECT,
            properties: {
              palette: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hex: { type: Type.STRING },
                    name: { type: Type.STRING }
                  }
                }
              },
              primaryMaterial: { type: Type.STRING },
              patternDiagram: { type: Type.STRING },
              beadDetails: { type: Type.STRING },
              laceDescription: { type: Type.STRING },
              stitchingNotes: { type: Type.STRING },
              components: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              technicalNotes: { type: Type.STRING }
            },
            required: ["palette", "primaryMaterial", "components", "patternDiagram", "beadDetails", "laceDescription", "stitchingNotes"]
          }
        },
        required: ["dressName", "confidence", "retailMatches", "blueprint"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as AnalysisResult;
}
