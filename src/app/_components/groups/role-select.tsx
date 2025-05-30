"use client";

import { useRef, useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Spinner } from "~/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "~/components/ui/select";

import { type Group, type User } from "~/server/api/types";

export function RoleSelect(props: { member: User; group: Group }) {
  const { member, group } = props;
  const [role, setRole] = useState<"admin" | "member" | "owner">(
    member.role ?? "member",
  );
  const updateMember = api.group.updateMember.useMutation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    updateMember.mutate({
      userId: member.userId,
      groupId: group.id,
      role,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return (
    <>
      <Select
        name="role"
        value={role}
        disabled={updateMember.isPending}
        onValueChange={(value) => setRole(value as "admin" | "member")}
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
