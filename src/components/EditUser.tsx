"use client";

import React, { useState } from "react";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";

import type { SubmitHandler } from "react-hook-form";
import { formSchema } from "@/lib/schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
  profile: {
    phone: string | null;
    bio: string | null;
  } | null;
  role: {
    name: string;
    longName: string | null;
  };
}

interface Role {
  id: string;
  name: string;
  longName: string | null;
}

interface EditUserProps {
  user: User;
  roles: Role[];
  canEditRole?: boolean;
  onClose?: () => void;
}

const EditUser = ({ user, roles, canEditRole = false, onClose }: EditUserProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email,
      phone: user.profile?.phone || "",
      role: user.role?.name || "USER",
      image: user.image || "",
      bio: user.profile?.bio || "",
    },
  });

  const [file, setFile] = useState<File | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  const MAX_WIDTH = 5000;
  const MAX_HEIGHT = 5000;

  const FileUploadField = ({ field }: { field: any }) => {
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      if (selectedFile.size > MAX_FILE_SIZE) {
        setUploadError("A fájl mérete nem lehet nagyobb, mint 2MB.");
        setFile(undefined);
        field.onChange('');
        return;
      }

      const img = new Image();
      img.src = URL.createObjectURL(selectedFile);

      img.onload = () => {
        if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
          setUploadError(`A kép mérete maximum ${MAX_WIDTH}x${MAX_HEIGHT} pixel lehet.`);
          setFile(undefined);
          e.target.value = '';
          field.onChange('');
          return;
        }

        setFile(selectedFile);
        setUploadError(null);

        field.onChange(selectedFile.name);
      };

      img.onerror = () => {
        setUploadError("Nem sikerült betölteni a képet.");
        setFile(undefined);
        e.target.value = '';
        field.onChange('');
      };
    };

    return (
      <div>
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadIcon className="w-10 h-10 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG(MAX. 800x400px)</p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            accept=".png, .jpg, .jpeg"
            className="hidden"
            onChange={onFileChange}
            disabled={uploading}
          />
        </label>

        {uploadError && (
          <p className="text-red-600 mt-2">Hiba a feltöltés során: {uploadError}</p>
        )}

        {file && (
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="font-medium" style={{ maxWidth: '100%', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {file.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              {field.value && (
                <p className="text-sm text-green-600">Feltöltve: {field.value}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const router = useRouter();
  const { update } = useSession();

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    setUploadError(null);

    if (file) {
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Fájl feltöltése sikertelen");
        }

        const uploadData = await res.json();

        data.image = uploadData.filePath ?? data.image ?? "";
      } catch (error: any) {
        setUploadError(error.message || "Ismeretlen hiba");
        setUploading(false);
        return;
      }

      setUploading(false);
    }

    try {
      const res = await fetch("/api/updateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          ...data,
          role: canEditRole ? data.role : undefined,
        }),
      });

      if (!res.ok) {
        toast.error("Error: Frissítés sikertelen!");
        throw new Error("Frissítés sikertelen");
      }

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || "Frissítés sikertelen");
      }

      toast.success("Felhasználó sikeresen frissítve!");
      await update();
      router.refresh(); 
      if (onClose) onClose();
    } catch (error: any) {
      setUploadError(error.message || "Ismeretlen hiba frissítés során");
    }

  };

  return (
    <SheetContent className="overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Felhasználó szerkesztése</SheetTitle>
      <SheetDescription className="mb-4">
        Módosítsa a felhasználó adatait az alábbi űrlapon.
      </SheetDescription>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Név</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {canEditRole && (
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beosztás</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || "user"}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={user.role?.name || "Unassigned"} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.longName || role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profilkép</FormLabel>
              <FormControl>
                <FileUploadField field={field} />
              </FormControl>
              <FormDescription>Profilkép feltöltése (nem kötelező).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={uploading}>
          {uploading ? "Feltöltés folyamatban..." : "Mentés"}
        </Button>
      </form>
    </Form>
    </SheetHeader>
</SheetContent>

  );
};

export default EditUser;
