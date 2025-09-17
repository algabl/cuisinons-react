import React from "react";

import type { ButtonProps } from "./ui/button";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

export const SpinnerButton = ({
  loading = false,
  children,
  ...props
}: { loading?: boolean } & ButtonProps) => (
  <Button disabled={loading} {...props}>
    {loading && <Spinner className="text-secondary p-1" />}
    {loading ? "Loading..." : (children ?? "Submit")}
  </Button>
);
