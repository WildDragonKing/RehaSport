import { useCallback } from "react";
import {
  doc,
  setDoc,
  increment,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

export interface PageView {
  pageType: "session" | "exercise" | "category" | "home";
  pageId?: string;
  pageTitle?: string;
}

export interface AnalyticsData {
  totalViews: number;
  totalRatings: number;
  topSessions: { id: string; title: string; views: number }[];
  topExercises: { id: string; title: string; views: number }[];
  recentActivity: { date: string; views: number }[];
}

// Track a page view
export function useAnalytics() {
  const trackPageView = useCallback(async (view: PageView) => {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      // Update daily stats
      const dailyRef = doc(db, "analytics", `daily_${today}`);
      await setDoc(
        dailyRef,
        {
          date: today,
          totalViews: increment(1),
          [`${view.pageType}Views`]: increment(1),
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      );

      // Update page-specific stats if we have an ID
      if (view.pageId) {
        const pageRef = doc(
          db,
          "analytics",
          `page_${view.pageType}_${view.pageId.replace(/\//g, "__")}`,
        );
        await setDoc(
          pageRef,
          {
            pageType: view.pageType,
            pageId: view.pageId,
            pageTitle: view.pageTitle || view.pageId,
            totalViews: increment(1),
            lastViewed: Timestamp.now(),
          },
          { merge: true },
        );
      }

      // Update global stats
      const globalRef = doc(db, "analytics", "global");
      await setDoc(
        globalRef,
        {
          totalViews: increment(1),
          [`${view.pageType}Views`]: increment(1),
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      );
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.debug("Analytics tracking failed:", error);
    }
  }, []);

  return { trackPageView };
}

// Get analytics data (for admin dashboard)
export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    // Get global stats
    const globalDoc = await getDocs(
      query(collection(db, "analytics"), limit(1)),
    );
    let totalViews = 0;

    // Get all analytics docs
    const analyticsSnapshot = await getDocs(collection(db, "analytics"));
    const pageDocs: {
      id: string;
      title: string;
      views: number;
      type: string;
    }[] = [];
    const dailyDocs: { date: string; views: number }[] = [];

    analyticsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (doc.id === "global") {
        totalViews = data.totalViews || 0;
      } else if (doc.id.startsWith("page_")) {
        pageDocs.push({
          id: data.pageId,
          title: data.pageTitle || data.pageId,
          views: data.totalViews || 0,
          type: data.pageType,
        });
      } else if (doc.id.startsWith("daily_")) {
        dailyDocs.push({
          date: data.date,
          views: data.totalViews || 0,
        });
      }
    });

    // Get ratings count
    const ratingsSnapshot = await getDocs(collection(db, "ratings"));
    let totalRatings = 0;
    ratingsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalRatings += data.totalRatings || 0;
    });

    // Sort and filter
    const topSessions = pageDocs
      .filter((p) => p.type === "session")
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const topExercises = pageDocs
      .filter((p) => p.type === "exercise")
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const recentActivity = dailyDocs
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);

    return {
      totalViews,
      totalRatings,
      topSessions,
      topExercises,
      recentActivity,
    };
  } catch (error) {
    console.error("Failed to load analytics:", error);
    return {
      totalViews: 0,
      totalRatings: 0,
      topSessions: [],
      topExercises: [],
      recentActivity: [],
    };
  }
}
