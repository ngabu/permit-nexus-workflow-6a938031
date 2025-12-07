import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ActivityLevelStats {
  activityLevel: string;
  total: number;
  passed: number;
  failed: number;
  pending: number;
  clarification: number;
  approvalRate: number;
}

interface SectorStats {
  sectorId: string | null;
  sectorName: string;
  total: number;
  passed: number;
  failed: number;
  pending: number;
  approvalRate: number;
}

interface AssessmentAnalytics {
  byActivityLevel: ActivityLevelStats[];
  bySector: SectorStats[];
  totals: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
    clarification: number;
    overallApprovalRate: number;
  };
}

export function useAssessmentAnalytics() {
  const query = useQuery({
    queryKey: ["assessment-analytics"],
    queryFn: async (): Promise<AssessmentAnalytics> => {
      // Fetch all industrial sectors first
      const { data: sectors, error: sectorsError } = await supabase
        .from("industrial_sectors")
        .select("id, name")
        .order("name");

      if (sectorsError) throw sectorsError;

      // Fetch permit applications with assessments and sector info
      const { data: applications, error } = await supabase
        .from("permit_applications")
        .select(`
          id,
          activity_level,
          industrial_sector_id,
          initial_assessments (
            assessment_status,
            assessment_outcome
          )
        `);

      if (error) throw error;

      const sectorMap = new Map(sectors?.map(s => [s.id, s.name]) || []);

      // Initialize aggregations
      const levelStats: Record<string, ActivityLevelStats> = {};
      const sectorStats: Record<string, SectorStats> = {};
      const totals = {
        total: 0,
        passed: 0,
        failed: 0,
        pending: 0,
        clarification: 0,
        overallApprovalRate: 0
      };

      // Pre-initialize all sectors from database with zero counts
      sectors?.forEach(sector => {
        sectorStats[sector.id] = {
          sectorId: sector.id,
          sectorName: sector.name,
          total: 0,
          passed: 0,
          failed: 0,
          pending: 0,
          approvalRate: 0
        };
      });

      // Add unclassified sector for applications without sector
      sectorStats["unclassified"] = {
        sectorId: null,
        sectorName: "Unclassified",
        total: 0,
        passed: 0,
        failed: 0,
        pending: 0,
        approvalRate: 0
      };

      // Process each application
      applications?.forEach(app => {
        const level = app.activity_level || "Unclassified";
        const sectorId = app.industrial_sector_id;
        
        // Get assessment status
        const assessment = app.initial_assessments?.[0];
        const status = assessment?.assessment_status || "pending";

        // Initialize level stats if needed
        if (!levelStats[level]) {
          levelStats[level] = {
            activityLevel: level,
            total: 0,
            passed: 0,
            failed: 0,
            pending: 0,
            clarification: 0,
            approvalRate: 0
          };
        }

        // Use sector key - sectors are already pre-initialized
        const sectorKey = sectorId || "unclassified";

        // Increment counts
        levelStats[level].total++;
        if (sectorStats[sectorKey]) {
          sectorStats[sectorKey].total++;
        }
        totals.total++;

        if (status === "passed") {
          levelStats[level].passed++;
          if (sectorStats[sectorKey]) {
            sectorStats[sectorKey].passed++;
          }
          totals.passed++;
        } else if (status === "failed") {
          levelStats[level].failed++;
          if (sectorStats[sectorKey]) {
            sectorStats[sectorKey].failed++;
          }
          totals.failed++;
        } else if (status === "requires_clarification") {
          levelStats[level].clarification++;
          totals.clarification++;
        } else {
          levelStats[level].pending++;
          if (sectorStats[sectorKey]) {
            sectorStats[sectorKey].pending++;
          }
          totals.pending++;
        }
      });

      // Calculate approval rates
      Object.values(levelStats).forEach(stat => {
        const completed = stat.passed + stat.failed;
        stat.approvalRate = completed > 0 ? (stat.passed / completed) * 100 : 0;
      });

      Object.values(sectorStats).forEach(stat => {
        const completed = stat.passed + stat.failed;
        stat.approvalRate = completed > 0 ? (stat.passed / completed) * 100 : 0;
      });

      const totalCompleted = totals.passed + totals.failed;
      totals.overallApprovalRate = totalCompleted > 0 ? (totals.passed / totalCompleted) * 100 : 0;

      // Sort levels in order
      const levelOrder = ["Level 1", "Level 2", "Level 3", "Unclassified"];
      const sortedLevels = Object.values(levelStats).sort((a, b) => {
        const aIndex = levelOrder.indexOf(a.activityLevel);
        const bIndex = levelOrder.indexOf(b.activityLevel);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });

      // Sort sectors alphabetically by name
      const sortedSectors = Object.values(sectorStats).sort((a, b) => {
        // Keep "Unclassified" at the end
        if (a.sectorName === "Unclassified") return 1;
        if (b.sectorName === "Unclassified") return -1;
        return a.sectorName.localeCompare(b.sectorName);
      });

      return {
        byActivityLevel: sortedLevels,
        bySector: sortedSectors,
        totals
      };
    }
  });

  return {
    analytics: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}
