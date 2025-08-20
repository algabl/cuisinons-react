"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addMember } from "~/app/actions";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  groupId: z.string(),
  role: z.enum(["admin", "member"]),
});

export function UserSearch(props: { groupId: string }) {
  type FormSchemaType = z.infer<typeof formSchema>;
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      groupId: props.groupId,
      role: "member",
    },
  });
  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const userSearch = api.user.searchByEmail.useQuery({
    email: debouncedSearch,
  });

  return (
    <Form {...form}>
      <form action={addMember}>
        <FormField
          control={form.control}
          name="groupId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="hidden"
                  {...field}
                  name="groupId"
                  autoComplete="off"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-1 items-end">
                <div className="relative flex-1">
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Email address"
                        {...field}
                        name="email"
                        autoComplete="off"
                        onChange={(e) => {
                          field.onChange(e);
                          setSearch(e.target.value);
                        }}
                      />
                      {search &&
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
                                    value={user.emailAddress}
                                    onSelect={() => {
                                      form.setValue(`email`, user.emailAddress);
                                      setSearch(""); // close popover
                                    }}
                                  >
                                    <Image
                                      src={user.imageUrl ?? ""}
                                      alt={user.fullName ?? ""}
                                      className="mb-2 h-10 w-10 rounded-full"
                                      width={40}
                                      height={40}
                                    />
                                    <span className="font-medium">
                                      {user.fullName}
                                    </span>
                                    <span className="text-muted-foreground ml-2 text-xs">
                                      {user.emailAddress}
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
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="min-w-5">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {/* <FormDescription className="line-clamp-1">
            Role of the user in the group.
          </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="mt-4">
          Add Member
        </Button>
      </form>
    </Form>
  );
}
