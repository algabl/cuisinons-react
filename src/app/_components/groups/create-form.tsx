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

import { api } from "~/trpc/server";
import { redirect } from "next/navigation";
import { createGroup } from "~/app/actions";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  emails: z
    .array(z.string().email({ message: "Invalid email address" }))
    .optional(),
});

export function CreateForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });
  // async function onSubmit(formData: FormData) {
  //   "use server";
  //   // await api.group.create({
  //   //   name: formData.get("name") as string,
  //   // });
  //   redirect("/app/groups");
  // }

  

  return (
    <Form {...form}>
      <form action={createGroup} className="space-y-4">
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

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

{
  /* Field that allows you to add multiple email addresses to add users, with search */
}
{
  /* {form.watch("emails")?.map((email, idx) => (
  <FormField
    key={idx}
    control={form.control}
    name={`emails.${idx}`}
    render={({ field }) => (
      <FormItem className="flex items-end gap-2">
        <div className="relative flex-1">
          <FormLabel>Email {idx + 1}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                placeholder="Email address"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  setSearchEmail(e.target.value);
                }}
                autoComplete="off"
              />
              {searchEmail &&
                userSearch.data &&
                userSearch.data.length > 0 && (
                  <div className="bg-popover text-popover-foreground absolute right-0 left-0 z-10 mt-1 rounded-md border shadow-lg">
                    <Command className="max-h-48 overflow-y-auto">
                      <CommandList>
                        {userSearch.isLoading && (
                          <CommandItem disabled>Loading…</CommandItem>
                        )}
                        <CommandEmpty>No users found.</CommandEmpty>
                        {userSearch.data?.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.email}
                            onSelect={() => {
                              form.setValue(
                                `emails.${idx}`,
                                user.email,
                              );
                              setSearchEmail(""); // close popover
                            }}
                          >
                            <span className="font-medium">
                              {user.name}
                            </span>
                            <span className="text-muted-foreground ml-2 text-xs">
                              {user.email}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </div>
                )}
            </div>
          </FormControl>
          <FormDescription>
            Search and add user by email address.
          </FormDescription>
          <FormMessage />
        </div>
      </FormItem>
    )}
  />
))} */
}

{
  /* <Button
  type="button"
  variant="secondary"
  onClick={() => {
    const emails = form.getValues("emails") ?? [];
    form.setValue("emails", [...emails, ""]);
  }}
>
  Add another email
</Button> */
}
