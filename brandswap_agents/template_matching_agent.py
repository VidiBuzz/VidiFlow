#!/usr/bin/env python3
"""
BrandSwap - Template Matching Agent
Improves logo detection accuracy with advanced multi-scale template matching.
"""

import cv2
import numpy as np
from pathlib import Path


class TemplateMatchingAgent:
    """Agent responsible for accurate logo detection using template matching."""
    
    def __init__(self, threshold=0.55, debug=False):
        self.threshold = threshold
        self.debug = debug
        # Extended scale range for better detection across various logo sizes
        self.scales = [
            0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10,  # Small logos
            0.12, 0.15, 0.18, 0.20, 0.25, 0.30,              # Medium logos
            0.40, 0.50, 0.60, 0.75, 1.0                      # Large logos
        ]
        
    def detect_logo(self, image_path, template, search_region=None):
        """
        Detect logo in image using multi-scale template matching.
        
        Args:
            image_path: Path to the image file
            template: Template image (numpy array)
            search_region: Dict with x_start, y_start, width, height (optional)
            
        Returns:
            tuple: (found: bool, confidence: float, bounds: tuple or None, scale: float)
        """
        try:
            img = cv2.imread(str(image_path))
            if img is None:
                return False, 0.0, None, 0.0
            
            h, w = img.shape[:2]
            
            # Define search region
            if search_region is None:
                # Default: bottom-right corner
                search_region = {
                    "x_start": 0.65,
                    "y_start": 0.85,
                    "width": 0.35,
                    "height": 0.15
                }
            
            x1 = int(w * search_region["x_start"])
            y1 = int(h * search_region["y_start"])
            x2 = min(w, int(x1 + w * search_region["width"]))
            y2 = min(h, int(y1 + h * search_region["height"]))
            
            # Ensure valid ROI
            if x2 <= x1 or y2 <= y1:
                return False, 0.0, None, 0.0
                
            search_roi = img[y1:y2, x1:x2]
            
            # Multi-scale template matching with NMS-like filtering
            best_results = []
            
            for scale in self.scales:
                new_w = int(template.shape[1] * scale)
                new_h = int(template.shape[0] * scale)
                
                if new_w <= 0 or new_h <= 0:
                    continue
                if new_w > search_roi.shape[1] or new_h > search_roi.shape[0]:
                    continue
                
                resized_template = cv2.resize(template, (new_w, new_h))
                
                # Template matching
                result = cv2.matchTemplate(
                    search_roi, resized_template, cv2.TM_CCOEFF_NORMED
                )
                
                # Get all matches above threshold (not just max)
                matches = np.where(result >= self.threshold * 0.8)
                
                for pt in zip(matches[1], matches[0]):  # x, y
                    confidence = result[pt[1], pt[0]]
                    best_results.append({
                        'scale': scale,
                        'confidence': confidence,
                        'x': pt[0],
                        'y': pt[1],
                        'w': new_w,
                        'h': new_h
                    })
            
            if not best_results:
                # Fallback to max value approach
                best_match = 0
                best_scale = 1.0
                best_loc = (0, 0)
                
                for scale in self.scales:
                    new_w = int(template.shape[1] * scale)
                    new_h = int(template.shape[0] * scale)
                    
                    if new_w <= 0 or new_h <= 0:
                        continue
                    if new_w > search_roi.shape[1] or new_h > search_roi.shape[0]:
                        continue
                    
                    resized_template = cv2.resize(template, (new_w, new_h))
                    result = cv2.matchTemplate(
                        search_roi, resized_template, cv2.TM_CCOEFF_NORMED
                    )
                    _, max_val, _, max_loc = cv2.minMaxLoc(result)
                    
                    if max_val > best_match:
                        best_match = max_val
                        best_scale = scale
                        best_loc = max_loc
                
                if best_match >= self.threshold:
                    logo_bounds = (
                        x1 + best_loc[0],
                        y1 + best_loc[1],
                        x1 + best_loc[0] + int(template.shape[1] * best_scale),
                        y1 + best_loc[1] + int(template.shape[0] * best_scale),
                    )
                    return True, best_match, logo_bounds, best_scale
                
                return False, best_match, None, 0.0
            
            # Non-maximum suppression: keep best non-overlapping results
            best_results.sort(key=lambda r: r['confidence'], reverse=True)
            selected = []
            
            for result in best_results:
                is_overlapping = False
                for sel in selected:
                    # Check for overlap
                    if (abs(result['x'] - sel['x']) < 20 and 
                        abs(result['y'] - sel['y']) < 20):
                        is_overlapping = True
                        break
                
                if not is_overlapping:
                    selected.append(result)
            
            if selected:
                best = selected[0]
                logo_bounds = (
                    x1 + best['x'],
                    y1 + best['y'],
                    x1 + best['x'] + best['w'],
                    y1 + best['y'] + best['h'],
                )
                return True, best['confidence'], logo_bounds, best['scale']
            
            return False, 0.0, None, 0.0
            
        except Exception as e:
            if self.debug:
                print(f"Error in template matching: {e}")
            return False, 0.0, None, 0.0
    
    def adaptive_threshold(self, image_path, template):
        """
        Determine optimal threshold based on image characteristics.
        
        Args:
            image_path: Path to image
            template: Template image
            
        Returns:
            float: Recommended threshold
        """
        try:
            img = cv2.imread(str(image_path))
            if img is None:
                return self.threshold
            
            # Analyze image contrast and noise
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            contrast = np.std(gray)
            noise = self._estimate_noise(gray)
            
            # Adjust threshold based on image quality
            if contrast > 100 and noise < 20:
                # High quality image - can use lower threshold
                return max(0.4, self.threshold - 0.1)
            elif contrast < 50 or noise > 40:
                # Low quality image - need higher threshold
                return min(0.7, self.threshold + 0.1)
            
            return self.threshold
            
        except:
            return self.threshold
    
    def _estimate_noise(self, gray_image):
        """Estimate noise level using Laplacian variance."""
        laplacian = cv2.Laplacian(gray_image, cv2.CV_64F)
        return np.var(laplacian)


def run_detection_tests():
    """Run self-tests for the Template Matching Agent."""
    print("Template Matching Agent Self-Tests")
    print("=" * 50)
    
    agent = TemplateMatchingAgent(threshold=0.55, debug=True)
    
    # Test scale generation
    print(f"Scale range: {min(agent.scales)} - {max(agent.scales)}")
    print(f"Number of scales: {len(agent.scales)}")
    
    print("\nAgent initialized successfully!")
    return agent


if __name__ == "__main__":
    run_detection_tests()
