"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { Label } from "@/components/ui//label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  inviteCode: z.string().min(1, {
    message: "Invite code is required.",
  }),
});

export const JoinModal = () => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { isOpen, onClose, type } = useModal();
  const { toast } = useToast();

  const isModalOpen = isOpen && type === "joinServer";

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inviteCode: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await axios.put(`/api/servers`, {
        inviteCode: values.inviteCode,
      });

      if (res?.data.id) {
        toast({
          title: "Joining server successfully",
          description: "You've joined a server, let's enjoy it.",
        });
        onClose();
        setTimeout(() => {
          router.push(`/servers/${res.data.id}`);
          router.refresh();
        }, 500);
      }
    } catch (error: any) {
      toast({
        title: "Joining server failed",
        description: error.response.data || "",
      });
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Join a server
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 join-modal">
          <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
            Server invite link
          </Label>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="inviteCode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter your invite code"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter className="flex justify-center">
                <Button
                  variant="primary"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  Send Invite
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
