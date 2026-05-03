import { useState, useEffect } from 'react'

const resolve = () => {
    const s = getComputedStyle(document.documentElement);
    return {
        text:      s.getPropertyValue('--text').trim()       || '#1A1A2E',
        textLight: s.getPropertyValue('--text-light').trim() || '#6B7280',
        border:    s.getPropertyValue('--border').trim()     || '#E2E8F0',
        surface:   s.getPropertyValue('--surface').trim()    || '#FFFFFF',
        accent:    s.getPropertyValue('--accent').trim()     || '#00B4D8',
    };
};

export function useChartColors() {
    const [colors, setColors] = useState(resolve);

    useEffect(() => {
        const observer = new MutationObserver(() => setColors(resolve()));
        observer.observe(document.documentElement, { attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return colors;
}
