
import { supabase } from './supabase';

type MarketplaceLinks = {
  shopee?: string;
  tokopedia?: string;
  lazada?: string;
};

const cleanLinkValue = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeMarketplaceLinks = (links?: MarketplaceLinks) => {
  if (!links) return undefined;
  const cleaned = {
    shopee: cleanLinkValue(links.shopee),
    tokopedia: cleanLinkValue(links.tokopedia),
    lazada: cleanLinkValue(links.lazada),
  };
  const hasAny = Object.values(cleaned).some(Boolean);
  return hasAny ? cleaned : undefined;
};

const pickFirstMarketplaceLink = (links?: MarketplaceLinks) => {
  const normalized = normalizeMarketplaceLinks(links);
  return (
    normalized?.shopee ||
    normalized?.tokopedia ||
    normalized?.lazada ||
    undefined
  );
};

const isMissingColumnError = (error: any, column: string) => {
  return (
    error?.code === 'PGRST204' &&
    typeof error?.message === 'string' &&
    error.message.includes(`'${column}'`)
  );
};

const withMarketplaceLinksFallback = async <T>(
  action: (payload: any) => Promise<{ data: T | null; error: any }>,
  payload: any,
  options?: { fallbackToSingle?: boolean },
) => {
  let result = await action(payload);
  if (!result.error) return result;

  if (!isMissingColumnError(result.error, 'marketplace_links')) {
    return result;
  }

  const { marketplace_links, ...withoutLinks } = payload || {};

  if (options?.fallbackToSingle) {
    const singleLink = pickFirstMarketplaceLink(marketplace_links);
    const withSingle = singleLink
      ? { ...withoutLinks, marketplace_link: singleLink }
      : withoutLinks;

    result = await action(withSingle);
    if (!result.error) return result;

    if (isMissingColumnError(result.error, 'marketplace_link')) {
      result = await action(withoutLinks);
    }
    return result;
  }

  return await action(withoutLinks);
};

const normalizeComponentPayload = (component: any) => {
  if (!component || typeof component !== 'object') return component;
  const { marketplace_links, marketplace_link, ...rest } = component;
  const normalizedLinks = normalizeMarketplaceLinks(marketplace_links);
  return {
    ...rest,
    ...(normalizedLinks ? { marketplace_links: normalizedLinks } : {}),
  };
};

const normalizeMonitorPayload = (monitor: any) => {
  if (!monitor || typeof monitor !== 'object') return monitor;
  const { marketplace_links, ...rest } = monitor;
  const normalizedLinks = normalizeMarketplaceLinks(marketplace_links);
  return {
    ...rest,
    ...(normalizedLinks ? { marketplace_links: normalizedLinks } : {}),
  };
};

const parseMarketplaceLinks = (raw: any, legacyLink?: string) => {
  if (raw && typeof raw === 'object') {
    return raw as MarketplaceLinks;
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed as MarketplaceLinks;
      }
    } catch {
      // Ignore invalid JSON.
    }
  }
  const fallback = cleanLinkValue(legacyLink);
  return fallback ? { shopee: fallback } : undefined;
};

export const api = {
  getComponents: async () => {
    const { data, error } = await supabase
      .from('components')
      .select('*');
    
    if (error) {
      console.error('Supabase Error:', error);
      return [];
    }
    
    return data.map((item: any) => ({
      ...item,
      price: Number(item.price),
      marketplace_links: parseMarketplaceLinks(
        item.marketplace_links,
        item.marketplace_link,
      ),
    }));
  },

  createComponent: async (component: any) => {
    const payload = normalizeComponentPayload(component);
    const result = await withMarketplaceLinksFallback(
      (body) =>
        supabase.from('components').insert([body]).select().single(),
      payload,
      { fallbackToSingle: true },
    );

    if (result.error) throw result.error;
    return result.data;
  },

  updateComponent: async (id: number, component: any) => {
    const payload = normalizeComponentPayload(component);
    const result = await withMarketplaceLinksFallback(
      (body) =>
        supabase
          .from('components')
          .update(body)
          .eq('id', id)
          .select()
          .single(),
      payload,
      { fallbackToSingle: true },
    );

    if (result.error) throw result.error;
    return result.data;
  },

  deleteComponent: async (id: number) => {
    const { error } = await supabase
      .from('components')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  getMonitors: async () => {
    const { data, error } = await supabase
      .from('monitors')
      .select('*');
      
    if (error) {
      console.error('Supabase Error:', error);
      return [];
    }
    return data.map((item: any) => ({
      ...item,
      price: Number(item.price),
      marketplace_links: parseMarketplaceLinks(item.marketplace_links),
    }));
  },

  createMonitor: async (monitor: any) => {
    const payload = normalizeMonitorPayload(monitor);
    const result = await withMarketplaceLinksFallback(
      (body) =>
        supabase.from('monitors').insert([body]).select().single(),
      payload,
    );

    if (result.error) throw result.error;
    return result.data;
  },

  updateMonitor: async (id: number, monitor: any) => {
    const payload = normalizeMonitorPayload(monitor);
    const result = await withMarketplaceLinksFallback(
      (body) =>
        supabase
          .from('monitors')
          .update(body)
          .eq('id', id)
          .select()
          .single(),
      payload,
    );

    if (result.error) throw result.error;
    return result.data;
  },

  deleteMonitor: async (id: number) => {
    const { error } = await supabase
      .from('monitors')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};
