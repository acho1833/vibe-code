'use client';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/trpc/client';
import { useClerk } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUpIcon, Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import TextareaAutoResize from 'react-textarea-autosize';
import { z } from 'zod';
import { PROJECT_TEMPLATES } from '../../constants';

const formSchema = z.object({
    value: z
        .string()
        .min(1, 'Value is required')
        .max(10000, 'Value must be less than 10000 characters'),
});

const ProjectForm = () => {
    const router = useRouter();
    const trpc = useTRPC();
    const clerk = useClerk();
    const queryClient = useQueryClient();
    const createProject = useMutation(
        trpc.projects.create.mutationOptions({
            onSuccess: (data) => {
                queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
                queryClient.invalidateQueries(trpc.usage.status.queryOptions());
                router.push(`/projects/${data.id}`);
            },
            onError: (error) => {
                if (error.data?.code === 'UNAUTHORIZED') {
                    clerk.openSignIn();
                    return;
                }

                if (error.data?.code === 'TOO_MANY_REQUESTS') {
                    router.push('/pricing');
                }
            },
        })
    );
    const [isFocused, setIsFocused] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        await createProject.mutateAsync({
            value: data.value,
        });
    };

    const onSelect = (content: string) => {
        form.setValue('value', content, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    const isPending = createProject.isPending;
    const isButtonDisabled = isPending || !form.formState.isValid;

    return (
        <Form {...form}>
            <section className="space-y-6">
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className={cn(
                        'relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all',
                        isFocused && 'shadow-xs'
                    )}
                >
                    <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                            <TextareaAutoResize
                                {...field}
                                disabled={isPending}
                                placeholder="What would you like to build?"
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                minRows={2}
                                maxRows={8}
                                className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                        e.preventDefault();
                                        form.handleSubmit(onSubmit)(e);
                                    }
                                }}
                            />
                        )}
                    />
                    <div className="flex gap-x-2 items-end justify-between pt-2">
                        <div className="text-[10px] text-muted-foreground font-mono">
                            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                <span>&#8984;</span>Enter
                            </kbd>
                            &nbsp;to submit
                        </div>
                        <Button
                            className={cn(
                                'size-8 rounded-full',
                                isButtonDisabled && 'bg-muted-foreground  border'
                            )}
                            disabled={isButtonDisabled}
                        >
                            {isPending ? (
                                <Loader2Icon className="animate-spin size-4" />
                            ) : (
                                <ArrowUpIcon />
                            )}
                        </Button>
                    </div>
                </form>
                <div className="flex-wrap justify-center gap-2  hidden md:flex max-w-3xl">
                    {PROJECT_TEMPLATES.map((template) => (
                        <Button
                            key={template.title}
                            variant="outline"
                            size="sm"
                            className="bg-white dark:bg-sidebar"
                            onClick={() => {
                                onSelect(template.prompt);
                            }}
                        >
                            {template.emoji} {template.title}
                        </Button>
                    ))}
                </div>
            </section>
        </Form>
    );
};

export default ProjectForm;
