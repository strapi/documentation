import React, { useState } from 'react';
import { OramaSearchBox } from "@orama/react-components";

const searchBoxConfig = {
  "resultsMap": {
    "path": "path",
    "title": "title",
    "description": "content"
  },
  "colorScheme": "system",
  "themeConfig": {}
};

const MyOramaSearchBoxComponent = () => {
  const [open, setOpen] = useState(false); // Changé à false par défaut
  
  return (
    <>
      <OramaSearchBox
        open={open}
        onOpenChange={setOpen}
        index={{
          endpoint: "https://cloud.orama.run/v1/indexes/docs-next-ntc1j6",
          api_key: "6NG5Tqf1adCPYUD9jOksloskVsKajXdf",
        }}
        {...searchBoxConfig}
      />
    </>
  );
};

export default MyOramaSearchBoxComponent;