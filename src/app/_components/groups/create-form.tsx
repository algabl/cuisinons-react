"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { redirect } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

export function CreateForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });
  const groupCreate = api.group.create.useMutation();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await groupCreate.mutateAsync({
      name: values.name,
    });
    redirect("/app/groups");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Group name" {...field} />
              </FormControl>
              <FormDescription>This is the group&apos;s name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Field that allows you to add multiple email addresses to add users */}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
