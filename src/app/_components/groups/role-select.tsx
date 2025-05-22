"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { Spinner } from "~/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "~/components/ui/select";

type User = NonNullable<
  inferRouterOutputs<AppRouter>["group"]["getMemberById"]
>;
type Group = NonNullable<inferRouterOutputs<AppRouter>["group"]["getById"]>;

export function RoleSelect(props: { member: User; group: Group }) {
  const { member, group } = props;
  const [role, setRole] = useState<"admin" | "member" | "owner">(
    member.role ?? "member",
  );
  const updateMember = api.group.updateMember.useMutation();

  const handleChange = (value: "admin" | "member") => {
    setRole(value);
    updateMember.mutate({
      userId: member.userId,
      groupId: group.id,
      role: value,
    });
  };

  return (
    <>
      <Select
        name="role"
        value={role}
        disabled={updateMember.isPending}
        onValueChange={handleChange}
        defaultValue={role}
      >
        <SelectTrigger className="min-w-28">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      {updateMember.isPending && <Spinner />}
    </>
  );
}
