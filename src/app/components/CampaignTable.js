"use client";

import CustomDataGrid from "../CustomDataGrid";
import { CAMPAIGN_COLUMNS } from "../../constants/campaigns";

const CampaignTable = ({ campaigns, pagination, setPagination, sortModel, setSortModel, onEdit }) => {
  return (
    <CustomDataGrid
      rows={campaigns}
      columns={CAMPAIGN_COLUMNS(onEdit)}
      totalRows={pagination.total}
      pagination={pagination}
      setPagination={setPagination}
      sortModel={sortModel}
      setSortModel={setSortModel}
    />
  );
};

export default CampaignTable;
