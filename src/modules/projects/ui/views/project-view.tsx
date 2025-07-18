'use client';
import FileExplorer from '@/components/file-explorer';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserControl from '@/components/user-control';
import { Fragment } from '@/generated/prisma';
import { useAuth } from '@clerk/nextjs';
import { CodeIcon, CrownIcon, EyeIcon } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import FragmentWeb from '../components/fragment-web';
import MessagesContainer from '../components/messages-container';
import ProjectHeader from '../components/project-header';

type Props = {
    projectId: string;
};

const ProjectView = ({ projectId }: Props) => {
    const { has } = useAuth();
    const hasProAccess = has?.({ plan: 'pro' });
    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
    const [tabState, setTabState] = useState<'code' | 'preview'>('preview');

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0">
                    <ErrorBoundary
                        fallback={<div>Something went wrong while loading the project header.</div>}
                    >
                        <Suspense fallback={<div>Loading project header...</div>}>
                            <ProjectHeader projectId={projectId} />
                        </Suspense>
                    </ErrorBoundary>
                    <ErrorBoundary
                        fallback={<div>Something went wrong while loading messages.</div>}
                    >
                        <Suspense fallback={<div>Loading project details...</div>}>
                            <MessagesContainer
                                projectId={projectId}
                                activeFragment={activeFragment}
                                setActiveFragment={setActiveFragment}
                            />
                        </Suspense>
                    </ErrorBoundary>
                </ResizablePanel>
                <ResizableHandle className="hover:bg-primary transition-colors" />
                <ResizablePanel defaultSize={65} minSize={50} className="flex flex-col min-h-0">
                    <Tabs
                        className="h-full gap-y-0"
                        defaultValue="preview"
                        value={tabState}
                        onValueChange={(value) => setTabState(value as 'code' | 'preview')}
                    >
                        <div className="w-full flex items-center p-2 border-b gap-x-2">
                            <TabsList className="h-8 p-0 border rounded-md">
                                <TabsTrigger
                                    value="preview"
                                    className="rounded-md"
                                    onClick={() => setTabState('preview')}
                                >
                                    <EyeIcon /> <span>Demo</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="code"
                                    className="rounded-md"
                                    onClick={() => setTabState('code')}
                                >
                                    <CodeIcon /> <span>Code</span>
                                </TabsTrigger>
                            </TabsList>
                            <div className="ml-auto flex items-center gap-x-2">
                                {!hasProAccess && (
                                    <Button asChild size="sm" variant="tertiary">
                                        <Link href="/pricing">
                                            <CrownIcon /> Upgrade
                                        </Link>
                                    </Button>
                                )}
                                <UserControl />
                            </div>
                        </div>
                        <TabsContent value="preview">
                            {!!activeFragment && <FragmentWeb data={activeFragment} />}
                        </TabsContent>
                        <TabsContent value="code" className="min-h-0">
                            {!!activeFragment?.files && (
                                <FileExplorer
                                    files={activeFragment.files as { [path: string]: string }}
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};

export default ProjectView;
