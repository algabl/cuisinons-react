"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { ImportTextData, ImportUrlData } from "~/lib/validations";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { importTextSchema, importUrlSchema } from "~/lib/validations";

interface ImportInputStepProps {
  inputMethod: "url" | "text";
  inputData?: ImportUrlData | ImportTextData;
  onMethodChange: (method: "url" | "text") => void;
  onDataChange: (data: ImportUrlData | ImportTextData) => void;
  onNext: () => void;
}

export function ImportInputStep({
  inputMethod,
  inputData,
  onMethodChange,
  onDataChange,
  onNext,
}: ImportInputStepProps) {
  const [isValid, setIsValid] = useState(false);

  const urlForm = useForm<ImportUrlData>({
    resolver: zodResolver(importUrlSchema),
    defaultValues: {
      url: inputData && "url" in inputData ? inputData.url : "",
      userConsent:
        inputData && "userConsent" in inputData ? inputData.userConsent : false,
      skipDirectFetch:
        inputData && "skipDirectFetch" in inputData
          ? inputData.skipDirectFetch
          : false,
    },
  });

  const textForm = useForm<ImportTextData>({
    resolver: zodResolver(importTextSchema),
    defaultValues: {
      content: inputData && "content" in inputData ? inputData.content : "",
      sourceUrl:
        inputData && "sourceUrl" in inputData ? inputData.sourceUrl : "",
    },
  });

  const handleUrlSubmit = (data: ImportUrlData) => {
    onDataChange(data);
    onNext();
  };

  const handleTextSubmit = (data: ImportTextData) => {
    onDataChange(data);
    onNext();
  };

  const checkUrlFormValid = () => {
    const values = urlForm.getValues();
    const result = importUrlSchema.safeParse(values);
    setIsValid(result.success);
  };

  const checkTextFormValid = () => {
    const values = textForm.getValues();
    const result = importTextSchema.safeParse(values);
    setIsValid(result.success);
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Import a recipe from a URL or paste recipe text directly.
      </p>

      <Tabs
        value={inputMethod}
        onValueChange={(value) => onMethodChange(value as "url" | "text")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">Import from URL</TabsTrigger>
          <TabsTrigger value="text">Import from Text</TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <Form {...urlForm}>
            <form
              onSubmit={urlForm.handleSubmit(handleUrlSubmit)}
              className="space-y-4"
            >
              <FormField
                control={urlForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/recipe"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          checkUrlFormValid();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={urlForm.control}
                name="userConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          checkUrlFormValid();
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I confirm I have permission to import this content
                      </FormLabel>
                      <p className="text-muted-foreground text-sm">
                        Only import recipes from sources where you have the
                        right to use the content.
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={urlForm.control}
                name="skipDirectFetch"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          checkUrlFormValid();
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Skip direct fetch (testing mode)</FormLabel>
                      <p className="text-muted-foreground text-sm">
                        Enable this for testing or if the site blocks automated
                        access.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <Form {...textForm}>
            <form
              onSubmit={textForm.handleSubmit(handleTextSubmit)}
              className="space-y-4"
            >
              <FormField
                control={textForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your recipe content here..."
                        className="min-h-[200px]"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          checkTextFormValid();
                        }}
                      />
                    </FormControl>
                    <p className="text-muted-foreground text-sm">
                      {field.value?.length || 0} / 50,000 characters
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={textForm.control}
                name="sourceUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source URL (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/original-recipe"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          checkTextFormValid();
                        }}
                      />
                    </FormControl>
                    <p className="text-muted-foreground text-sm">
                      URL where this recipe was originally found (for
                      attribution).
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
