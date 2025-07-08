import { useCallback, useMemo, useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import Hint from './hint';
import { Button } from './ui/button';
import { CopyIcon } from 'lucide-react';
import CodeView from './code-view';
import { convertFilesToTreeItems } from '@/lib/utils';

type FileCollection = { [path: string]: string };

function getLanguageFromExtension(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension || 'text';
}

type Props = {
    files: FileCollection;
};

const FileExplorer = ({ files }: Props) => {
    const [selectedFile, setSelectedFile] = useState<string | null>(() => {
        const fileKeys = Object.keys(files);
        if (fileKeys.length > 0) {
            return fileKeys[0];
        }
        return null;
    });

    const treeData = useMemo(() => {
        return convertFilesToTreeItems(files);
    }, [files]);

    const handleFileSelect = useCallback((filePath: string) => {
        if (files[filePath]) {
            setSelectedFile(filePath);
        }
    }, [files]);

    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} minSize={30} className="bg-sidebar">
                <TreeView data={treeData} value={selectedFile} onSelect={handleFileSelect} />
            </ResizablePanel>
            <ResizableHandle className="hover:bg-primary transition-colors" />
            <ResizablePanel defaultSize={70} minSize={50} className="flex flex-col bg-background">
                {selectedFile && files[selectedFile] ? (
                    <div className='h-full w-full flex flex-col'>
                        <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">
                            {/* TODO file breakcrumb */}
                            <Hint text='Copy to clipboard' side='bottom'>
                                <Button variant='outline' size='icon' className='ml-auto' onClick={() => {}} disabled={false}>
                                    <CopyIcon />
                                </Button>
                            </Hint>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <CodeView code={files[selectedFile]} lang={getLanguageFromExtension(selectedFile)} />
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Select a file to view it&apos;s content
                    </div>
                )}
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

export default FileExplorer;
