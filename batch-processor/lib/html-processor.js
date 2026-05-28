const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * HTML Processor - Uses Cheerio to replace logos, text, and branding in HTML files
 * Supports: text replacement, image src replacement, color scheme changes, meta tag updates
 */
class HTMLProcessor {
  constructor(options = {}) {
    this.defaultReplacements = options.defaultReplacements || {
      'NotebookLM': 'VidiSmart',
      'Notebook LM': 'VidiSmart',
      'notebooklm': 'VidiSmart',
      'notebook-lm': 'vidismart',
      'Google NotebookLM': 'VidiSmart by AirPMD',
      'google.com/notebooklm': 'vidismart.io'
    };
    this.defaultColors = options.defaultColors || {
      '#4285f4': '#2563eb', // Google blue -> VidiSmart blue
      '#ea4335': '#0ea5e9', // Google red -> VidiSmart sky
      '#fbbc05': '#10b981', // Google yellow -> VidiSmart green
      '#34a853': '#8b5cf6'  // Google green -> VidiSmart purple
    };
  }

  /**
   * Process an HTML file: replace text, images, colors, and meta tags
   */
  async processFile(inputPath, outputPath, config = {}) {
    const jobId = uuidv4();
    const startTime = Date.now();

    const html = await fs.readFile(inputPath, 'utf-8');
    const $ = cheerio.load(html, { decodeEntities: false });

    const replacements = config.replacements || this.defaultReplacements;
    const colors = config.colors || this.defaultColors;
    const stats = {
      textReplacements: 0,
      imageReplacements: 0,
      colorReplacements: 0,
      metaUpdates: 0,
      attributeReplacements: 0
    };

    // 1. Replace text content in all elements
    this._replaceTextContent($, replacements, stats);

    // 2. Replace image src attributes (logo swaps)
    if (config.logoMappings) {
      this._replaceImages($, config.logoMappings, stats);
    }

    // 3. Replace colors in style attributes and CSS
    this._replaceColors($, colors, stats);

    // 4. Update meta tags
    this._updateMetaTags($, replacements, stats);

    // 5. Replace attributes (href, data-* etc)
    this._replaceAttributes($, replacements, stats);

    // 6. Optional: Inject new branding elements
    if (config.injectBranding) {
      this._injectBranding($, config.injectBranding);
    }

    // Write output
    const outputHtml = $.html();
    await fs.writeFile(outputPath, outputHtml, 'utf-8');

    const duration = (Date.now() - startTime) / 1000;
    return {
      jobId,
      inputPath,
      outputPath,
      duration,
      stats,
      config: { replacements, colors }
    };
  }

  /**
   * Replace text content across all text nodes
   */
  _replaceTextContent($, replacements, stats) {
    const replaceInText = (text) => {
      let result = text;
      for (const [oldText, newText] of Object.entries(replacements)) {
        const regex = new RegExp(this._escapeRegExp(oldText), 'gi');
        const matches = result.match(regex);
        if (matches) {
          stats.textReplacements += matches.length;
          result = result.replace(regex, newText);
        }
      }
      return result;
    };

    // Walk all text nodes
    $('*').contents().each((_, node) => {
      if (node.type === 'text') {
        const newText = replaceInText(node.nodeValue);
        if (newText !== node.nodeValue) {
          node.nodeValue = newText;
        }
      }
    });

    // Also replace in specific attributes that contain text
    ['title', 'alt', 'aria-label', 'placeholder'].forEach(attr => {
      $(`[${attr}]`).each((_, el) => {
        const val = $(el).attr(attr);
        if (val) {
          const newVal = replaceInText(val);
          if (newVal !== val) {
            $(el).attr(attr, newVal);
            stats.attributeReplacements++;
          }
        }
      });
    });
  }

  /**
   * Replace image src attributes based on logo mappings
   */
  _replaceImages($, logoMappings, stats) {
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (!src) return;

      for (const [oldPattern, newSrc] of Object.entries(logoMappings)) {
        if (src.includes(oldPattern)) {
          $(el).attr('src', newSrc);
          stats.imageReplacements++;
          break;
        }
      }
    });

    // Also check background images in style attributes
    $('[style*="background"]').each((_, el) => {
      const style = $(el).attr('style');
      for (const [oldPattern, newSrc] of Object.entries(logoMappings)) {
        if (style && style.includes(oldPattern)) {
          $(el).attr('style', style.replace(oldPattern, newSrc));
          stats.imageReplacements++;
          break;
        }
      }
    });
  }

  /**
   * Replace color values in style attributes and inline CSS
   */
  _replaceColors($, colors, stats) {
    // Replace in style attributes
    $('[style]').each((_, el) => {
      let style = $(el).attr('style');
      let changed = false;
      for (const [oldColor, newColor] of Object.entries(colors)) {
        if (style.includes(oldColor)) {
          style = style.split(oldColor).join(newColor);
          changed = true;
          stats.colorReplacements++;
        }
      }
      if (changed) {
        $(el).attr('style', style);
      }
    });

    // Replace in <style> tags
    $('style').each((_, el) => {
      let css = $(el).html();
      let changed = false;
      for (const [oldColor, newColor] of Object.entries(colors)) {
        if (css.includes(oldColor)) {
          css = css.split(oldColor).join(newColor);
          changed = true;
          stats.colorReplacements++;
        }
      }
      if (changed) {
        $(el).html(css);
      }
    });
  }

  /**
   * Update meta tags (title, description, og tags, etc)
   */
  _updateMetaTags($, replacements, stats) {
    // Update <title>
    const title = $('title').text();
    if (title) {
      let newTitle = title;
      for (const [oldText, newText] of Object.entries(replacements)) {
        const regex = new RegExp(this._escapeRegExp(oldText), 'gi');
        newTitle = newTitle.replace(regex, newText);
      }
      if (newTitle !== title) {
        $('title').text(newTitle);
        stats.metaUpdates++;
      }
    }

    // Update meta description
    $('meta[name="description"]').each((_, el) => {
      const content = $(el).attr('content');
      if (content) {
        let newContent = content;
        for (const [oldText, newText] of Object.entries(replacements)) {
          const regex = new RegExp(this._escapeRegExp(oldText), 'gi');
          newContent = newContent.replace(regex, newText);
        }
        if (newContent !== content) {
          $(el).attr('content', newContent);
          stats.metaUpdates++;
        }
      }
    });

    // Update Open Graph tags
    $('meta[property^="og:"]').each((_, el) => {
      const content = $(el).attr('content');
      if (content) {
        let newContent = content;
        for (const [oldText, newText] of Object.entries(replacements)) {
          const regex = new RegExp(this._escapeRegExp(oldText), 'gi');
          newContent = newContent.replace(regex, newText);
        }
        if (newContent !== content) {
          $(el).attr('content', newContent);
          stats.metaUpdates++;
        }
      }
    });
  }

  /**
   * Replace text in href, data attributes, etc.
   */
  _replaceAttributes($, replacements, stats) {
    const attrsToCheck = ['href', 'data-url', 'data-src', 'data-link'];

    attrsToCheck.forEach(attr => {
      $(`[${attr}]`).each((_, el) => {
        const val = $(el).attr(attr);
        if (!val) return;

        let newVal = val;
        for (const [oldText, newText] of Object.entries(replacements)) {
          const regex = new RegExp(this._escapeRegExp(oldText), 'gi');
          newVal = newVal.replace(regex, newText);
        }
        if (newVal !== val) {
          $(el).attr(attr, newVal);
          stats.attributeReplacements++;
        }
      });
    });
  }

  /**
   * Inject new branding elements (favicon, analytics, etc)
   */
  _injectBranding($, branding) {
    const head = $('head');

    if (branding.favicon) {
      // Remove old favicons
      $('link[rel*="icon"]').remove();
      head.append(`<link rel="icon" type="image/png" href="${branding.favicon}">`);
    }

    if (branding.canonicalUrl) {
      $('link[rel="canonical"]').remove();
      head.append(`<link rel="canonical" href="${branding.canonicalUrl}">`);
    }

    if (branding.injectCss) {
      head.append(`<style>${branding.injectCss}</style>`);
    }
  }

  /**
   * Escape special regex characters
   */
  _escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Quick preview: show what would be replaced without writing file
   */
  async previewChanges(inputPath, config = {}) {
    const html = await fs.readFile(inputPath, 'utf-8');
    const $ = cheerio.load(html, { decodeEntities: false });

    const replacements = config.replacements || this.defaultReplacements;
    const stats = { textReplacements: 0, imageReplacements: 0, colorReplacements: 0 };

    this._replaceTextContent($, replacements, stats);
    this._replaceColors($, config.colors || this.defaultColors, stats);

    return {
      preview: $.html().slice(0, 2000) + '...',
      stats,
      wouldReplace: stats.textReplacements > 0 || stats.colorReplacements > 0
    };
  }
}

module.exports = HTMLProcessor;
