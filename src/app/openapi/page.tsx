"use client";

import { contract } from "@/contracts/contract";
import { generateOpenApi } from "@ts-rest/open-api";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function OpenAPI() {
  const openApiDocument = generateOpenApi(contract, {
    info: {
      title: "API",
      version: "1.0.0",
    },
  });

  return <SwaggerUI spec={openApiDocument} />;
}
