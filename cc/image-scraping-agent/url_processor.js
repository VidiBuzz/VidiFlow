/**
 * URL processor for handling image URLs with various formats
 */
class URLProcessor {
  static isExternal(url) {
    try {
      const parsed = new URL(url);
      return !parsed.hostname.includes('sparkplatform.com') && 
             !parsed.hostname.includes('cloudimg.io');
    } catch {
      return true;
    }
  }

  static getPrimaryHost(url) {
    try {
      // Prefer original hostname over CDN fallbacks
      const host = new URL(url).hostname.toLowerCase();
      
      if (host.startsWith('sparkplatform.com')) return 'sparkplatform';
      if (host.includes('cloudimg.io')) return 'cloudimg';
      
      // Determine primary host based on TLD or known patterns
      return new URL(url).hostname;
    } catch { 
      const match = url.match(/\/\/([^/]+)/);
      return match ? match[0] : 'unknown';
    }
  }

  shouldSkip(url) {
    try {
      if (!new URL(url)) return true;
    } catch {}

    const hostname = new URL(url).hostname;
    return ['cdn.photos.sparkplatform.com', 'cloudimg.io'].includes(hostname);
  }
}

module.exports = { URLProcessor };