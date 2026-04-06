# BrandSwap Storage

This directory contains all uploaded files, processed outputs, and archived sessions.

## Structure

```
storage/
├── uploads/              # User uploaded files (logo templates + media)
│   └── {session-uuid}/
│       ├── template.jpg
│       ├── file1.jpg
│       └── video1.mp4
│
├── output/               # Processed files (logo replaced)
│   └── {session-uuid}/
│       ├── file1.jpg     (with logo replaced)
│       └── video1.mp4    (with logo replaced)
│
└── archive/              # Completed sessions (moved after 30 days)
    └── {session-uuid}/
        └── ... (archived files)
```

## Session Lifecycle

1. **Upload:** Files saved to `uploads/{session-uuid}/`
2. **Process:** Results saved to `output/{session-uuid}/`
3. **Upload to CDN:** Files uploaded to R2 at `https://cdn.vidi.news/brandswap/{session}/`
4. **Archive:** After 30 days, sessions moved to `archive/` (optional cleanup)

## Storage Management

### Current Storage Usage
```bash
# Check storage size
du -sh storage/

# Check by directory
du -sh storage/uploads/
du -sh storage/output/
du -sh storage/archive/
```

### Manual Cleanup (if needed)
```bash
# Delete sessions older than 30 days
find storage/uploads/ -type d -mtime +30 -exec rm -rf {} +
find storage/output/ -type d -mtime +30 -exec rm -rf {} +

# Or move to archive
find storage/output/ -type d -mtime +30 -exec mv {} storage/archive/ \;
```

### Automatic Cleanup
The server automatically uploads processed files to R2 CDN, so local files are mainly for:
- Active processing (sessions in progress)
- Backup/redundancy
- Debugging failed sessions

## Notes

- All files are also uploaded to Cloudflare R2 CDN
- CDN serves as primary file source for downloads
- Local storage is for processing and backup only
- Keep at least 7 days of local files for debugging
