import Chargebee from "chargebee";

import { env } from "@/core/config/env";

let _chargebee: Chargebee | null = null;

/** Get the Chargebee client (lazy-initialized). */
export function getChargebee(): Chargebee {
  if (!_chargebee) {
    _chargebee = new Chargebee({
      site: env.CHARGEBEE_SITE,
      apiKey: env.CHARGEBEE_API_KEY,
    });
  }
  return _chargebee;
}
