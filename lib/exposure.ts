export type ExposureGuidance = {
  level: "unavailable" | "good" | "moderate" | "sensitive" | "unhealthy" | "very-unhealthy" | "hazardous";
  headline: string;
  summary: string;
  actions: string[];
};

/**
 * Plain-language activity guidance based on the US AQI bands.
 * This is general public information, not medical advice or a local alert.
 */
export function getExposureGuidance(aqi: number | null | undefined): ExposureGuidance {
  if (typeof aqi !== "number" || !Number.isFinite(aqi) || aqi < 0) {
    return {
      level: "unavailable",
      headline: "Air-quality guidance is unavailable",
      summary: "Load a city's air-quality data before using this activity guidance.",
      actions: ["Check a trusted local air-quality source before making outdoor plans."],
    };
  }

  if (aqi <= 50) {
    return {
      level: "good",
      headline: "A good window for outdoor plans",
      summary: "The modelled US AQI is in the Good range. Air quality is generally satisfactory.",
      actions: ["Usual outdoor activities are generally suitable.", "Re-check the forecast if conditions or location change."],
    };
  }

  if (aqi <= 100) {
    return {
      level: "moderate",
      headline: "Most people can continue as usual",
      summary: "The modelled US AQI is Moderate. A small number of unusually sensitive people may notice effects.",
      actions: ["Most people can continue normal outdoor activities.", "If you are unusually sensitive to air pollution, consider reducing prolonged or intense outdoor exertion if you notice symptoms."],
    };
  }

  if (aqi <= 150) {
    return {
      level: "sensitive",
      headline: "Sensitive groups should take extra care",
      summary: "The modelled US AQI is Unhealthy for Sensitive Groups. Children, older adults, and people with heart or lung conditions may be more affected.",
      actions: ["Sensitive groups should consider reducing prolonged or heavy outdoor exertion.", "Choose a less strenuous or indoor option when practical.", "Check local official guidance for current conditions."],
    };
  }

  if (aqi <= 200) {
    return {
      level: "unhealthy",
      headline: "Reduce prolonged outdoor exertion",
      summary: "The modelled US AQI is Unhealthy. Some effects may be experienced by the general public, with greater risk for sensitive groups.",
      actions: ["Consider moving strenuous activity indoors or rescheduling it.", "Sensitive groups should avoid prolonged or heavy outdoor exertion.", "Check local official advisories before travel or outdoor events."],
    };
  }

  if (aqi <= 300) {
    return {
      level: "very-unhealthy",
      headline: "Limit outdoor exposure",
      summary: "The modelled US AQI is Very Unhealthy and indicates a health alert level.",
      actions: ["Avoid prolonged or strenuous outdoor activity where possible.", "Sensitive groups should avoid outdoor physical activity.", "Follow local public-health guidance and re-check conditions."],
    };
  }

  return {
    level: "hazardous",
    headline: "Follow local emergency air-quality guidance",
    summary: "The modelled US AQI is Hazardous. This level can affect the wider population.",
    actions: ["Avoid outdoor physical activity and reduce exposure where possible.", "Follow official local public-health or emergency instructions.", "Check trusted local monitoring sources for updates."],
  };
}
