'use client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Suspense, useState } from 'react';
import MessagesContainer from '../components/messages-container';
import { Fragment } from '@/generated/prisma';
import ProjectHeader from '../components/project-header';
import FragmentWeb from '../components/fragment-web';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeIcon, CrownIcon, EyeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CodeView from '@/components/code-view';
import FileExplorer from '@/components/file-explorer';

type Props = {
    projectId: string;
};

const ProjectView = ({ projectId }: Props) => {
    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
    const [tabState, setTabState] = useState<'code' | 'preview'>('preview');

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0">
                    <Suspense fallback={<div>Loading project header...</div>}>
                        <ProjectHeader projectId={projectId} />
                    </Suspense>
                    <Suspense fallback={<div>Loading project details...</div>}>
                        <MessagesContainer
                            projectId={projectId}
                            activeFragment={activeFragment}
                            setActiveFragment={setActiveFragment}
                        />
                    </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
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
                                <Button asChild size="sm" variant="default">
                                    <Link href="/pricing">
                                        <CrownIcon /> Upgrade
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <TabsContent value="preview">
                            {!!activeFragment && <FragmentWeb data={activeFragment} />}
                        </TabsContent>
                        <TabsContent value="code" className='min-h-0'>
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
