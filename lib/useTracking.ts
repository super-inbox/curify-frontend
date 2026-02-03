// hooks/useTracking.ts
import { useCallback, useEffect, useRef } from 'react';

type ContentType = 'inspiration' | 'nano_inspiration' | 'nano_gallery';
type ActionType = 'view' | 'click' | 'copy' | 'favorite' | 'share';

interface TrackingOptions {
  contentId: string;
  contentType: ContentType;
  actionType: ActionType;
  viewMode?: 'list' | 'cards';
  metadata?: Record<string, any>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Generate a session ID that persists during the browser session
 */
function getSessionId(): string {
  const SESSION_KEY = '_curify_session_id';
  
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Get user ID from local storage (if logged in)
 */
function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_id');
}

/**
 * Track an interaction with the backend
 */
async function trackInteraction(options: TrackingOptions): Promise<void> {
  try {
    const sessionId = getSessionId();
    const userId = getUserId();
    const referrer = typeof window !== 'undefined' ? document.referrer : undefined;
    
    const payload = {
      content_id: options.contentId,
      content_type: options.contentType,
      action_type: options.actionType,
      user_id: userId,
      session_id: sessionId,
      view_mode: options.viewMode,
      referrer: referrer,
      metadata: options.metadata ? JSON.stringify(options.metadata) : undefined,
    };
    
    // Use sendBeacon for reliability (won't be cancelled on page unload)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(`${API_BASE}/interactions/track`, blob);
    } else {
      // Fallback to fetch (might be cancelled on page unload)
      fetch(`${API_BASE}/interactions/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true, // Keep request alive during page unload
      }).catch((err) => {
        console.warn('Failed to track interaction:', err);
      });
    }
  } catch (error) {
    console.warn('Tracking error:', error);
    // Fail silently - don't disrupt user experience
  }
}

/**
 * Hook for tracking interactions
 */
export function useTracking() {
  const track = useCallback((options: TrackingOptions) => {
    trackInteraction(options);
  }, []);
  
  return { track };
}

/**
 * Hook for tracking view events automatically
 * Tracks when an element enters the viewport
 */
export function useViewTracking(
  contentId: string,
  contentType: ContentType,
  viewMode?: 'list' | 'cards',
  options?: {
    threshold?: number;
    once?: boolean;
  }
) {
  const elementRef = useRef<HTMLElement>(null);
  const hasTracked = useRef(false);
  const { track } = useTracking();
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // Don't track if already tracked and once=true
    if (options?.once && hasTracked.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            track({
              contentId,
              contentType,
              actionType: 'view',
              viewMode,
            });
            
            hasTracked.current = true;
            
            // Unobserve after first view if once=true
            if (options?.once) {
              observer.unobserve(element);
            }
          }
        });
      },
      {
        threshold: options?.threshold || 0.5, // 50% visible by default
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [contentId, contentType, viewMode, track, options?.once, options?.threshold]);
  
  return elementRef;
}

/**
 * Hook for tracking click events
 */
export function useClickTracking(
  contentId: string,
  contentType: ContentType,
  viewMode?: 'list' | 'cards'
) {
  const { track } = useTracking();
  
  const trackClick = useCallback(() => {
    track({
      contentId,
      contentType,
      actionType: 'click',
      viewMode,
    });
  }, [contentId, contentType, viewMode, track]);
  
  return trackClick;
}

/**
 * Hook for tracking copy events
 */
export function useCopyTracking(
  contentId: string,
  contentType: ContentType,
  viewMode?: 'list' | 'cards'
) {
  const { track } = useTracking();
  
  const trackCopy = useCallback(() => {
    track({
      contentId,
      contentType,
      actionType: 'copy',
      viewMode,
    });
  }, [contentId, contentType, viewMode, track]);
  
  return trackCopy;
}

/**
 * Hook for tracking share events
 */
export function useShareTracking(
  contentId: string,
  contentType: ContentType,
  viewMode?: 'list' | 'cards'
) {
  const { track } = useTracking();
  
  const trackShare = useCallback(() => {
    track({
      contentId,
      contentType,
      actionType: 'share',
      viewMode,
    });
  }, [contentId, contentType, viewMode, track]);
  
  return trackShare;
}
