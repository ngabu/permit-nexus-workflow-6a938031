import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  convertInchesToTwip,
  PageOrientation,
} from 'docx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

interface ReportData {
  dateRange: string;
  executiveKPIs: {
    totalApplications: number;
    approvedApplications: number;
    pendingApplications: number;
    rejectedApplications: number;
    totalRevenue: number;
    collectedRevenue: number;
    pendingRevenue: number;
    totalInspections: number;
    completedInspections: number;
    scheduledInspections: number;
    avgComplianceScore: number;
    approvalRate: number;
    collectionRate: number;
    totalEntities: number;
    activeEntities: number;
    totalProjectValue: number;
    totalIntents: number;
  };
  investmentByLevel: {
    level2: { value: number; count: number };
    level3: { value: number; count: number };
    total: number;
    totalCount: number;
  };
  investmentYear: number;
  provincialData: Array<{ province: string; activePermits: number }>;
  sectoralDistribution: { data: Array<{ sector: string; count: number }>; total: number };
  permitTypeDistribution: Array<{ name: string; value: number }>;
  statusDistribution: Array<{ name: string; value: number }>;
  entityTypeDistribution: Array<{ name: string; value: number }>;
  complianceTabData: {
    totalPermits: number;
    totalComplianceReports: number;
    permitsBySector: Array<{ sector: string; count: number }>;
    totalInspectionsCarried: number;
    violationsReported: number;
  };
  complianceReportsPerMonth: { months: Array<{ month: string; reports: number }>; total: number };
  yearlySuccessfulInspections: Array<{ year: number; completed: number; total: number; successRate: number }>;
  monthlyTrends: Array<{ month: string; applications: number; approvals: number; revenue: number }>;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PG', { style: 'currency', currency: 'PGK', maximumFractionDigits: 0 }).format(amount);
};

// Create a simple table for KPI cards
const createKPITable = (items: Array<{ label: string; value: string | number }>) => {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: items.map(item => 
          new TableCell({
            width: { size: Math.floor(100 / items.length), type: WidthType.PERCENTAGE },
            shading: { fill: "E8F5E9", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: item.label, bold: true, size: 20 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: String(item.value), bold: true, size: 28 }),
                ],
              }),
            ],
          })
        ),
      }),
    ],
  });
};

// Create a data table
const createDataTable = (headers: string[], rows: string[][]) => {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header row
      new TableRow({
        tableHeader: true,
        children: headers.map(header => 
          new TableCell({
            shading: { fill: "1B5E20", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: header, bold: true, color: "FFFFFF", size: 20 }),
                ],
              }),
            ],
          })
        ),
      }),
      // Data rows
      ...rows.map((row, rowIndex) => 
        new TableRow({
          children: row.map(cell => 
            new TableCell({
              shading: { fill: rowIndex % 2 === 0 ? "FFFFFF" : "F5F5F5", type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: cell, size: 20 }),
                  ],
                }),
              ],
            })
          ),
        })
      ),
    ],
  });
};

// Create section heading
const createSectionHeading = (text: string) => {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 28,
        color: "1B5E20",
      }),
    ],
  });
};

// Create subsection heading
const createSubsectionHeading = (text: string) => {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 24,
      }),
    ],
  });
};

// Create description paragraph with placeholder
const createDescriptionPlaceholder = (context: string) => {
  return new Paragraph({
    spacing: { before: 100, after: 200 },
    children: [
      new TextRun({
        text: `[Description: ${context}]`,
        italics: true,
        color: "666666",
        size: 20,
      }),
    ],
  });
};

// Create a horizontal line separator
const createSeparator = () => {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: {
      bottom: { color: "1B5E20", style: BorderStyle.SINGLE, size: 6 },
    },
    children: [],
  });
};

export const exportReportToDocx = async (data: ReportData) => {
  // Fetch the PNG emblem as base64
  let emblemImage: ImageRun | null = null;
  try {
    const response = await fetch('/images/png-emblem.png');
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    emblemImage = new ImageRun({
      data: arrayBuffer,
      transformation: { width: 80, height: 80 },
    });
  } catch (error) {
    console.error('Failed to load emblem image:', error);
  }

  const headerElements: Paragraph[] = [];

  // Add emblem if loaded
  if (emblemImage) {
    headerElements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [emblemImage],
      })
    );
  }

  // Organization Header - matching the screenshot design
  headerElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Conservation & Environment Protection Authority",
          bold: true,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({
          text: "PERMIT MANAGEMENT REPORT",
          bold: true,
          size: 36,
          color: "1B5E20",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
      children: [
        new TextRun({
          text: `Report Generated: ${format(new Date(), 'dd MMMM yyyy, HH:mm')}`,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Data Period: ${data.dateRange}`,
          size: 20,
        }),
      ],
    }),
    createSeparator()
  );

  // Executive Overview Section
  const executiveOverviewSection = [
    createSectionHeading("1. Executive Overview"),
    createDescriptionPlaceholder("Summary of overall permit management performance and key metrics"),
    createSubsectionHeading("Key Performance Indicators"),
    createKPITable([
      { label: "Total Applications", value: data.executiveKPIs.totalApplications },
      { label: "Approval Rate", value: `${data.executiveKPIs.approvalRate}%` },
      { label: "Revenue Collected", value: formatCurrency(data.executiveKPIs.collectedRevenue) },
      { label: "Compliance Score", value: `${data.executiveKPIs.avgComplianceScore}%` },
    ]),
    new Paragraph({ spacing: { before: 200 } }),
    createKPITable([
      { label: "Registered Entities", value: data.executiveKPIs.totalEntities },
      { label: "Active Entities", value: data.executiveKPIs.activeEntities },
      { label: "Completed Inspections", value: data.executiveKPIs.completedInspections },
      { label: "Pending Applications", value: data.executiveKPIs.pendingApplications },
    ]),
    new Paragraph({ spacing: { before: 300 } }),
    createSubsectionHeading("Application Status Distribution"),
    createDataTable(
      ["Status", "Count", "Percentage"],
      data.statusDistribution.map(item => [
        item.name,
        String(item.value),
        `${data.executiveKPIs.totalApplications > 0 ? ((item.value / data.executiveKPIs.totalApplications) * 100).toFixed(1) : 0}%`
      ])
    ),
    new Paragraph({ spacing: { before: 300 } }),
    createSubsectionHeading("Applications by Permit Type"),
    createDataTable(
      ["Permit Type", "Count", "Percentage"],
      data.permitTypeDistribution.slice(0, 10).map(item => [
        item.name,
        String(item.value),
        `${data.executiveKPIs.totalApplications > 0 ? ((item.value / data.executiveKPIs.totalApplications) * 100).toFixed(1) : 0}%`
      ])
    ),
    new Paragraph({ spacing: { before: 300 } }),
    createSubsectionHeading("Entity Type Distribution"),
    createDataTable(
      ["Entity Type", "Count", "Percentage"],
      data.entityTypeDistribution.map(item => [
        item.name,
        String(item.value),
        `${data.executiveKPIs.totalEntities > 0 ? ((item.value / data.executiveKPIs.totalEntities) * 100).toFixed(1) : 0}%`
      ])
    ),
  ];

  // Investment Value Section
  const investmentSection = [
    createSectionHeading("2. Investment Value Analysis"),
    createDescriptionPlaceholder("Analysis of project investment values by activity level"),
    createSubsectionHeading(`Investment Summary for ${data.investmentYear}`),
    createDataTable(
      ["Activity Level", "Investment Value", "Number of Permits"],
      [
        ["Level 2 Activities", formatCurrency(data.investmentByLevel.level2.value), String(data.investmentByLevel.level2.count)],
        ["Level 3 Activities", formatCurrency(data.investmentByLevel.level3.value), String(data.investmentByLevel.level3.count)],
        ["Total", formatCurrency(data.investmentByLevel.total), String(data.investmentByLevel.totalCount)],
      ]
    ),
  ];

  // Geographic Analysis Section
  const geographicSection = [
    createSectionHeading("3. Geographic Analysis"),
    createDescriptionPlaceholder("Provincial and sectoral distribution of active permits across Papua New Guinea"),
    createSubsectionHeading("Active Permits by Province"),
    createDataTable(
      ["Province", "Active Permits"],
      data.provincialData.filter(p => p.activePermits > 0).map(item => [
        item.province,
        String(item.activePermits),
      ])
    ),
    new Paragraph({ spacing: { before: 300 } }),
    createSubsectionHeading(`Sectoral Distribution of Active Permits (Total: ${data.sectoralDistribution.total})`),
    createDataTable(
      ["Sector", "Count", "Percentage"],
      data.sectoralDistribution.data.slice(0, 15).map(item => [
        item.sector,
        String(item.count),
        `${data.sectoralDistribution.total > 0 ? ((item.count / data.sectoralDistribution.total) * 100).toFixed(1) : 0}%`
      ])
    ),
  ];

  // Compliance & Enforcement Section
  const complianceSection = [
    createSectionHeading("4. Compliance & Enforcement"),
    createDescriptionPlaceholder("Overview of compliance monitoring and enforcement activities"),
    createSubsectionHeading("Compliance Statistics"),
    createKPITable([
      { label: "Total Permits", value: data.complianceTabData.totalPermits },
      { label: "Compliance Reports", value: data.complianceTabData.totalComplianceReports },
      { label: "Inspections Carried Out", value: data.complianceTabData.totalInspectionsCarried },
      { label: "Violations Reported", value: data.complianceTabData.violationsReported },
    ]),
    new Paragraph({ spacing: { before: 300 } }),
    createSubsectionHeading(`Total Compliance Reports per Month (Total: ${data.complianceReportsPerMonth.total})`),
    createDataTable(
      ["Month", "Reports Submitted"],
      data.complianceReportsPerMonth.months.map(item => [
        item.month,
        String(item.reports),
      ])
    ),
    new Paragraph({ spacing: { before: 300 } }),
    createSubsectionHeading("Yearly Successful Inspections"),
    createDataTable(
      ["Year", "Completed", "Total", "Success Rate"],
      data.yearlySuccessfulInspections.map(item => [
        String(item.year),
        String(item.completed),
        String(item.total),
        `${item.successRate}%`
      ])
    ),
  ];

  // Financial Performance Section
  const financialSection = [
    createSectionHeading("5. Financial Performance"),
    createDescriptionPlaceholder("Revenue collection and financial performance metrics"),
    createSubsectionHeading("Revenue Summary"),
    createKPITable([
      { label: "Total Revenue", value: formatCurrency(data.executiveKPIs.totalRevenue) },
      { label: "Collected", value: formatCurrency(data.executiveKPIs.collectedRevenue) },
      { label: "Outstanding", value: formatCurrency(data.executiveKPIs.pendingRevenue) },
      { label: "Collection Rate", value: `${data.executiveKPIs.collectionRate}%` },
    ]),
    new Paragraph({ spacing: { before: 300 } }),
    createSubsectionHeading("Monthly Revenue Trend"),
    createDataTable(
      ["Month", "Revenue Collected"],
      data.monthlyTrends.slice(-6).map(item => [
        item.month,
        formatCurrency(item.revenue),
      ])
    ),
  ];

  // Trends & Forecasting Section
  const trendsSection = [
    createSectionHeading("6. Trends & Forecasting"),
    createDescriptionPlaceholder("Historical trends and forecasting analysis for strategic planning"),
    createSubsectionHeading("Monthly Application & Approval Trends"),
    createDataTable(
      ["Month", "Applications", "Approvals", "Revenue"],
      data.monthlyTrends.slice(-6).map(item => [
        item.month,
        String(item.applications),
        String(item.approvals),
        formatCurrency(item.revenue),
      ])
    ),
    new Paragraph({ spacing: { before: 300 } }),
    createSubsectionHeading("Executive Insights"),
    new Paragraph({
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({
          text: "Positive Indicators:",
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      bullet: { level: 0 },
      children: [
        new TextRun({
          text: `${data.executiveKPIs.approvalRate}% approval rate demonstrates effective regulatory framework`,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      bullet: { level: 0 },
      children: [
        new TextRun({
          text: `${formatCurrency(data.executiveKPIs.collectedRevenue)} revenue collected supports government initiatives`,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      bullet: { level: 0 },
      children: [
        new TextRun({
          text: `${data.executiveKPIs.totalEntities} registered entities contributing to economic development`,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: "Areas Requiring Attention:",
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      bullet: { level: 0 },
      children: [
        new TextRun({
          text: `${data.executiveKPIs.pendingApplications} applications pending review require expedited processing`,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      bullet: { level: 0 },
      children: [
        new TextRun({
          text: `${formatCurrency(data.executiveKPIs.pendingRevenue)} in outstanding payments require follow-up`,
          size: 20,
        }),
      ],
    }),
  ];

  // Footer
  const footerSection = [
    createSeparator(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [
        new TextRun({
          text: "--- End of Report ---",
          italics: true,
          size: 20,
          color: "666666",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100 },
      children: [
        new TextRun({
          text: "Conservation & Environment Protection Authority © " + new Date().getFullYear(),
          size: 18,
          color: "999999",
        }),
      ],
    }),
  ];

  // Create the document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: convertInchesToTwip(8.27), // A4 width
            height: convertInchesToTwip(11.69), // A4 height
          },
          margin: {
            top: convertInchesToTwip(0.75),
            bottom: convertInchesToTwip(0.75),
            left: convertInchesToTwip(0.75),
            right: convertInchesToTwip(0.75),
          },
        },
      },
      children: [
        ...headerElements,
        ...executiveOverviewSection,
        ...investmentSection,
        ...geographicSection,
        ...complianceSection,
        ...financialSection,
        ...trendsSection,
        ...footerSection,
      ],
    }],
  });

  // Generate and save the document
  const blob = await Packer.toBlob(doc);
  const filename = `CEPA_Permit_Management_Report_${format(new Date(), 'yyyy-MM-dd_HHmm')}.docx`;
  saveAs(blob, filename);
  
  return filename;
};
