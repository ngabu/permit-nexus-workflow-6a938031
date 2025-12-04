import { toast } from "sonner";

/**
 * Utility function for exporting intent registration details as PDF
 * Uses browser's print functionality with A4 formatting and consistent styling
 */
export const exportIntentRegistrationPDF = (
  setOpenSections?: React.Dispatch<React.SetStateAction<{
    registration: boolean;
    projectSite: boolean;
    stakeholder: boolean;
    financial: boolean;
  }>>
) => {
  // Show instructions to user about disabling browser headers/footers
  toast.info("Print Settings Required", {
    description: "In the print dialog, please disable 'Headers and footers' under 'More settings' for a clean PDF output.",
    duration: 8000,
  });
  
  // Store original page title
  const originalTitle = document.title;
  
  // Set empty title to minimize header content
  document.title = ' ';
  
  // If section expansion callback provided, expand all sections before printing
  if (setOpenSections) {
    setOpenSections({
      registration: true,
      projectSite: true,
      stakeholder: true,
      financial: true,
    });
  }
  
  // Wait for sections to expand and DOM to update, then trigger print
  setTimeout(() => {
    window.print();
    
    // Restore original title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  }, 100);
};
