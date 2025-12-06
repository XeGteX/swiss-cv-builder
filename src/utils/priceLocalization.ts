/**
 * Price Localization Utility
 * Automatically detects user country and displays prices in local currency
 */

export interface LocalizedPrice {
    currency: string;
    symbol: string;
    free: string;
    monthly: number;
    monthlyPro: number;
    period: string;
}

interface PriceConfig {
    [key: string]: LocalizedPrice;
}

// Price configuration by region/country code
const PRICE_CONFIG: PriceConfig = {
    // Switzerland (CHF)
    CH: {
        currency: 'CHF',
        symbol: 'CHF',
        free: 'Gratuit',
        monthly: 9.90,
        monthlyPro: 29,
        period: '/mois'
    },
    // France, Belgium, Germany, Spain, Italy, etc. (EUR)
    FR: {
        currency: 'EUR',
        symbol: '€',
        free: 'Gratuit',
        monthly: 8.90,
        monthlyPro: 24.90,
        period: '/mois'
    },
    DE: {
        currency: 'EUR',
        symbol: '€',
        free: 'Kostenlos',
        monthly: 8.90,
        monthlyPro: 24.90,
        period: '/Monat'
    },
    BE: {
        currency: 'EUR',
        symbol: '€',
        free: 'Gratuit',
        monthly: 8.90,
        monthlyPro: 24.90,
        period: '/mois'
    },
    AT: {
        currency: 'EUR',
        symbol: '€',
        free: 'Kostenlos',
        monthly: 8.90,
        monthlyPro: 24.90,
        period: '/Monat'
    },
    ES: {
        currency: 'EUR',
        symbol: '€',
        free: 'Gratis',
        monthly: 8.90,
        monthlyPro: 24.90,
        period: '/mes'
    },
    IT: {
        currency: 'EUR',
        symbol: '€',
        free: 'Gratuito',
        monthly: 8.90,
        monthlyPro: 24.90,
        period: '/mese'
    },
    NL: {
        currency: 'EUR',
        symbol: '€',
        free: 'Gratis',
        monthly: 8.90,
        monthlyPro: 24.90,
        period: '/maand'
    },
    // United Kingdom (GBP)
    GB: {
        currency: 'GBP',
        symbol: '£',
        free: 'Free',
        monthly: 7.90,
        monthlyPro: 21.90,
        period: '/month'
    },
    // United States (USD)
    US: {
        currency: 'USD',
        symbol: '$',
        free: 'Free',
        monthly: 9.90,
        monthlyPro: 29.90,
        period: '/month'
    },
    // Canada (CAD)
    CA: {
        currency: 'CAD',
        symbol: 'C$',
        free: 'Free',
        monthly: 12.90,
        monthlyPro: 34.90,
        period: '/month'
    },
    // Australia (AUD)
    AU: {
        currency: 'AUD',
        symbol: 'A$',
        free: 'Free',
        monthly: 14.90,
        monthlyPro: 39.90,
        period: '/month'
    },
    // Default (fallback to EUR for European users)
    DEFAULT: {
        currency: 'EUR',
        symbol: '€',
        free: 'Free',
        monthly: 8.90,
        monthlyPro: 24.90,
        period: '/month'
    }
};

// Language to country mapping for better detection
const LANGUAGE_TO_COUNTRY: { [key: string]: string } = {
    'fr': 'FR',
    'fr-FR': 'FR',
    'fr-CH': 'CH',
    'fr-BE': 'BE',
    'fr-CA': 'CA',
    'de': 'DE',
    'de-DE': 'DE',
    'de-CH': 'CH',
    'de-AT': 'AT',
    'en': 'US',
    'en-US': 'US',
    'en-GB': 'GB',
    'en-AU': 'AU',
    'en-CA': 'CA',
    'es': 'ES',
    'es-ES': 'ES',
    'it': 'IT',
    'it-IT': 'IT',
    'nl': 'NL',
    'nl-NL': 'NL',
    'nl-BE': 'BE',
};

/**
 * Detect user's country from browser settings
 */
export function detectUserCountry(): string {
    if (typeof window === 'undefined') return 'DEFAULT';

    // Try to get from navigator.language
    const language = navigator.language || (navigator as { userLanguage?: string }).userLanguage || '';

    // Check for exact match first (e.g., 'fr-CH')
    if (LANGUAGE_TO_COUNTRY[language]) {
        return LANGUAGE_TO_COUNTRY[language];
    }

    // Check for language prefix match (e.g., 'fr')
    const langPrefix = language.split('-')[0];
    if (LANGUAGE_TO_COUNTRY[langPrefix]) {
        return LANGUAGE_TO_COUNTRY[langPrefix];
    }

    // Try to detect from timezone
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes('Zurich') || timezone.includes('Geneva')) return 'CH';
        if (timezone.includes('Paris')) return 'FR';
        if (timezone.includes('Berlin')) return 'DE';
        if (timezone.includes('London')) return 'GB';
        if (timezone.includes('New_York') || timezone.includes('Los_Angeles') || timezone.includes('Chicago')) return 'US';
        if (timezone.includes('Sydney') || timezone.includes('Melbourne')) return 'AU';
        if (timezone.includes('Toronto') || timezone.includes('Vancouver')) return 'CA';
    } catch {
        // Timezone detection failed, continue with default
    }

    return 'DEFAULT';
}

/**
 * Get localized price configuration
 */
export function getLocalizedPrices(): LocalizedPrice {
    const country = detectUserCountry();
    return PRICE_CONFIG[country] || PRICE_CONFIG.DEFAULT;
}

/**
 * Format a price with the correct currency symbol
 */
export function formatPrice(amount: number, prices: LocalizedPrice): string {
    if (amount === 0) return prices.free;

    // For symbols that go before the number
    if (['$', '£', 'C$', 'A$'].includes(prices.symbol)) {
        return `${prices.symbol}${amount.toFixed(2).replace('.00', '')}`;
    }

    // For symbols that go after (EUR, CHF)
    return `${amount.toFixed(2).replace('.00', '')} ${prices.symbol}`;
}

/**
 * React hook for price localization
 */
import { useState, useEffect } from 'react';

export function useLocalizedPrices() {
    const [prices, setPrices] = useState<LocalizedPrice>(PRICE_CONFIG.DEFAULT);
    const [country, setCountry] = useState<string>('DEFAULT');

    useEffect(() => {
        const detectedCountry = detectUserCountry();
        setCountry(detectedCountry);
        setPrices(PRICE_CONFIG[detectedCountry] || PRICE_CONFIG.DEFAULT);
    }, []);

    return {
        prices,
        country,
        formatPrice: (amount: number) => formatPrice(amount, prices)
    };
}
