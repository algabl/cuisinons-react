"use server";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { api } from "~/trpc/server";

export async function createGroup(formData: FormData) {
  const session = await auth();
  if (!session.userId) {
    redirect("/sign-in");
  }
  const id = await api.group.create({
    name: formData.get("name") as string,
  });
  redirect(`/app/groups/${id}`);
}

export async function addMember(formData: FormData) {
  const session = await auth();
  if (!session.userId) {
    redirect("/sign-in");
  }
  const groupId = formData.get("groupId") as string;
  console.log("groupId", groupId);
  const email = formData.get("email") as string;
  console.log("email", email);
  const roleValue = formData.get("role");
  const role =
    roleValue === "admin" || roleValue === "member" ? roleValue : "member";
  console.log("role", role);
  await api.group.addMember({
    groupId,
    email,
    role,
  });
  redirect(`/app/groups/${groupId}`);
}

export async function updateMember(formData: FormData) {
  const session = await auth();
  if (!session.userId) {
    redirect("/sign-in");
  }
  const groupId = formData.get("groupId") as string;
  const userId = formData.get("userId") as string;
  const roleValue = formData.get("role");
  const role =
    roleValue === "admin" || roleValue === "member" ? roleValue : "member";
  await api.group.updateMember({
    groupId,
    userId,
    role,
  });
  // redirect(`/app/groups/${groupId}`);
}

export async function deleteMember(formData: FormData) {
  const session = await auth();
  console.log(formData);
  if (!session.userId) {
    redirect("/sign-in");
  }
}
