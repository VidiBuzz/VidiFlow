# Base Agent Orchestrator
import asyncio
import yaml
from pathlib import Path
from utils.downloader import DownloadManager
from sources.seaglass_scraper import SeaGlassScraper
from sources.spark_platform import SparkPlatformScraper
from sources.youtube_downloader import YouTubeDownloader
from utils.file_organizer import organize_files
from utils.manifest import Manifest

async def main():
  """Main scraping orchestrator."""
  
  # Load config
  with open('config.yaml') as f:
    config = yaml.safe_load(f)
    
  base_dir = Path(config['base_output_dir'])
  base_dir.mkdir(parents=True, exist_ok=True)
  
  # Initialize components
  manifest = Manifest(Path(base_dir / 'manifest.json'))
  dl_manager = DownloadManager(config)
  
  print('╔══════════════════════════════════════════════════════╗')
  print('║   FORTUNA MILL ESTATE - IMAGE SCRAPING AGENT        ║')
  print('╚══════════════════════════════════════════════════════╝\n')
  
  # Step 1: Scrape SeaGlassProperties (main MLS listing - 69 images)
  print('┌───────────────────────────────────────────┐')
  print('│ 📸 PHASE 1: SeaGlassProperties            │')
  print('└───────────────────────────────────────────┘')
  seaglass = SeaGlassScraper(dl_manager, manifest)
  await seaglass.scrape_all()
  
  # Step 2: Scrape Spark Platform (Denise Fraguela - duplicate check)
  print('\n┌───────────────────────────────────────────┐')
  print('│ 📸 PHASE 2: SparkPlatform/SparkPhotos     │')
  print('└───────────────────────────────────────────┘')
  spark = SparkPlatformScraper(dl_manager, manifest)
  await spark.scrape_all()
  
  # Step 3: Scrape B&B sites (FV Rentals, BedroomVillas, HiCee)
  print('\n┌───────────────────────────────────────────┐')
  print('│ 📸 PHASE 3: Bed & Breakfast Listings      │')
  print('└───────────────────────────────────────────┘')
  await seaglass.scrape_bnb_sources()
  
  # Step 4: Download YouTube videos (property tours)
  print('\n┌───────────────────────────────────────────┐')
  print('│ 🎬 PHASE 4: YouTube Video Downloads       │')
  print('└───────────────────────────────────────────┘')
  yt = YouTubeDownloader(dl_manager, manifest)
  await yt.download_all([
      'https://www.youtube.com/watch?v=9ph62GwqWTo',     # Main estate video
      'https://www.youtube.com/watch?v=FX7B-F20Its',     # Virtual tour
  ])
  
  # Step 5: Deduplicate and organize
  print('\n┌───────────────────────────────────────────┐')
  print('│ 📁 PHASE 5: Organizing & Deduplicating    │')
  print('└───────────────────────────────────────────┘')
  organize_files(base_dir, manifest)
  
  # Save final manifest
  manifest.save()
  
  # Summary
  images = manifest.get_images_count()
  videos = manifest.get_videos_count()
  
  print('\n' + '╔══════════════════════════════════════════════════════╗')
  print(f'║   ✅ COMPLETED!                                       ║')
  print(f'║                                                       ║')
  print(f'║   🖼️  Images: {images:,} total downloaded       ║')
  print(f'║   🎥 Videos: {videos:.0f} total downloaded      ║')
  print(f'║   📂 Output: {base_dir.resolve()}                     ║')
  print(f'╚══════════════════════════════════════════════════════╝\n')

if __name__ == '__main__':
    asyncio.run(main())