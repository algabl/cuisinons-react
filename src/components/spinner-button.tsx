import React from "react";
import { Button, type ButtonProps } from "./ui/button";
import { Spinner } from "./ui/spinner";
export const SpinnerButton = ({
  loading = false,
  children,
  ...props
}: { loading?: boolean } & ButtonProps) => (
  <Button disabled={loading} {...props}>
    {loading ? "Loading..." : (children ?? "Submit")}
    {loading && <Spinner />}
  </Button>
);
