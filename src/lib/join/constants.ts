import { siteConfig } from "@/lib/site-config";

export const JOIN_SESSION_COOKIE = "bf_join_sid";
export const JOIN_CLICK_COOKIE = "bf_join_cid";

export const SHARE_BASE_URL = process.env.NEXT_PUBLIC_SHARE_BASE_URL?.trim() || siteConfig.siteUrl;
export const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL?.trim() || siteConfig.appStoreUrl;
export const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_URL?.trim() || `${siteConfig.siteUrl}/aide`;
export const APP_DEEP_LINK_BASE = process.env.NEXT_PUBLIC_APP_DEEP_LINK_BASE?.trim() || "befood://join";
