export const ReportPdfNoBordersLayout = {
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  paddingBottom: () => 0,
};

export const ReportPdfOuterBorderLayout = {
  ...ReportPdfNoBordersLayout,
  hLineWidth: () => 1,
  vLineWidth: () => 1,
};

export const ReportPdfThinGridLayout = {
  ...ReportPdfNoBordersLayout,
  hLineWidth: () => 0.35,
  vLineWidth: () => 0.35,
};

export const ReportPdfAccountingGridLayout = {
  hLineColor: () => "#E5E7EB",
  hLineWidth: () => 0.6,
  paddingBottom: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  vLineColor: () => "#E5E7EB",
  vLineWidth: () => 0.6,
};

export const ReportPdfRequestFormLayout = {
  ...ReportPdfNoBordersLayout,
  hLineWidth: () => 1,
  vLineWidth: () => 1,
  hLineColor: () => "#000000",
  vLineColor: () => "#000000",
};
