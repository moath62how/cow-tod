import referenceData from "../../../animal_pmi_data.json";

export function GET() {
  return Response.json(referenceData);
}
