import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { site as defaultSite } from "@/data/site";
import { readSiteSetting } from "./site-settings";

export const generalDefaults = {
  name: defaultSite.name,
  tagline: defaultSite.tagline,
  phone: defaultSite.phonesDisplay[0],
  whatsapp: defaultSite.whatsapp,
  addressLine1: defaultSite.address.line1,
  addressLine2: defaultSite.address.line2,
  instagram: defaultSite.instagram,
  instagramHandle: defaultSite.instagramHandle,
  facebook: defaultSite.facebook,
  mapsLink: defaultSite.mapsLink,
};
export type GeneralSettings = { [K in keyof typeof generalDefaults]: string };

export function buildSiteSettings(saved: Partial<GeneralSettings> | null = null) {
  const value = { ...generalDefaults, ...saved };
  const site = {
    ...defaultSite,
    name: value.name, shortName: value.name, tagline: value.tagline,
    phones: [value.phone.replace(/[^\d+]/g, "")], phonesDisplay: [value.phone],
    whatsapp: value.whatsapp, instagram: value.instagram, instagramHandle: value.instagramHandle,
    facebook: value.facebook, mapsLink: value.mapsLink,
    address: { line1: value.addressLine1, line2: value.addressLine2 },
  };
  return {
    site,
    mapsUrl: value.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${value.addressLine1}, ${value.addressLine2}`)}`,
    mapsEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(`${value.addressLine1}, ${value.addressLine2}`)}&output=embed`,
    whatsappUrl: `https://wa.me/${value.whatsapp}?text=${encodeURIComponent(`Hello ${value.name}, I would like to know more about your products.`)}`,
  };
}

const GeneralSettingsContext = createContext(buildSiteSettings());

export function GeneralSettingsProvider({ initialSettings, children }: { initialSettings: GeneralSettings | null; children: ReactNode }) {
  const { data } = useQuery({
    queryKey: ["general-settings"],
    queryFn: ({ signal }) => readSiteSetting<GeneralSettings>("general", signal),
    initialData: initialSettings,
    staleTime: 30_000,
  });
  return <GeneralSettingsContext.Provider value={buildSiteSettings(data)}>{children}</GeneralSettingsContext.Provider>;
}

export const useSiteSettings = () => useContext(GeneralSettingsContext);
