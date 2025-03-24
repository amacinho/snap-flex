export function detectBrowser(): 'chrome' | 'firefox' | 'safari' | 'other' {
    const userAgent = navigator.userAgent.toLowerCase();

    console.log(userAgent);

    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
        return 'chrome';
    }
    if (userAgent.includes('firefox')) {
        return 'firefox';
    }
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
        return 'safari';
    }
    return 'other';
}

export function isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}